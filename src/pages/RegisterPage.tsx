import { useRef, useState, type FormEvent } from 'react';
import { ArrowRight, LockKeyhole, LoaderCircle, Mail, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoginInput from '../components/login/LoginInput';
import { registerUser } from '../services/authService';
import type { RegistrationData } from '../types/auth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const registrationErrorMessage =
  'Não foi possível efetuar o cadastro. Verifique os dados informados e tente novamente.';

type RegistrationErrors = Partial<Record<keyof RegistrationData, string>>;

type RegisterPageProps = {
  onRegistrationSuccess: (email: string) => void;
};

function RegisterPage({ onRegistrationSuccess }: RegisterPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const isSubmitting = useRef(false);

  function validate(): RegistrationErrors {
    const nextErrors: RegistrationErrors = {};

    if (!username.trim()) {
      nextErrors.username = 'Informe seu username.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Informe seu e-mail.';
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Informe um endereço de e-mail válido.';
    }

    if (!password) {
      nextErrors.password = 'Informe sua senha.';
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting.current) return;

    setFormError(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      onRegistrationSuccess(email.trim());
    } catch {
      setFormError(registrationErrorMessage);
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  }

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
        aria-labelledby="register-title"
        className="relative w-full max-w-[440px] animate-[fade-in_500ms_ease-out] rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_-32px_rgba(15,35,30,0.22)] backdrop-blur sm:p-10"
      >
        <header className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/15">
            <UserRound aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Espaço de trabalho
          </p>
          <h1
            className="mt-2 text-[26px] font-semibold tracking-tight text-slate-900 sm:text-3xl"
            id="register-title"
          >
            Criar sua conta
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Preencha seus dados para começar.
          </p>
        </header>

        <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
          <LoginInput
            autoComplete="username"
            error={errors.username}
            icon={UserRound}
            id="username"
            label="Username"
            name="username"
            onChange={(event) => {
              setUsername(event.target.value);
              if (errors.username) setErrors((current) => ({ ...current, username: undefined }));
            }}
            type="text"
            value={username}
          />

          <LoginInput
            autoComplete="email"
            error={errors.email}
            icon={Mail}
            id="email"
            label="E-mail"
            name="email"
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
            }}
            type="email"
            value={email}
          />

          <LoginInput
            autoComplete="new-password"
            error={errors.password}
            icon={LockKeyhole}
            id="register-password"
            label="Senha"
            name="password"
            onChange={(event) => {
              setPassword(event.target.value);
              if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
            }}
            type="password"
            value={password}
          />

          <div aria-live="polite" className="min-h-5">
            {isLoading ? (
              <p className="text-sm text-emerald-800" role="status">
                Criando sua conta...
              </p>
            ) : (
              formError && (
                <p className="rounded-lg bg-rose-50 px-3.5 py-3 text-sm text-rose-700" role="alert">
                  {formError}
                </p>
              )
            )}
          </div>

          <button
            aria-busy={isLoading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                Criar conta
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Já possui uma conta?{' '}
          <Link
            className="font-semibold text-emerald-800 underline-offset-4 transition hover:text-emerald-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            to="/login"
          >
            Entrar
          </Link>
        </p>
      </section>

      <p className="absolute bottom-4 px-4 text-center text-xs text-slate-400">
        Acesso seguro ao seu espaço de trabalho
      </p>
    </main>
  );
}

export default RegisterPage;
