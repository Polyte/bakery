import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import { promisify } from "util"

const scrypt = promisify(scryptCallback)

export const SESSION_COOKIE = "dadda_session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30

export type AccountProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
}

type StoredUser = AccountProfile & {
  passwordHash: string
  createdAt: string
}

type SessionPayload = {
  id: string
  email: string
  exp: number
}

const dataDir = path.join(process.cwd(), ".data")
const usersFile = path.join(dataDir, "users.json")

let writeQueue: Promise<unknown> = Promise.resolve()
let devSecret: string | undefined

function getSessionSecret() {
  const fromEnv = process.env.SESSION_SECRET?.trim()
  if (fromEnv) return fromEnv
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.")
  }
  if (!devSecret) {
    devSecret = randomBytes(32).toString("hex")
    console.warn("SESSION_SECRET is unset; using a random in-memory secret for this process.")
  }
  return devSecret
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function publicProfile(user: AccountProfile): AccountProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  }
}

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(usersFile, "utf8")
    const parsed = JSON.parse(raw) as { users?: StoredUser[] } | StoredUser[]
    if (Array.isArray(parsed)) return parsed
    return Array.isArray(parsed.users) ? parsed.users : []
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === "ENOENT") return []
    throw error
  }
}

async function writeUsers(users: StoredUser[]) {
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(usersFile, `${JSON.stringify({ users }, null, 2)}\n`, "utf8")
}

function withStore<T>(fn: (users: StoredUser[]) => Promise<{ users: StoredUser[]; result: T }>) {
  const run = writeQueue.then(async () => {
    const users = await readUsers()
    const next = await fn(users)
    await writeUsers(next.users)
    return next.result
  })
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const hash = (await scrypt(password, salt, 64)) as Buffer
  return `${salt.toString("hex")}:${hash.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":")
  if (!saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, "hex")
  const expected = Buffer.from(hashHex, "hex")
  const actual = (await scrypt(password, salt, 64)) as Buffer
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

export async function createUser(input: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}) {
  const email = normalizeEmail(input.email)
  const passwordHash = await hashPassword(input.password)
  return withStore(async (users) => {
    if (users.some((user) => user.email === email)) {
      const error = new Error("EMAIL_TAKEN")
      error.name = "EMAIL_TAKEN"
      throw error
    }
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    return { users: [...users, user], result: publicProfile(user) }
  })
}

let dummyPasswordHash: string | undefined

async function dummyHash() {
  dummyPasswordHash ??= await hashPassword("timing-pad")
  return dummyPasswordHash
}

export async function authenticateUser(email: string, password: string) {
  const users = await readUsers()
  const user = users.find((entry) => entry.email === normalizeEmail(email))
  const ok = await verifyPassword(password, user?.passwordHash ?? (await dummyHash()))
  return user && ok ? publicProfile(user) : null
}

export async function findUserById(id: string) {
  const users = await readUsers()
  const user = users.find((entry) => entry.id === id)
  return user ? publicProfile(user) : null
}

export function signSession(user: AccountProfile) {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const sig = createHmac("sha256", getSessionSecret()).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function readSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null
  const [body, sig] = token.split(".")
  if (!body || !sig) return null
  const expected = createHmac("sha256", getSessionSecret()).update(body).digest("base64url")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload
    if (!payload.id || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
