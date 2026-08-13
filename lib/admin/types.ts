/** Client-safe session shape — do not import Prisma runtime here. */

export type AdminSession = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}
