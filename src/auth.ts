import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const AUTH_SECRET = process.env.AUTH_SECRET || "otter-pizza-dev-secret-change-in-production";

function getWhitelist(): Record<string, string> {
  const raw = process.env.GOOGLE_AUTH_WHITELIST || "{}";
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("[auth] Failed to parse GOOGLE_AUTH_WHITELIST:", e);
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
  session: {
    strategy: "jwt",
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email?.toLowerCase();
        if (!email) return false;

        const dbUser = await prisma.adminUser.findUnique({
          where: { email },
          select: { isActive: true },
        });

        if (dbUser?.isActive) return true;

        const whitelist = getWhitelist();
        return email in whitelist;
      }
      return false;
    },
    async jwt({ token, account, profile, trigger }) {
      if (account?.provider === "google" && profile?.email) {
        const email = profile.email.toLowerCase();
        const whitelist = getWhitelist();
        const role = whitelist[email] || "MANAGER";

        let dbUser = await prisma.adminUser.findUnique({ where: { email } });
        if (!dbUser) {
          dbUser = await prisma.adminUser.create({
            data: { email, name: profile.name || email, role, googleId: profile.sub },
          });
        } else {
          const updates: Record<string, unknown> = {};
          if (!dbUser.googleId) updates.googleId = profile.sub;
          if (dbUser.name !== profile.name && profile.name) updates.name = profile.name;
          if (Object.keys(updates).length > 0) {
            await prisma.adminUser.update({ where: { id: dbUser.id }, data: updates });
          }
        }

        if (!dbUser.isActive) {
          throw new Error("Account has been deactivated. Contact an administrator.");
        }

        token.userId = dbUser.id;
        token.role = dbUser.role;
        token.picture = profile.picture || profile.avatar_url;
      }

      // On session update (e.g., user profile changes), refresh from DB
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.adminUser.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId || token.sub || "");
        session.user.email = token.email || "";
        session.user.name = token.name || "";
        session.user.image = (token.picture as string) || null;
        (session.user as any).role = (token.role as string) || "MANAGER";
      }
      return session;
    },
  },
  pages: {
    error: "/admin/login",
  },
  trustHost: true,
});
