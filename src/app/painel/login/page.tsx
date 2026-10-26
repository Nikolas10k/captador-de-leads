import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/features/landing/site-chrome";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

const notices: Record<string, string> = {
  "sem-acesso": "Sua sessão terminou ou este usuário não tem acesso ao painel. Entre com uma conta autorizada.",
};

export default function LoginPage({ searchParams }: PageProps<"/painel/login">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Logo />
          <h1 className="text-2xl font-semibold tracking-tight">Entrar no painel</h1>
        </div>
        <Suspense fallback={<LoginForm />}>
          <LoginWithParams searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginWithParams({ searchParams }: { searchParams: PageProps<"/painel/login">["searchParams"] }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const erro = typeof params.erro === "string" ? params.erro : undefined;
  return <LoginForm next={next} notice={erro ? notices[erro] : undefined} />;
}
