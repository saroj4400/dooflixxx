"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { X, UserRound, LogOut, Bookmark, LoaderCircle, ChevronLeft } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

type View = "login" | "signup" | "otp" | "forgot" | "account" | "reset";

const inputClass = "w-full rounded-xl border border-white/10 bg-[#151519] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-red-500/70";
const buttonClass = "flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60";

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.7c3.9-3.6 6-8.8 6-14.9Z"/><path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5c-1.8 1.2-4.1 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"/><path fill="#4CAF50" d="M12.8 27.9a12 12 0 0 1 0-7.8v-5.2H5.9a20 20 0 0 0 0 18.2l6.9-5.2Z"/><path fill="#1976D2" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.9 14.9l6.9 5.2c1.6-4.7 6-8.2 11.2-8.2Z"/></svg>;
}

export function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, profile, passwordRecovery, clearPasswordRecovery, refreshProfile } = useAuth();
  const [view, setView] = useState<View>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpNow, setOtpNow] = useState(Date.now());
  const [otpPurpose, setOtpPurpose] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (passwordRecovery) {
      setView("reset");
      setMessage("");
      setError("");
    }
  }, [passwordRecovery]);

  useEffect(() => {
    if (open && !passwordRecovery) changeView(user ? "account" : "login");
    // Reset the dialog to the appropriate entry view each time it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  useEffect(() => {
    if (view !== "otp") return;
    const timer = window.setInterval(() => setOtpNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [view]);

  if (!open) return null;

  const changeView = (next: View) => {
    setView(next);
    setMessage("");
    setError("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!isSupabaseConfigured()) {
      setError("Account features are unavailable until Supabase is configured. Browsing and playback do not require it.");
      return;
    }
    setError("");
    setMessage("");
    const supabase = createClient();
    setBusy(true);
    try {
      if (view === "signup" || view === "login") {
        const purpose = view;
        if (purpose === "signup" && name.trim().length < 2) throw new Error("Enter your full name.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error("Enter a valid email address.");
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: purpose === "signup", ...(purpose === "signup" ? { data: { full_name: name.trim() } } : {}) },
        });
        if (authError) throw authError;
        setOtpPurpose(purpose);
        setOtp("");
        setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
        setView("otp");
        setMessage(`We sent a 6-digit verification code to ${email.trim()}. It expires in 10 minutes.`);
      } else if (view === "otp") {
        if (Date.now() >= otpExpiresAt) throw new Error("This code has expired. Request a new code to continue.");
        if (!/^\d{6}$/.test(otp)) throw new Error("Enter the 6-digit code from your email.");
        const { error: authError } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp, type: "email" });
        if (authError) {
          const lower = authError.message.toLowerCase();
          throw new Error(lower.includes("expired") ? "This code has expired. Request a new code to continue." : lower.includes("invalid") ? "That code is incorrect. Check the email and try again." : authError.message);
        }
        onClose();
      } else if (view === "forgot") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error("Enter a valid email address.");
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
        if (authError) throw authError;
        setMessage("If an account exists for that email, a password reset link is on its way.");
      } else if (view === "reset") {
        if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new Error("Use at least 8 characters, including a letter and a number.");
        if (password !== confirmPassword) throw new Error("Your passwords do not match.");
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        clearPasswordRecovery();
        setMessage("Your password has been updated.");
        setView("login");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    if (busy || Date.now() < otpExpiresAt - 9 * 60 * 1000) return;
    if (!isSupabaseConfigured()) {
      setError("Account features are unavailable until Supabase is configured.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { error: authError } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: otpPurpose === "signup", ...(otpPurpose === "signup" ? { data: { full_name: name.trim() } } : {}) },
      });
      if (authError) throw authError;
      setOtp("");
      setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
      setMessage(`A new 6-digit code was sent to ${email.trim()}. It expires in 10 minutes.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not resend the code. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = async () => {
    if (busy) return;
    if (!isSupabaseConfigured()) {
      setError("Account features are unavailable until Supabase is configured.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (authError) throw authError;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in could not be started.");
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    setError("");
    const { error: authError } = await createClient().auth.signOut();
    setBusy(false);
    if (authError) setError(authError.message);
    else onClose();
  };

  const saveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || name.trim().length < 2 || busy) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: profileError } = await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", user.id);
    if (profileError) {
      setError("Could not update your profile. Apply the Supabase profiles migration and try again.");
    } else {
      await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      await refreshProfile();
      setMessage("Your display name has been updated.");
    }
    setBusy(false);
  };

  const showAccount = Boolean(user) && view === "account";
  const metadataName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const displayName = profile?.full_name || metadataName || "Doomsplay member";
  const avatar = profile?.avatar_url || (typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : "");
  const title = showAccount ? "Your account" : view === "signup" ? "Create your account" : view === "otp" ? "Verify your email" : view === "forgot" ? "Reset your password" : view === "reset" ? "Choose a new password" : "Welcome to Doomsplay";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-md" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative my-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0d11] p-6 shadow-2xl shadow-black/60 sm:p-8">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"><X size={19} /></button>
        {showAccount ? (
          <>
            <div className="mb-6 flex items-center gap-4 pt-1">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-red-600/15 text-red-400">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound size={25} />}</div>
              <div className="min-w-0"><h2 id="auth-title" className="text-xl font-bold text-white">{displayName}</h2><p className="truncate text-sm text-zinc-400">{user?.email}</p></div>
            </div>
            {profile?.created_at || user?.created_at ? <p className="mb-5 text-xs text-zinc-500">Member since {new Date(profile?.created_at || user!.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p> : null}
            {error && <p role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            {message && <p role="status" className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p>}
            <form onSubmit={saveName} className="space-y-3">
              <label className="block text-xs font-medium text-zinc-400">Display name<input className={`${inputClass} mt-2`} value={name || displayName} onChange={(event) => setName(event.target.value)} minLength={2} required /></label>
              <button className={buttonClass} disabled={busy}>{busy ? <LoaderCircle size={17} className="animate-spin" /> : null}Save name</button>
            </form>
            <Link href="/my-list" onClick={onClose} className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/85 transition hover:bg-white/5"><Bookmark size={17} className="text-red-400" />My Watchlist</Link>
            <button type="button" onClick={signOut} disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 disabled:opacity-60"><LogOut size={17} />Log out</button>
          </>
        ) : (
          <>
            <div className="mb-6 pt-2"><p className="mb-2 text-[11px] font-bold uppercase tracking-[.25em] text-red-500">DOOMSPLAY</p><h2 id="auth-title" className="text-2xl font-bold tracking-tight text-white">{title}</h2><p className="mt-1 text-sm text-zinc-400">{view === "signup" ? "Join to keep your entertainment in one place." : view === "forgot" ? "We’ll email you a secure reset link." : view === "reset" ? "Your new password will secure your account." : "Sign in to your account to continue."}</p></div>
            {view !== "forgot" && view !== "reset" && view !== "otp" && <button type="button" onClick={googleLogin} disabled={busy} className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-60"><GoogleMark />Continue with Google</button>}
            {view !== "forgot" && view !== "reset" && view !== "otp" && <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-zinc-600"><span className="h-px flex-1 bg-white/10" />or continue with email<span className="h-px flex-1 bg-white/10" /></div>}
            {error && <p role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            {message && <p role="status" className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p>}
            <form onSubmit={submit} className="space-y-3">
              {view === "signup" && <label className="block text-xs font-medium text-zinc-400">Full name<input className={inputClass + " mt-2"} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required /></label>}
              {view !== "reset" && view !== "otp" && <label className="block text-xs font-medium text-zinc-400">Email address<input className={inputClass + " mt-2"} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>}
              {view === "otp" && <label className="block text-xs font-medium text-zinc-400">6-digit verification code<input className={inputClass + " mt-2 text-center tracking-[.4em]"} type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} required /></label>}
              {view === "reset" && <><label className="block text-xs font-medium text-zinc-400">New password<input className={inputClass + " mt-2"} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /><span className="mt-1 block text-[11px] text-zinc-500">At least 8 characters with a letter and a number.</span></label><label className="block text-xs font-medium text-zinc-400">Confirm password<input className={inputClass + " mt-2"} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label></>}
              <button className={buttonClass} disabled={busy || (view === "otp" && otpNow >= otpExpiresAt)}>{busy && <LoaderCircle size={17} className="animate-spin" />}{view === "signup" ? "Send verification code" : view === "otp" ? "Verify code" : view === "forgot" ? "Send reset link" : view === "reset" ? "Update password" : "Continue with email"}</button>
            </form>
            {view === "otp" && <div className="mt-4 flex items-center justify-between text-xs text-zinc-400"><span>{otpNow >= otpExpiresAt ? "Code expired" : `Code expires in ${Math.ceil((otpExpiresAt - otpNow) / 60000)} min`}</span><button type="button" onClick={resendOtp} disabled={busy || otpNow < otpExpiresAt - 9 * 60 * 1000} className="font-semibold text-red-400 disabled:text-zinc-600">{busy ? "Sending…" : "Resend code"}</button></div>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
              {view === "login" && <><button type="button" onClick={() => changeView("forgot")} className="text-zinc-400 transition hover:text-white">Forgot password?</button><button type="button" onClick={() => changeView("signup")} className="font-semibold text-red-400 hover:text-red-300">Create account</button></>}
              {view === "otp" && <button type="button" onClick={() => changeView(otpPurpose)} className="mx-auto inline-flex items-center gap-1 text-zinc-400 hover:text-white"><ChevronLeft size={15} />Change email</button>}
              {view === "signup" && <button type="button" onClick={() => changeView("login")} className="mx-auto text-zinc-400 hover:text-white">Already have an account? <span className="font-semibold text-red-400">Sign in</span></button>}
              {view === "forgot" && <button type="button" onClick={() => changeView("login")} className="mx-auto inline-flex items-center gap-1 text-zinc-400 hover:text-white"><ChevronLeft size={15} />Back to sign in</button>}
              {view === "reset" && <button type="button" onClick={() => changeView("login")} className="mx-auto text-zinc-400 hover:text-white">Back to sign in</button>}
            </div>
            {view === "reset" && <p className="mt-4 text-center text-[11px] text-zinc-600">Keep this page open from the password reset email link while updating your password.</p>}
          </>
        )}
      </section>
    </div>
  );
}

export function ProfileAction({ onClick }: { onClick: () => void }) {
  const { user, profile, loading } = useAuth();
  const avatar = profile?.avatar_url || (typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : "");
  return <button type="button" aria-label={loading ? "Loading profile" : user ? "Open account menu" : "Sign in or create account"} onClick={onClick} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/40 text-white/80 transition-all duration-200 hover:border-white/25 hover:bg-black/70 hover:text-white hover:scale-105 active:scale-95 backdrop-blur-md sm:h-10 sm:w-10">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound size={17} />}</button>;
}
