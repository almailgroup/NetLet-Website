/**
 * NetLet database schema.
 *
 * Reconstructed from the application's own usage — `server/db.ts`, the customer
 * router, and `server/_core/sdk.ts` — after the original file was lost. Column
 * names, nullability, and every uniqueness constraint are pinned by real call
 * sites; widths and indexes are chosen to suit the data.
 *
 * Two constraints are load-bearing rather than cosmetic. `upsertUser` and
 * `upsertCustomerProfile` both rely on `onDuplicateKeyUpdate`, which only
 * behaves as an upsert when the row it collides with is caught by a unique
 * key — `users.open_id` and `customer_preferences.user_id` respectively.
 * `savedProducts` and `customerNotificationPreferences` depend on the same
 * mechanism through their composite uniques.
 *
 * varchar widths stay at or below 191 characters wherever a column is indexed:
 * on utf8mb4 that is the longest value that fits MySQL's 767-byte index prefix
 * on older InnoDB defaults.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { notificationKinds } from "../shared/customer";

/** Shoppers, keyed by the OAuth provider's stable subject identifier. */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Provider subject id. The upsert in `db.upsertUser` keys on this. */
    openId: varchar("open_id", { length: 191 }).notNull(),
    /** Profile fields are nullable: the provider may return none of them. */
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("login_method", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).notNull().default("user"),
    lastSignedIn: timestamp("last_signed_in").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  table => [uniqueIndex("users_open_id_unique").on(table.openId)]
);

/** One row per shopper: locale, delivery area, and the active Shopify cart. */
export const customerPreferences = mysqlTable(
  "customer_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    locale: mysqlEnum("locale", ["en", "ar"]).notNull().default("en"),
    /** Governorate id from `shared/customer.ts`; null until the shopper picks. */
    deliveryZoneId: varchar("delivery_zone_id", { length: 64 }),
    /** Opaque Shopify cart id, so a bag survives across devices. */
    shopifyCartId: varchar("shopify_cart_id", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  table => [uniqueIndex("customer_preferences_user_id_unique").on(table.userId)]
);

/** Saved ("wishlisted") products. The product id is the storefront handle/id. */
export const savedProducts = mysqlTable(
  "saved_products",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 191 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  table => [
    uniqueIndex("saved_products_user_product_unique").on(table.userId, table.productId),
    index("saved_products_user_id_idx").on(table.userId),
  ]
);

/** Per-shopper notification opt-ins, one row per notification kind. */
export const customerNotificationPreferences = mysqlTable(
  "customer_notification_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Kinds come from `shared/customer.ts` so the enum cannot drift. */
    kind: mysqlEnum("kind", notificationKinds).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  table => [
    uniqueIndex("customer_notification_user_kind_unique").on(table.userId, table.kind),
    index("customer_notification_user_id_idx").on(table.userId),
  ]
);

/**
 * Order tracking timeline. Only `userId` is pinned by existing code — the
 * account page reads the row count alone — so the remaining columns describe a
 * courier/order event in the ordinary way and are free to change as the real
 * order source is wired up.
 */
export const orderTrackingEvents = mysqlTable(
  "order_tracking_events",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Order this event belongs to, as identified by the upstream system. */
    orderReference: varchar("order_reference", { length: 191 }).notNull(),
    status: varchar("status", { length: 64 }).notNull(),
    /** Human-readable detail, e.g. a courier's note. */
    message: text("message"),
    /** When the event happened upstream, which is not when we recorded it. */
    occurredAt: timestamp("occurred_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  table => [
    index("order_tracking_user_id_idx").on(table.userId),
    index("order_tracking_user_occurred_idx").on(table.userId, table.occurredAt),
  ]
);

/* ------------------------------------------------------------- relations --- */

export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(customerPreferences),
  savedProducts: many(savedProducts),
  notificationPreferences: many(customerNotificationPreferences),
  orderTrackingEvents: many(orderTrackingEvents),
}));

export const customerPreferencesRelations = relations(customerPreferences, ({ one }) => ({
  user: one(users, { fields: [customerPreferences.userId], references: [users.id] }),
}));

export const savedProductsRelations = relations(savedProducts, ({ one }) => ({
  user: one(users, { fields: [savedProducts.userId], references: [users.id] }),
}));

export const customerNotificationPreferencesRelations = relations(
  customerNotificationPreferences,
  ({ one }) => ({
    user: one(users, { fields: [customerNotificationPreferences.userId], references: [users.id] }),
  })
);

export const orderTrackingEventsRelations = relations(orderTrackingEvents, ({ one }) => ({
  user: one(users, { fields: [orderTrackingEvents.userId], references: [users.id] }),
}));

/* ----------------------------------------------------------------- types --- */

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type CustomerPreference = typeof customerPreferences.$inferSelect;
export type InsertCustomerPreference = typeof customerPreferences.$inferInsert;

export type SavedProduct = typeof savedProducts.$inferSelect;
export type InsertSavedProduct = typeof savedProducts.$inferInsert;

export type CustomerNotificationPreference = typeof customerNotificationPreferences.$inferSelect;
export type InsertCustomerNotificationPreference = typeof customerNotificationPreferences.$inferInsert;

export type OrderTrackingEvent = typeof orderTrackingEvents.$inferSelect;
export type InsertOrderTrackingEvent = typeof orderTrackingEvents.$inferInsert;
