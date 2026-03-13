import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-transparent px-4 py-20 text-white selection:bg-primary/30">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-background/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            ZoneTV · Rejestracja
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
            Załóż konto
          </h1>
          <p className="text-sm text-muted-foreground">
            Dostęp do katalogu po zalogowaniu. Odtwarzanie treści wymaga aktywnej
            subskrypcji.
          </p>
        </div>

        <RegisterForm />

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-muted-foreground">
          <span>Masz konto?</span>
          <Link
            href="/auth/login"
            className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    </div>
  );
}
