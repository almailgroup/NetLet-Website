/**
 * Sign in / create account.
 *
 * Replaces the previous redirect to an external OAuth portal: credentials go to
 * NetLet's own `auth.login` / `auth.register`, which set an httpOnly session
 * cookie. Nothing token-shaped is ever held in JavaScript here.
 */
import { trpc } from "@/lib/trpc";
import { LoaderCircle, LogIn, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/useTranslation";
import { useOverlay } from "@/lib/useOverlay";

type Mode = "signin" | "register";

export default function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, tError } = useTranslation();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError("");
      // Focus the first field so the dialog is usable without reaching for the
      // mouse, and so screen readers land inside it rather than behind it.
      window.setTimeout(() => emailRef.current?.focus(), 40);
    }
  }, [open, mode]);

  useOverlay(open, onClose);

  const settle = async (displayName: string | null) => {
    await utils.auth.me.invalidate();
    toast.success(displayName ? t("auth.welcomeName", { name: displayName }) : t("auth.signedIn"));
    setPassword("");
    onClose();
  };

  const login = trpc.auth.login.useMutation({
    onSuccess: user => void settle(user.name),
    onError: err => setError(err.message),
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: user => void settle(user.name),
    onError: err => setError(err.message),
  });

  const pending = login.isPending || register.isPending;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "signin") login.mutate({ email, password });
    else register.mutate({ email, password, name: name.trim() || undefined });
  };

  if (!open) return null;

  const isRegister = mode === "register";

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#061b3b]/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="netlet-auth-title"
        className="glass w-full max-w-[420px] rounded-3xl p-6 !bg-[rgba(255,253,249,.94)] shadow-[0_24px_60px_rgba(10,40,90,.24)]"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="netlet-auth-title" className="display-face text-3xl text-[#0a285a]">
              {t(isRegister ? "auth.createTitle" : "auth.signInTitle")}
            </h2>
            <p className="type-label mt-1 text-[#536b8c]">
              {t(isRegister ? "auth.createNote" : "auth.signInNote")}
            </p>
          </div>
          <button onClick={onClose} aria-label={t("auth.close")} className="glass pressable grid size-9 shrink-0 place-items-center rounded-full">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {isRegister && (
            <label className="block">
              <span className="type-label text-[#0a285a]">{t("auth.name")} <span className="text-[#778ba6]">{t("auth.optional")}</span></span>
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                autoComplete="name"
                className="glass-field type-body mt-1.5 h-11 w-full rounded-xl px-4 outline-none"
              />
            </label>
          )}
          <label className="block">
            <span className="type-label text-[#0a285a]">{t("auth.email")}</span>
            <input
              ref={emailRef}
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              className="glass-field type-body mt-1.5 h-11 w-full rounded-xl px-4 outline-none"
            />
          </label>
          <label className="block">
            <span className="type-label text-[#0a285a]">{t("auth.password")}</span>
            <input
              type="password"
              dir="ltr"
              required
              minLength={10}
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="glass-field type-body mt-1.5 h-11 w-full rounded-xl px-4 outline-none"
            />
            {isRegister && <span className="type-label mt-1 block text-[#778ba6]">{t("auth.passwordHint")}</span>}
          </label>

          {/* aria-live so the failure is announced, not just drawn. */}
          {error && (
            <p role="alert" aria-live="polite" className="type-label rounded-xl bg-[#fdeceb] px-3 py-2 text-[#8c2f22]">
              {tError(error)}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="glass glass-navy pressable flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold disabled:opacity-60"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : isRegister ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}
            {t(isRegister ? "account.createAccount" : "header.signIn")}
          </button>
        </form>

        <p className="type-label mt-5 text-center text-[#536b8c]">
          {t(isRegister ? "auth.haveAccount" : "auth.newHere")}{" "}
          <button
            onClick={() => { setMode(isRegister ? "signin" : "register"); setError(""); }}
            className="font-extrabold text-[#f2683a] underline underline-offset-4"
          >
            {t(isRegister ? "header.signIn" : "auth.createOne")}
          </button>
        </p>
      </div>
    </div>
  );
}
