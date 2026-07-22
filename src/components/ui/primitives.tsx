import React from "react";
import { cx } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx("rounded-xl2 border border-black/10 bg-white shadow-sm", className)}>{children}</div>;
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-black/5 text-ink/70",
    success: "bg-success/10 text-success",
    warning: "bg-warm/10 text-warm",
    danger: "bg-danger/10 text-danger",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const variants: Record<string, string> = {
    primary: "bg-ink text-white hover:bg-ink/90",
    secondary: "bg-black/5 text-ink hover:bg-black/10",
    ghost: "bg-transparent text-ink hover:bg-black/5",
    danger: "bg-danger text-white hover:bg-danger/90",
  };
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return (
      <input
        {...props}
        ref={ref}
        className={cx(
          "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40",
          props.className,
        )}
      />
    );
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea(props, ref) {
    return (
      <textarea
        {...props}
        ref={ref}
        className={cx(
          "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40",
          props.className,
        )}
      />
    );
  },
);

export function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cx(
        "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-black/15 py-16 text-center">
      <div className="text-sm font-medium text-ink/70">{title}</div>
      {description && <div className="mt-1 max-w-sm text-sm text-ink/50">{description}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-[8vh]">
      <div
        className={cx("w-full rounded-xl2 bg-white p-6 shadow-xl", wide ? "max-w-2xl" : "max-w-md")}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-ink/50 hover:bg-black/5" aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
