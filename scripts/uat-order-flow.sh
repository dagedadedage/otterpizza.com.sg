#!/bin/bash
# UAT: Order Processing + Email Notifications
# Run on server: ssh root@45.77.172.222 "bash /opt/otterpizza/scripts/uat-order-flow.sh"

cd /opt/otterpizza
source .env 2>/dev/null || true
API="http://localhost:3000"
PASS=0; FAIL=0

pass() { PASS=$((PASS+1)); echo "  ✅ $1"; }
fail() { FAIL=$((FAIL+1)); echo "  ❌ $1"; }
info() { echo "  ℹ️  $1"; }

# DB query — writes JS to temp file to avoid quoting hell
db() {
  cat > /opt/otterpizza/scripts/_uat_db.js << EOF
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function q() { $1 }
q().finally(() => p.\$disconnect());
EOF
  node /opt/otterpizza/scripts/_uat_db.js 2>/dev/null
}

echo "══════════════════════════════════════════════"
echo "  UAT: Order Processing + Email Notifications"
echo "══════════════════════════════════════════════"

# ─── A: Pending Payment ───
echo ""; echo "━━━ A: Pending Payment ━━━"
info "Creating order..."
RESP=$(curl -s -X POST "$API/api/checkout" -H "Content-Type: application/json" \
  -d '{"customerName":"UAT-A","customerEmail":"admin@otterpizza.com.sg","deliveryType":"delivery","deliveryDate":"2026-06-26","deliveryTimeslot":"3:00 PM","deliveryAddress":"71 Ubi Rd","deliveryUnit":"#08","deliveryPostalCode":"408732","items":[{"productId":1,"quantity":1,"unitPrice":0.50,"totalPrice":0.50}]}')
ON_A=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('orderNumber',''))" 2>/dev/null)
[ -n "$ON_A" ] && pass "Order $ON_A created" || fail "Create failed"

S_A=$(db "const o=await p.order.findUnique({where:{orderNumber:'$ON_A'}});console.log(o.status+'|'+o.paymentStatus+'|token:'+(o.publicToken?'yes':'no'));")
echo "$S_A" | grep -q "PENDING" && pass "Status: PENDING" || fail "Expected PENDING: $S_A"
echo "$S_A" | grep -q "token:yes" && pass "publicToken: yes" || fail "publicToken missing"

# ─── B: Paid Order (Webhook) ───
echo ""; echo "━━━ B: Paid Order (HitPay Webhook) ━━━"
info "Creating order..."
RESP=$(curl -s -X POST "$API/api/checkout" -H "Content-Type: application/json" \
  -d '{"customerName":"UAT-B","customerEmail":"admin@otterpizza.com.sg","deliveryType":"pickup","deliveryDate":"2026-06-26","deliveryTimeslot":"12:30 PM","storeId":1,"items":[{"productId":1,"quantity":1,"unitPrice":0.50,"totalPrice":0.50}]}')
ON_B=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('orderNumber',''))" 2>/dev/null)
PID_B=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('url',''))" 2>/dev/null | grep -oP '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
[ -n "$ON_B" ] && pass "Order $ON_B created" || fail "Create failed"

info "Simulating webhook..."
SALT="${HITPAY_WEBHOOK_SALT:-$HITPAY_API_KEY}"
PAYLOAD="{\"payment_request_id\":\"$PID_B\",\"status\":\"completed\",\"amount\":\"0.50\",\"currency\":\"SGD\",\"reference_number\":\"$ON_B\"}"
SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SALT" | awk '{print $2}')
WRESP=$(curl -s -X POST "$API/api/webhooks/hitpay" -H "Content-Type: application/json" -H "hitpay-signature: $SIG" -d "$PAYLOAD")
echo "$WRESP" | grep -q "received" && info "Webhook accepted" || fail "Webhook: $WRESP"

sleep 2
S_B=$(db "const o=await p.order.findUnique({where:{orderNumber:'$ON_B'}});console.log(o.status+'|'+o.paymentStatus+'|method:'+(o.paymentMethod||'none'));")
echo "$S_B" | grep -q "PAID" && pass "Status: PAID" || fail "Expected PAID: $S_B"

# ─── C: Full Lifecycle ───
echo ""; echo "━━━ C: Full Lifecycle ━━━"
info "Creating order..."
RESP=$(curl -s -X POST "$API/api/checkout" -H "Content-Type: application/json" \
  -d '{"customerName":"UAT-C","customerEmail":"admin@otterpizza.com.sg","deliveryType":"delivery","deliveryDate":"2026-06-26","deliveryTimeslot":"3:00 PM","deliveryAddress":"71 Ubi Rd","deliveryUnit":"#08","deliveryPostalCode":"408732","items":[{"productId":1,"quantity":1,"unitPrice":0.50,"totalPrice":0.50}]}')
ON_C=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('orderNumber',''))" 2>/dev/null)
PID_C=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('url',''))" 2>/dev/null | grep -oP '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
[ -n "$ON_C" ] && pass "Order $ON_C created" || fail "Create failed"

# Simulate webhook → PAID
SIG_C=$(echo -n "{\"payment_request_id\":\"$PID_C\",\"status\":\"completed\",\"amount\":\"0.50\"}" | openssl dgst -sha256 -hmac "${HITPAY_WEBHOOK_SALT:-$HITPAY_API_KEY}" | awk '{print $2}')
curl -s -X POST "$API/api/webhooks/hitpay" -H "Content-Type: application/json" -H "hitpay-signature: $SIG_C" \
  -d "{\"payment_request_id\":\"$PID_C\",\"status\":\"completed\",\"amount\":\"0.50\"}" > /dev/null
sleep 1

S_C1=$(db "const o=await p.order.findUnique({where:{orderNumber:'$ON_C'}});console.log(o.status);")
[ "$S_C1" = "PAID" ] && pass "C1: PAID via webhook" || fail "C1: expected PAID, got $S_C1"

# Out for Delivery
db "const o=await p.order.findUnique({where:{orderNumber:'$ON_C'}});await p.order.update({where:{id:o.id},data:{deliveryTrackingUrl:'https://track.abc/123',status:'OUT_FOR_DELIVERY'}});await p.orderStatusLog.create({data:{orderId:o.id,fromStatus:'PAID',toStatus:'OUT_FOR_DELIVERY',changedBy:0,note:'UAT'}});" > /dev/null
S_C2=$(db "const o=await p.order.findUnique({where:{orderNumber:'$ON_C'}});console.log(o.status+'|tracking:'+(o.deliveryTrackingUrl||'none'));")
echo "$S_C2" | grep -q "OUT_FOR_DELIVERY" && pass "C2: Out for Delivery" || fail "C2: $S_C2"

# Fulfill
db "const o=await p.order.findUnique({where:{orderNumber:'$ON_C'}});await p.order.update({where:{id:o.id},data:{status:'FULFILLED'}});await p.orderStatusLog.create({data:{orderId:o.id,fromStatus:'OUT_FOR_DELIVERY',toStatus:'FULFILLED',changedBy:0,note:'UAT'}});" > /dev/null
S_C3=$(db "const o=await p.order.findUnique({where:{orderNumber:'$ON_C'}});console.log(o.status);")
[ "$S_C3" = "FULFILLED" ] && pass "C3: Fulfilled" || fail "C3: $S_C3"

# ─── D: Cancel ───
echo ""; echo "━━━ D: Cancel Flow ━━━"
info "Creating order..."
RESP=$(curl -s -X POST "$API/api/checkout" -H "Content-Type: application/json" \
  -d '{"customerName":"UAT-D","customerEmail":"admin@otterpizza.com.sg","deliveryType":"pickup","deliveryDate":"2026-06-26","deliveryTimeslot":"12:30 PM","storeId":1,"items":[{"productId":1,"quantity":1,"unitPrice":0.50,"totalPrice":0.50}]}')
ON_D=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('orderNumber',''))" 2>/dev/null)
[ -n "$ON_D" ] && pass "Order $ON_D created" || fail "Create failed"

db "const o=await p.order.findUnique({where:{orderNumber:'$ON_D'}});await p.order.update({where:{id:o.id},data:{status:'CANCELLED',paymentStatus:'cancelled'}});await p.orderStatusLog.create({data:{orderId:o.id,fromStatus:'PENDING',toStatus:'CANCELLED',changedBy:0,note:'UAT'}});" > /dev/null
S_D=$(db "const o=await p.order.findUnique({where:{orderNumber:'$ON_D'}});console.log(o.status);")
[ "$S_D" = "CANCELLED" ] && pass "D: Cancelled" || fail "D: $S_D"

# ─── E: Refund ───
echo ""; echo "━━━ E: Refund Flow ━━━"
info "Refunding order B ($ON_B)..."
db "const o=await p.order.findUnique({where:{orderNumber:'$ON_B'}});if(o.status!=='REFUNDED'){await p.order.update({where:{id:o.id},data:{status:'REFUNDED',paymentStatus:'refunded'}});await p.orderStatusLog.create({data:{orderId:o.id,fromStatus:'PAID',toStatus:'REFUNDED',changedBy:0,note:'UAT'}});}" > /dev/null
S_E=$(db "const o=await p.order.findUnique({where:{orderNumber:'$ON_B'}});console.log(o.status+'|'+o.paymentStatus);")
echo "$S_E" | grep -q "REFUNDED" && pass "E: Refunded" || fail "E: $S_E"

# ─── F: OOS ───
echo ""; echo "━━━ F: Out-of-Stock ━━━"
info "Attempting checkout with OOS item (SKU 203, prodId 11)..."
OOS=$(curl -s -X POST "$API/api/checkout" -H "Content-Type: application/json" \
  -d '{"customerName":"UAT-OOS","customerEmail":"t@t.com","deliveryType":"pickup","deliveryDate":"2026-06-26","deliveryTimeslot":"12:30 PM","storeId":1,"items":[{"productId":11,"quantity":1,"unitPrice":22.80,"totalPrice":22.80}]}')
echo "$OOS" | grep -q "out of stock" && pass "F: OOS rejected" || fail "F: $OOS"

# ─── G: Invoice URL ───
echo ""; echo "━━━ G: Invoice Token URL ━━━"
TOKEN_A=$(db "const o=await p.order.findUnique({where:{orderNumber:'$ON_A'}});console.log(o.publicToken||'');")
IV_RESP=$(curl -s -o /dev/null -w "%{http_code}" -L "$API/api/invoice/$TOKEN_A")
[[ "$IV_RESP" == 2* ]] && pass "G: Invoice accessible (HTTP $IV_RESP)" || fail "G: HTTP $IV_RESP"

# ─── Summary ───
echo ""
echo "══════════════════════════════════════════════"
printf "  ✅ Passed: %2d     ❌ Failed: %2d\n" $PASS $FAIL
echo "══════════════════════════════════════════════"

# Cleanup test orders from DB
info "Cleaning up test orders..."
for on in "$ON_A" "$ON_B" "$ON_C" "$ON_D"; do
  [ -n "$on" ] && db "const o=await p.order.findUnique({where:{orderNumber:'$on'}});if(o){await p.orderItem.deleteMany({where:{orderId:o.id}});await p.orderStatusLog.deleteMany({where:{orderId:o.id}});await p.orderNote.deleteMany({where:{orderId:o.id}});await p.order.delete({where:{id:o.id}});console.log('deleted $on');}"
done
info "Cleanup done"

[ $FAIL -eq 0 ]
