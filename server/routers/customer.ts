import { z } from "zod";
import {
  getCustomerProfile,
  listNotificationPreferences,
  listOrderTrackingEvents,
  listSavedProductIds,
  setNotificationPreference,
  setSavedProduct,
  upsertCustomerProfile,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { kuwaitDeliveryZones, notificationKinds } from "../../shared/customer";

const zoneIdSchema = z.string().refine(value => kuwaitDeliveryZones.some(zone => zone.id === value), "Unknown delivery zone");
const notificationKindSchema = z.enum(notificationKinds);

export const customerRouter = router({
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getCustomerProfile(ctx.user.id);
      return profile ?? { locale: "en" as const, deliveryZoneId: null, shopifyCartId: null };
    }),
    update: protectedProcedure.input(z.object({
      locale: z.enum(["en", "ar"]).optional(),
      deliveryZoneId: zoneIdSchema.nullable().optional(),
      shopifyCartId: z.string().min(1).nullable().optional(),
    })).mutation(({ ctx, input }) => upsertCustomerProfile(ctx.user.id, input)),
  }),
  saved: router({
    list: protectedProcedure.query(({ ctx }) => listSavedProductIds(ctx.user.id)),
    set: protectedProcedure.input(z.object({ productId: z.string().min(1), saved: z.boolean() }))
      .mutation(({ ctx, input }) => setSavedProduct(ctx.user.id, input.productId, input.saved)),
  }),
  delivery: router({
    zones: protectedProcedure.query(() => kuwaitDeliveryZones),
  }),
  notifications: router({
    list: protectedProcedure.query(({ ctx }) => listNotificationPreferences(ctx.user.id)),
    set: protectedProcedure.input(z.object({ kind: notificationKindSchema, enabled: z.boolean() }))
      .mutation(({ ctx, input }) => setNotificationPreference(ctx.user.id, input.kind, input.enabled)),
  }),
  tracking: router({
    list: protectedProcedure.query(({ ctx }) => listOrderTrackingEvents(ctx.user.id)),
  }),
});
