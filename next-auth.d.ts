import "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    role: string | null
    email: string
    name: string | null
  }

  interface Session {
    user: {
      id: string
      role: string | null
      email: string
      name: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string | null
    email: string
    name: string | null
  }
}