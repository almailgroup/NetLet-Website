import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  customerNotificationPreferences,
  customerPreferences,
  orderTrackingEvents,
  savedProducts,
  users,
  type User,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Creates an account. Returns null when the address is already registered,
 * rather than throwing, so the caller can answer without leaking which
 * addresses exist.
 *
 * `email` is lowercased here — the single place it is written — so the unique
 * index is case-insensitive regardless of the column's collation.
 */
export async function createUser(input: {
  email: string;
  passwordHash: string;
  name?: string | null;
}): Promise<User | null> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const email = input.email.trim().toLowerCase();
  if (await getUserByEmail(email)) return null;

  // The owner, if configured, is an admin from the moment they register.
  const role = ENV.ownerEmail && email === ENV.ownerEmail.trim().toLowerCase() ? "admin" : "user";

  try {
    await db.insert(users).values({
      email,
      passwordHash: input.passwordHash,
      name: input.name ?? null,
      role,
      lastSignedIn: new Date(),
    });
  } catch (error) {
    // Two concurrent registrations for one address: the unique index rejects
    // the loser, which is the correct outcome, not an error worth surfacing.
    if (isDuplicateKeyError(error)) return null;
    throw error;
  }

  return (await getUserByEmail(email)) ?? null;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "ER_DUP_ENTRY";
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  return rows[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function touchLastSignedIn(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export async function getCustomerProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(customerPreferences).where(eq(customerPreferences.userId, userId)).limit(1);
  return rows[0];
}

export async function upsertCustomerProfile(
  userId: number,
  patch: { locale?: "en" | "ar"; deliveryZoneId?: string | null; shopifyCartId?: string | null }
) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(customerPreferences).values({ userId, ...patch }).onDuplicateKeyUpdate({ set: patch });
  return getCustomerProfile(userId);
}

export async function listSavedProductIds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ productId: savedProducts.productId }).from(savedProducts).where(eq(savedProducts.userId, userId));
  return rows.map(row => row.productId);
}

export async function setSavedProduct(userId: number, productId: string, saved: boolean) {
  const db = await getDb();
  if (!db) return [];
  if (saved) {
    await db.insert(savedProducts).values({ userId, productId }).onDuplicateKeyUpdate({ set: { productId } });
  } else {
    await db.delete(savedProducts).where(and(eq(savedProducts.userId, userId), eq(savedProducts.productId, productId)));
  }
  return listSavedProductIds(userId);
}

export async function listNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerNotificationPreferences).where(eq(customerNotificationPreferences.userId, userId));
}

export async function setNotificationPreference(
  userId: number,
  kind: "price_drop" | "bag_reminder" | "new_arrival" | "delivery_update",
  enabled: boolean
) {
  const db = await getDb();
  if (!db) return [];
  await db.insert(customerNotificationPreferences).values({ userId, kind, enabled }).onDuplicateKeyUpdate({ set: { enabled } });
  return listNotificationPreferences(userId);
}

export async function listOrderTrackingEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderTrackingEvents).where(eq(orderTrackingEvents.userId, userId));
}
