import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { signToken, verifyToken } from "@/lib/auth";

const AUTH_SECRET = process.env.AUTH_SECRET || "otter-pizza-dev-secret-change-in-production";

function getWhitelist(): Record<string, string> {
  const raw = process.env.GOOGLE_AUTH_WHITELIST || "{}";
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("[auth] Failed to parse GOOGLE_AUTH_WHITELIST:", e);
    console.error("[auth] Raw value:", raw);
    return {};
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email?.toLowerCase();
        if (!email) return false;

        // Check if user exists and is active in the database
        const dbUser = await prisma.adminUser.findUnique({
          where: { email },
          select: { isActive: true },
        });

        // If user exists in DB and is active, allow sign-in
        if (dbUser?.isActive) return true;

        // Fallback: check whitelist env var for first-time sign-in
        const whitelist = getWhitelist();
        return email in whitelist;
      }
      return false;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const email = profile.email.toLowerCase();
        const whitelist = getWhitelist();
        const role = whitelist[email] || "MANAGER";

        // Find or create AdminUser in DB
        let dbUser = await prisma.adminUser.findUnique({ where: { email } });
        if (!dbUser) {
          dbUser = await prisma.adminUser.create({
            data: {
              email,
              name: profile.name || email,
              role,
              googleId: profile.sub,
            },
          });
        } else {
          // Update googleId and name on each login
          const updates: Record<string, unknown> = {};
          if (!dbUser.googleId) updates.googleId = profile.sub;
          if (dbUser.name !== profile.name && profile.name) updates.name = profile.name;
          if (Object.keys(updates).length > 0) {
            dbUser = await prisma.adminUser.update({
              where: { id: dbUser.id },
              data: updates,
            });
          }
        }

        if (!dbUser.isActive) {
          throw new Error("Account has been deactivated. Contact an administrator.");
        }

        token.userId = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.role = dbUser.role;
        token.picture = profile.picture || profile.avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId || "");
        session.user.email = (token.email as string) || "";
        session.user.name = (token.name as string) || "";
        session.user.image = (token.picture as string) || null;
        (session.user as unknown as Record<string, unknown>).role =
          (token.role as string) || "MANAGER";
      }
      return session;
    },
  },
  jwt: {
    maxAge: 15 * 24 * 60 * 60, // 15 days
    // Use our existing JWT format so verifyToken() can decode the session cookie
    encode({ token }) {
      return signToken({
        userId: (token?.userId as number) || 0,
        email: (token?.email as string) || "",
        name: (token?.name as string) || "",
        role: (token?.role as string) || "MANAGER",
      });
    },
    decode({ token }) {
      if (!token) return null;
      const payload = verifyToken(token);
      if (!payload) return null;
      const now = Math.floor(Date.now() / 1000);
      return {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        sub: String(payload.userId),
        iat: now,
        exp: now + 15 * 24 * 60 * 60, // 15 days
      };
    },
  },
  cookies: {
    sessionToken: {
      name: "otter-admin-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
  useSecureCookies: false, // We handle HTTPS via Nginx; prevents __Secure- prefix mismatch
  pages: {
    error: "/admin/login",
  },
});
