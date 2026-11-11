import { useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import LoginInput from './LoginInput';
import { authenticate } from '../../services/authService';
import type { LoginErrors } from '../../types/auth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginFormProps = {
  onLoginSuccess?: (details: { identifier: string; rememberMe: boolean }) => void;
};

type FormFeedback = {
  kind: 'success' | 'error';
  message: string;
};

function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formFeedback, setFormFeedback] = useState<FormFeedback | null>(null);
  const isSubmitting = useRef(false);

  function validate(): LoginErrors {
    const nextErrors: LoginErrors = {};
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      nextErrors.identifier = 'Informe seu e-mail ou usuário.';
    } else if (trimmedIdentifier.includes('@') && !emailPattern.test(trimmedIdentifier)) {
      nextErrors.identifier = 'Informe um endereço de e-mail válido.';
    }

    if (!password) {
      nextErrors.password = 'Informe sua senha.';
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting.current) return;

    setFormFeedback(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      await authenticate({
        identifier: identifier.trim(),
        password,
        rememberMe,
      });
      onLoginSuccess?.({ identifier: identifier.trim(), rememberMe });
      setFormFeedback({
        kind: 'success',
        message:
          'Autenticação simulada concluída. Conecte o serviço a uma API para habilitar o acesso.',
      });
    } catch {
      setFormFeedback({
        kind: 'error',
        message: 'Não foi possível entrar. Tente novamente em instantes.',
      });
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
      <LoginInput
        autoComplete="username"
        error={errors.identifier}
        icon={Mail}
        id="identifier"
        label="E-mail ou usuário"
        name="identifier"
        onChange={(event) => {
          setIdentifier(event.target.value);
          if (errors.identifier) setErrors((current) => ({ ...current, identifier: undefined }));
        }}
        type="text"
        value={identifier}
      />

      <LoginInput
        autoComplete="current-password"
        error={errors.password}
        icon={LockKeyhole}
        id="password"
        label="Senha"
        labelAccessory={
          <a
            className="rounded text-sm font-medium text-emerald-800 underline-offset-4 transition hover:text-emerald-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            href="mailto:suporte@example.com?subject=Recupera%C3%A7%C3%A3o%20de%20acesso"
          >
            Esqueci minha senha
          </a>
        }
        name="password"
        onChange={(event) => {
          setPassword(event.target.value);
          if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
        }}
        trailingAction={
          <button
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={showPassword}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" />
            ) : (
              <Eye aria-hidden="true" className="h-[18px] w-[18px]" />
            )}
          </button>
        }
        type={showPassword ? 'text' : 'password'}
        value={password}
      />

      <label className="inline-flex min-h-6 cursor-pointer items-center gap-2.5 text-sm text-slate-600">
        <input
          checked={rememberMe}
          className="h-4 w-4 rounded border-slate-300 accent-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          onChange={(event) => setRememberMe(event.target.checked)}
          type="checkbox"
        />
        Lembrar-me
      </label>

      <div aria-live="polite" className="min-h-5">
        {isLoading ? (
          <p className="text-sm text-emerald-800" role="status">
            Validando seus dados...
          </p>
        ) : (
          formFeedback && (
            <p
              className={`rounded-lg px-3.5 py-3 text-sm ${
                formFeedback.kind === 'success'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-rose-50 text-rose-700'
              }`}
              role={formFeedback.kind === 'success' ? 'status' : 'alert'}
            >
              {formFeedback.message}
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
            Entrando...
          </>
        ) : (
          <>
            Entrar
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-500">
        <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-700" />
        Seus dados são protegidos durante o acesso.
      </p>
    </form>
  );
}

export default LoginForm;
