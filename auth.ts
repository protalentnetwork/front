import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "./lib/zod"
import type { User } from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });

          // Intentar parsear la respuesta como JSON
          let data;
          try {
            data = await response.json();
          } catch (e) {
            console.error('Error parsing response:', await response.text());
            return null;
          }

          if (!response.ok) {
            console.error('Auth error:', data);
            return null;
          }

          if (!data.user || !data.user.id || !data.user.email) {
            console.error('Invalid response format:', data);
            return null;
          }

          // Asegurarnos de que todos los campos requeridos estén presentes
          const user = {
            id: data.user.id.toString(),
            email: data.user.email,
            name: data.user.name ?? null,
            role: data.user.role ?? null
          } as User;

          return user;

        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'id' in user && 'email' in user) {
        token.id = user.id as string;
        token.role = user.role ?? null;
        token.name = user.name ?? null;
        token.email = user.email as string;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          role: token.role,
          name: token.name,
          email: token.email
        }
      };
    }
  }
})