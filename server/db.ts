import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  customerNotificationPreferences,
  customerPreferences,
  InsertUser,
  orderTrackingEvents,
  savedProducts,
  users,
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
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
