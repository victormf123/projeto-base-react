import type { ChangeEventHandler, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type LoginInputProps = {
  autoComplete: string;
  error?: string;
  icon: LucideIcon;
  id: string;
  labelAccessory?: ReactNode;
  label: string;
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  trailingAction?: ReactNode;
  type: 'text' | 'email' | 'password';
  value: string;
};

function LoginInput({
  autoComplete,
  error,
  icon: Icon,
  id,
  labelAccessory,
  label,
  name,
  onChange,
  trailingAction,
  type,
  value,
}: LoginInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
          {label}
        </label>
        {labelAccessory}
      </div>
      <div
        className={`flex h-12 items-center gap-3 rounded-xl border bg-white px-3.5 transition duration-200 focus-within:ring-4 ${
          error
            ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100'
            : 'border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100'
        }`}
      >
        <Icon
          aria-hidden="true"
          className={`h-[18px] w-[18px] shrink-0 ${
            error ? 'text-rose-400' : 'text-slate-400'
          }`}
          strokeWidth={1.8}
        />
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          id={id}
          name={name}
          onChange={onChange}
          placeholder={label}
          required
          type={type}
          value={value}
        />
        {trailingAction}
      </div>
      {error && (
        <p className="text-sm text-rose-600" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default LoginInput;
