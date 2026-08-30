import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useCustomer } from "@/contexts/CustomerContext";
import { trpc } from "@/lib/trpc";
import { defaultNotificationPreferences, kuwaitDeliveryZones, notificationKinds, notificationLabels, type NotificationKind } from "@shared/customer";
import { Bell, ChevronRight, Heart, LogIn, LogOut, MapPin, PackageSearch, ShoppingBag, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";

const logoImage = "/manus-storage/netlet-logo-transparent_3d66ed60.png";

function AccountCard({ icon, title, children, className = "" }: { icon: ReactNode; title: string; children: ReactNode; className?: string }) {
  return <article className={`rounded-[1.35rem] border border-[#d5dfeb] bg-white p-5 ${className}`}><div className="grid size-10 place-items-center rounded-xl bg-[#e7edf5] text-[#0a285a]">{icon}</div><h2 className="type-product mt-4 text-lg">{title}</h2>{children}</article>;
}

export default function Account() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { deliveryZone, deliveryZoneId, savedIds, setDeliveryZoneId } = useCustomer();
  const notifications = trpc.customer.notifications.list.useQuery(undefined, { enabled: isAuthenticated });
  const tracking = trpc.customer.tracking.list.useQuery(undefined, { enabled: isAuthenticated });
  const setNotification = trpc.customer.notifications.set.useMutation({
    onSuccess: () => notifications.refetch(),
    onError: () => toast.error("That preference could not be saved right now."),
  });
  const storedPreferences = new Map((notifications.data ?? []).map(item => [item.kind as NotificationKind, item.enabled]));

  return (
    <main className="min-h-screen bg-[#f3f2ed] pb-8 text-[#0a285a]">
      <header className="border-b border-[#d5dfeb] bg-[#f3f2ed]/95 backdrop-blur-xl"><div className="container flex h-[76px] items-center justify-between gap-4"><a href="/" className="flex items-center" aria-label="Back to NetLet home"><img src={logoImage} alt="NetLet" className="h-11 w-auto max-w-[140px] object-contain" /></a><a href="/" className="type-control pressable flex items-center gap-1.5 rounded-full border border-[#d5dfeb] bg-white px-4 py-2 text-[#0a285a] hover:bg-[#e7edf5]">Continue shopping <ChevronRight className="size-4" /></a></div></header>

      <section className="container max-w-5xl py-10 sm:py-14"><p className="type-label text-[#f2683a]">NETLET ACCOUNT</p>{loading ? <div className="mt-4 h-12 w-64 animate-pulse rounded-xl bg-[#dce5e9]" /> : <h1 className="type-display mt-3 text-4xl text-[#0a285a] sm:text-5xl">{isAuthenticated ? `Welcome back${user?.name ? `, ${user.name}` : ""}.` : "Your account, your way."}</h1>}<p className="type-body mt-4 max-w-xl text-[#536b8c]">Keep delivery, saved finds, and future order updates in one considered place.</p>

        {!loading && !isAuthenticated ? <section className="mt-9 rounded-[1.5rem] border border-[#d5dfeb] bg-white p-6 shadow-[0_12px_30px_rgba(10,40,90,.06)] sm:p-8"><div className="grid size-12 place-items-center rounded-2xl bg-[#e7edf5]"><UserRound className="size-6 text-[#0a285a]" /></div><h2 className="type-product mt-5 text-xl text-[#0a285a]">Sign in or create your NetLet account</h2><p className="type-body mt-2 max-w-lg text-[#536b8c]">Your guest bag and saved finds stay in this browser. Sign in to sync eligible preferences between your devices.</p><div className="mt-6 flex flex-wrap gap-3"><button id="netlet-auth-login" onClick={() => startLogin()} className="type-control pressable inline-flex items-center gap-2 rounded-full bg-[#0a285a] px-5 py-3 text-white hover:bg-[#f2683a]"><LogIn className="size-4" /> Sign in</button><button id="netlet-auth-signup" onClick={() => startLogin()} className="type-control pressable inline-flex items-center gap-2 rounded-full border border-[#d5dfeb] bg-white px-5 py-3 text-[#0a285a] hover:bg-[#e7edf5]"><UserPlus className="size-4" /> Create account</button></div></section> : null}

        {!loading && isAuthenticated ? <div className="mt-9 space-y-5"><section className="grid gap-4 lg:grid-cols-3"><AccountCard icon={<Heart className="size-5" />} title="Saved finds"><p className="type-body mt-1 text-sm text-[#536b8c]">{savedIds.length ? `${savedIds.length} saved item${savedIds.length === 1 ? "" : "s"} sync with your account.` : "Save products from the catalog to keep them ready here."}</p><a href="/" className="mt-4 inline-flex text-xs font-extrabold text-[#f2683a] underline underline-offset-4">Browse saved finds</a></AccountCard><AccountCard icon={<MapPin className="size-5" />} title="Delivery area"><p className="type-body mt-1 text-sm text-[#536b8c]">{deliveryZone ? `${deliveryZone.label} selected.` : "Choose a Kuwait governorate to prepare checkout."}</p><label className="type-label mt-4 block text-[#0a285a]">Governorate<select value={deliveryZoneId ?? ""} onChange={event => setDeliveryZoneId(event.target.value)} className="type-body mt-2 h-10 w-full rounded-xl border border-[#d5dfeb] bg-[#f3f2ed] px-3 text-[#0a285a]"><option value="" disabled>Select your governorate</option>{kuwaitDeliveryZones.map(zone => <option key={zone.id} value={zone.id}>{zone.label}</option>)}</select></label><p className="mt-3 text-[10px] font-semibold leading-4 text-[#778ba6]">Delivery pricing and ETA remain unconfigured.</p></AccountCard><AccountCard icon={<PackageSearch className="size-5" />} title="Order tracking"><p className="type-body mt-1 text-sm text-[#536b8c]">{tracking.data?.length ? `${tracking.data.length} tracking update${tracking.data.length === 1 ? "" : "s"} available.` : "No connected order source yet."}</p><p className="mt-4 text-[10px] font-semibold leading-4 text-[#778ba6]">Updates will appear after NetLet connects an order or courier source; no tracking is being simulated.</p></AccountCard></section>

          <section className="rounded-[1.5rem] border border-[#d5dfeb] bg-white p-5 sm:p-7"><div className="flex gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0ab] text-[#0a285a]"><Bell className="size-5" /></div><div><p className="type-product text-lg">Notification preferences</p><p className="type-body mt-1 text-sm text-[#536b8c]">Choose the kinds of alerts you want to receive. Device enrollment and event delivery are not connected yet, so these settings are saved as preferences only.</p></div></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{notificationKinds.map(kind => { const enabled = storedPreferences.get(kind) ?? defaultNotificationPreferences[kind]; return <label key={kind} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#d5dfeb] bg-[#f3f2ed] px-4 py-3 text-sm font-bold text-[#0a285a]"><span>{notificationLabels[kind]}</span><input type="checkbox" checked={enabled} disabled={setNotification.isPending} onChange={event => setNotification.mutate({ kind, enabled: event.target.checked })} className="size-4 accent-[#f2683a]" /></label>; })}</div></section>

          <button onClick={() => void logout()} className="type-control pressable inline-flex items-center gap-2 rounded-full border border-[#d5dfeb] bg-white px-5 py-3 text-[#0a285a] hover:bg-[#e7edf5]"><LogOut className="size-4" /> Sign out</button></div> : null}

        <div className="mt-10 flex items-center gap-2 rounded-2xl bg-[#e7edf5] px-5 py-4 text-sm text-[#536b8c]"><ShoppingBag className="size-5 shrink-0 text-[#f2683a]" /> Your shopping bag remains available from the NetLet storefront, without payment processing.</div>
      </section>
    </main>
  );
}
