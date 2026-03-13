"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, User, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 1;
  return Math.min(score, 5);
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);

  useEffect(() => {
    setCaptchaA(Math.floor(1 + Math.random() * 5));
    setCaptchaB(Math.floor(1 + Math.random() * 5));
    setMounted(true);
  }, []);

  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const pwScore = scorePassword(password);

  const strengthLabel =
    pwScore <= 1
      ? "Słabe"
      : pwScore === 2
        ? "Średnie"
        : pwScore === 3
          ? "Dobre"
          : pwScore === 4
            ? "Bardzo dobre"
            : "Mocne";

  const strengthColor =
    pwScore <= 1
      ? "bg-red-500/70"
      : pwScore === 2
        ? "bg-amber-500/70"
        : pwScore === 3
          ? "bg-yellow-500/70"
          : pwScore === 4
            ? "bg-emerald-500/70"
            : "bg-emerald-400";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agree) {
      setError("Zaznacz zgodę na regulamin, aby kontynuować.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          captchaA,
          captchaB,
          captchaAnswer: Number(captchaAnswer || 0),
          company: "",
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error?: string };

      if (!res.ok || !data || (data as { ok?: boolean }).ok !== true) {
        setError((data as { error?: string })?.error ?? "Rejestracja nie powiodła się.");
        return;
      }

      router.push("/auth/login?registered=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const inputWrapperClass =
    "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30";
  const inputClass =
    "h-auto flex-1 border-0 bg-transparent p-0 text-sm text-white placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-white/95">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Nazwa użytkownika
        </label>
        <div className={inputWrapperClass}>
          <User className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="4–8 znaków, tylko litery i cyfry"
            required
            minLength={4}
            maxLength={8}
            pattern="[A-Za-z0-9]{4,8}"
            className={inputClass}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Login widoczny w ZoneTV. Dozwolone tylko litery i cyfry, 4–8 znaków.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Email
        </label>
        <div className={inputWrapperClass}>
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="zonetv@o2.pl"
            required
            className={inputClass}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Potwierdzanie adresu e-mail dodamy po wdrożeniu na hosting i domenę.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Hasło
        </label>
        <div className={inputWrapperClass}>
          <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPw ? "text" : "password"}
            placeholder="Minimum 8 znaków"
            required
            minLength={8}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="shrink-0 text-muted-foreground transition-colors hover:text-white"
            aria-label="Pokaż/ukryj hasło"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Siła hasła</span>
            <span className="font-medium text-white/80">{strengthLabel}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-300 ${strengthColor}`}
              style={{ width: `${(pwScore / 5) * 100}%` }}
            />
          </div>
          <ul className="grid gap-1 text-[11px] text-muted-foreground">
            <li>• Minimum 8 znaków</li>
            <li>• Zalecane: wielka litera, cyfra, znak specjalny</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Powtórz hasło
        </label>
        <div
          className={
            passwordsMismatch
              ? `${inputWrapperClass} border-red-500/50 focus-within:border-red-500/50 focus-within:ring-red-500/30`
              : inputWrapperClass
          }
        >
          <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showPw2 ? "text" : "password"}
            required
            minLength={8}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPw2((v) => !v)}
            className="shrink-0 text-muted-foreground transition-colors hover:text-white"
            aria-label="Pokaż/ukryj hasło"
          >
            {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordsMismatch && (
          <p className="text-[11px] text-red-400">Hasła nie są zgodne.</p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground transition-colors hover:bg-white/[0.07]">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-primary"
        />
        <span>
          Akceptuję regulamin i politykę prywatności (wersja robocza na etapie
          developmentu).
        </span>
      </label>

      <div className="space-y-2 text-xs">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Weryfikacja
        </p>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white">
            Ile to {mounted ? captchaA : "?"} + {mounted ? captchaB : "?"}?
          </span>
          <Input
            id="captcha-answer"
            inputMode="numeric"
            pattern="[0-9]*"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            className="h-9 w-20 rounded-lg border-white/10 bg-white/5 text-center text-white focus-visible:ring-primary/50"
            required
            disabled={!mounted}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full rounded-full bg-primary font-bold uppercase tracking-wide shadow-[0_0_30px_-8px_rgba(229,9,20,0.5)] transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
      >
        <ShieldCheck className="h-4 w-4" />
        {loading ? "Tworzenie konta…" : "Załóż konto"}
      </Button>

      <input
        tabIndex={-1}
        autoComplete="off"
        name="company"
        className="hidden"
        value=""
        readOnly
        aria-hidden
      />
    </form>
  );
}
