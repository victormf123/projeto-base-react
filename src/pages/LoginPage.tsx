import { LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/login/LoginForm';

type LoginPageProps = {
  onLoginSuccess?: (details: { identifier: string; rememberMe: boolean }) => void;
};

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/70 via-slate-50 to-slate-100 px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 bottom-0 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl"
      />

      <section
        aria-labelledby="login-title"
        className="relative w-full max-w-[440px] animate-[fade-in_500ms_ease-out] rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_-32px_rgba(15,35,30,0.22)] backdrop-blur sm:p-10"
      >
        <header className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/15">
            <LockKeyhole aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Espaço de trabalho
          </p>
          <h1
            className="mt-2 text-[26px] font-semibold tracking-tight text-slate-900 sm:text-3xl"
            id="login-title"
          >
            Boas-vindas de volta
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Entre com seus dados para continuar.
          </p>
        </header>

        <LoginForm onLoginSuccess={onLoginSuccess} />
        <p className="mt-6 text-center text-sm text-slate-600">
          Não possui uma conta?{' '}
          <Link
            className="font-semibold text-emerald-800 underline-offset-4 transition hover:text-emerald-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            to="/register"
          >
            Cadastre-se
          </Link>
        </p>
      </section>

      <p className="absolute bottom-4 px-4 text-center text-xs text-slate-400">
        Acesso seguro ao seu espaço de trabalho
      </p>
    </main>
  );
}

export default LoginPage;
