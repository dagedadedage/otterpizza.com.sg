"use client";

import { cn } from "@/lib/utils";
import { getStatusColor } from "./OrderStatusBadge";
import { CheckCircle2, Circle } from "lucide-react";

interface StatusLogEntry {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  changedBy: number;
  note: string | null;
  createdAt: string;
}

interface OrderTimelineProps {
  statusLogs: StatusLogEntry[];
}

export function OrderTimeline({ statusLogs }: OrderTimelineProps) {
  if (!statusLogs || statusLogs.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        No status updates recorded yet.
      </div>
    );
  }

  // Reverse so oldest is at top
  const logs = [...statusLogs].reverse();

  return (
    <div className="relative">
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;
        const formattedDate = new Date(log.createdAt).toLocaleString("en-SG", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div key={log.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
            )}

            {/* Dot */}
            <div className="relative flex-shrink-0">
              {isLast ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <Circle
                  className={cn(
                    "w-6 h-6",
                    getStatusColor(log.toStatus).replace("bg-", "text-")
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-dark">
                  {log.fromStatus
                    ? `${log.fromStatus} → ${log.toStatus}`
                    : log.toStatus}
                </span>
                <span className="text-xs text-muted">{formattedDate}</span>
              </div>
              {log.note && (
                <p className="mt-1 text-sm text-muted">{log.note}</p>
              )}
              <p className="text-xs text-muted/60 mt-0.5">
                Changed by user #{log.changedBy}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
