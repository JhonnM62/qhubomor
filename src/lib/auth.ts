import { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { env } from "./env";
import { compare } from "bcrypt";
import { sincronizarUsuarioCliente } from "./erp-client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Email y contraseña",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.passwordHash) return null;
        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image } as any;
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = (user as any).id ?? token.sub;
      // attach role on every jwt call
      if (token.userId) {
        try {
          const u = await prisma.user.findUnique({ where: { id: String(token.userId) }, include: { role: true } });
          (token as any).role = u?.role?.name ?? "USER";
        } catch (e) { console.error("Error fetching user role", e); }
      }
      // Sincronizar automáticamente con el ERP y obtener código único de cliente (máx 6 dígitos)
      if (token.email && !(token as any).codigoCliente) {
        try {
          const syncRes = await sincronizarUsuarioCliente({
            email: token.email,
            nombre: token.name || undefined,
          });
          if (syncRes.success && syncRes.cliente?.IDcliente) {
            (token as any).codigoCliente = syncRes.cliente.IDcliente;
          }
        } catch (e) {
          console.error("Error al sincronizar cliente en ERP desde NextAuth:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).userId = token.userId;
      (session as any).role = (token as any).role;
      (session as any).codigoCliente = (token as any).codigoCliente;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Si la URL es relativa
      if (url.startsWith("/")) {
        // Si va a /games por defecto antiguo, dirigirlo a fidelidad
        if (url === "/games") return `${baseUrl}/fidelidad?bienvenida=true`;
        return `${baseUrl}${url}`;
      }
      // Si es el mismo origen
      else if (new URL(url).origin === baseUrl) {
        if (new URL(url).pathname === "/games") return `${baseUrl}/fidelidad?bienvenida=true`;
        return url;
      }
      return `${baseUrl}/fidelidad?bienvenida=true`;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);
