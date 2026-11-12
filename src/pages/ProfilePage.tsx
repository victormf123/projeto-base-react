import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { LoaderCircle, Save, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, type ProfileData } from '../services/profileService';

type ProfileForm = {
  fullName: string;
  phone: string;
  cpf: string;
  cnpj: string;
  address: string;
  zipCode: string;
  company: boolean;
};

type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;
type Feedback = { kind: 'success' | 'error'; message: string };

const emptyForm: ProfileForm = {
  fullName: '',
  phone: '',
  cpf: '',
  cnpj: '',
  address: '',
  zipCode: '',
  company: false,
};

const updateErrorMessage =
  'Não foi possível atualizar seu perfil. Verifique os dados informados e tente novamente.';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function maskPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCpf(value: string) {
  return digitsOnly(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskCnpj(value: string) {
  const digits = digitsOnly(value).slice(0, 14);
  let masked = digits.slice(0, 2);
  if (digits.length > 2) masked += `.${digits.slice(2, 5)}`;
  if (digits.length > 5) masked += `.${digits.slice(5, 8)}`;
  if (digits.length > 8) masked += `/${digits.slice(8, 12)}`;
  if (digits.length > 12) masked += `-${digits.slice(12)}`;
  return masked;
}

function maskZipCode(value: string) {
  const digits = digitsOnly(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function hasValidCpf(value: string) {
  const cpf = digitsOnly(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calculateDigit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

function hasValidCnpj(value: string) {
  const cnpj = digitsOnly(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calculateDigit = (length: number) => {
    const weights =
      length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = cnpj
      .slice(0, length)
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return calculateDigit(12) === Number(cnpj[12]) && calculateDigit(13) === Number(cnpj[13]);
}

function validatePhone(value: string) {
  const phone = digitsOnly(value);
  const areaCode = Number(phone.slice(0, 2));
  if ((phone.length !== 10 && phone.length !== 11) || areaCode < 11 || areaCode > 99) {
    return false;
  }
  return phone.length === 11
    ? phone[2] === '9'
    : Number(phone[2]) >= 2 && Number(phone[2]) <= 5;
}

function validate(form: ProfileForm): ProfileErrors {
  const errors: ProfileErrors = {};
  const fullName = form.fullName.trim();
  const phone = digitsOnly(form.phone);
  const cpf = digitsOnly(form.cpf);
  const cnpj = digitsOnly(form.cnpj);
  const zipCode = digitsOnly(form.zipCode);

  if (!fullName) errors.fullName = 'Informe seu nome completo.';
  if (phone && !validatePhone(phone)) errors.phone = 'Informe um telefone com DDD válido.';
  if (cpf && !hasValidCpf(cpf)) errors.cpf = 'Informe um CPF válido.';
  if (form.company && !cnpj) errors.cnpj = 'Informe o CNPJ.';
  else if (cnpj && !hasValidCnpj(cnpj)) errors.cnpj = 'Informe um CNPJ válido.';
  if (zipCode && zipCode.length !== 8) errors.zipCode = 'Informe um CEP com oito dígitos.';

  return errors;
}

function getAuthenticatedUserId(user: unknown): string | number | null {
  if (!user || typeof user !== 'object') return null;
  const userRecord = user as { id?: unknown; userId?: unknown };
  const userId = userRecord.id ?? userRecord.userId;
  return typeof userId === 'string' || typeof userId === 'number' ? userId : null;
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = 'text',
  autoComplete,
}: {
  id: keyof ProfileForm;
  label: string;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
        id={id}
        onChange={onChange}
        type={type}
        value={value}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-700" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [baseline, setBaseline] = useState<ProfileForm>(emptyForm);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const isSubmitting = useRef(false);
  const userId = getAuthenticatedUserId(user);

  function updateField<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(null);
  }

  function handleCancel() {
    setForm(baseline);
    setErrors({});
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting.current) return;

    setFeedback(null);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (userId === null || String(userId).trim() === '') {
      setFeedback({ kind: 'error', message: updateErrorMessage });
      return;
    }

    const payload: ProfileData = {
      fullName: form.fullName.trim(),
      phone: digitsOnly(form.phone),
      cpf: digitsOnly(form.cpf),
      cnpj: form.company ? digitsOnly(form.cnpj) : null,
      address: form.address.trim(),
      zipCode: digitsOnly(form.zipCode),
      company: form.company,
    };

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      await updateProfile(userId, payload);
      const savedForm: ProfileForm = {
        ...form,
        ...payload,
        phone: maskPhone(payload.phone),
        cpf: maskCpf(payload.cpf),
        cnpj: payload.cnpj ? maskCnpj(payload.cnpj) : '',
        address: payload.address ?? '',
        zipCode: payload.zipCode ? maskZipCode(payload.zipCode) : '',
      };
      setForm(savedForm);
      setBaseline(savedForm);
      setHasSavedProfile(true);
      setFeedback({ kind: 'success', message: 'Perfil atualizado com sucesso!' });
    } catch {
      setFeedback({ kind: 'error', message: updateErrorMessage });
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
          Conta
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Meu perfil
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Consulte e atualize suas informações pessoais e empresariais.
        </p>
      </header>

      <form
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        noValidate
        onSubmit={handleSubmit}
      >
        <fieldset className="contents" disabled={isLoading}>
        <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
            <UserRound aria-hidden="true" size={19} />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Informações pessoais</h2>
            <p className="mt-0.5 text-xs text-slate-500">Dados básicos da sua conta</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              autoComplete="name"
              error={errors.fullName}
              id="fullName"
              label="Nome completo"
              onChange={(event) => updateField('fullName', event.target.value)}
              value={form.fullName}
            />
          </div>
          <Field
            autoComplete="tel"
            error={errors.phone}
            id="phone"
            label="Telefone"
            onChange={(event) => updateField('phone', maskPhone(event.target.value))}
            value={form.phone}
          />
          <Field
            autoComplete="off"
            error={errors.cpf}
            id="cpf"
            label="CPF"
            onChange={(event) => updateField('cpf', maskCpf(event.target.value))}
            value={form.cpf}
          />
        </div>

        <div className="mb-5 mt-9 flex items-center gap-3 border-b border-slate-100 pb-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-800">
            <UserRound aria-hidden="true" size={19} />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Informações empresariais</h2>
            <p className="mt-0.5 text-xs text-slate-500">Dados da empresa, se aplicável</p>
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
          <input
            checked={form.company}
            className="h-4 w-4 rounded border-slate-300 accent-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600"
            onChange={(event) => {
              updateField('company', event.target.checked);
              if (!event.target.checked) {
                setForm((current) => ({ ...current, company: false }));
                setErrors((current) => ({ ...current, cnpj: undefined, zipCode: undefined }));
              }
            }}
            type="checkbox"
          />
          Possui empresa?
        </label>

        {form.company && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              autoComplete="off"
              error={errors.cnpj}
              id="cnpj"
              label="CNPJ"
              onChange={(event) => updateField('cnpj', maskCnpj(event.target.value))}
              value={form.cnpj}
            />
          </div>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            autoComplete="postal-code"
            error={errors.zipCode}
            id="zipCode"
            label="CEP"
            onChange={(event) => updateField('zipCode', maskZipCode(event.target.value))}
            value={form.zipCode}
          />
          <div className="sm:col-span-2">
            <Field
            autoComplete="street-address"
            error={errors.address}
            id="address"
            label="Endereço"
            onChange={(event) => updateField('address', event.target.value)}
            value={form.address}
            />
          </div>
        </div>

        {!hasSavedProfile && (
          <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900">
            Os dados do perfil não estão disponíveis na sessão e a aplicação ainda não possui
            endpoint de consulta. Preencha os campos para atualizá-los.
            {userId === null && ' A sessão também não disponibiliza o userId necessário para salvar.'}
          </p>
        )}
        </fieldset>

        <div aria-live="polite" className="mt-5 min-h-5">
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-emerald-800" role="status">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
              Salvando alterações...
            </p>
          ) : (
            feedback && (
              <p
                className={`rounded-lg px-3.5 py-3 text-sm ${
                  feedback.kind === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-700'
                }`}
                role={feedback.kind === 'success' ? 'status' : 'alert'}
              >
                {feedback.message}
              </p>
            )
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
            disabled={isLoading}
            onClick={handleCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            aria-busy={isLoading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
            ) : (
              <Save aria-hidden="true" size={16} />
            )}
            Salvar alterações
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
