import { object, string } from "zod"
 
export const signInSchema = object({
  email: string()
    .min(1, "Email es requerido")
    .email("Email inválido")
    .trim()
    .toLowerCase(),
  password: string()
    .min(1, "Contraseña es requerida")
    .min(8, "Contraseña debe tener al menos 8 caracteres")
})