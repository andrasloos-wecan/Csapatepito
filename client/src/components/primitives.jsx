import { Link } from "react-router-dom";

/* Egyszerű, újrahasznosítható UI primitívek — a design_ref wf-primitives.jsx
   hi-fi továbbgondolása Tailwind-del. */

export function Chip({ children, on, ghost, className = "", ...rest }) {
  const cls = on ? "chip chip-on" : ghost ? "chip chip-ghost" : "chip";
  return (
    <span className={`${cls} ${className}`} {...rest}>
      {children}
    </span>
  );
}

export function Btn({ children, primary, marker, ghost, sm, as: As, className = "", ...rest }) {
  const cls = [
    "btn",
    primary && "btn-primary",
    marker && "btn-marker",
    ghost && "btn-ghost",
    sm && "btn-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  if (As === "link") {
    const { to, ...r } = rest;
    return (
      <Link to={to} className={cls} {...r}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Card({ children, fill, ghost, accent, className = "", ...rest }) {
  const cls = [
    "card",
    fill && "card-fill",
    ghost && "card-ghost",
    accent && "card-accent",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className = "" }) {
  return <div className={`label ${className}`}>{children}</div>;
}

export function Meter({ pct = 0, className = "" }) {
  return (
    <div className={`meter ${className}`}>
      <i style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function Ring({ pct = 0, label, size = 80 }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ecebe5" strokeWidth="6" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-head text-2xl">
          {pct}%
        </div>
      </div>
      {label && <span className="text-xs text-subtle mt-1">{label}</span>}
    </div>
  );
}

export function Avatar({ children, sm, className = "" }) {
  const size = sm ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <span
      className={`${size} inline-flex items-center justify-center rounded-full bg-elevated border border-line text-ink font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function AvStack({ names = [], extra }) {
  const ring = "shadow-[0_0_0_2px_#131836]";
  return (
    <div className="flex">
      {names.map((n, i) => (
        <Avatar key={i} sm className={i ? `-ml-2 ${ring}` : ""}>
          {n}
        </Avatar>
      ))}
      {extra ? (
        <Avatar sm className={`${names.length ? "-ml-2" : ""} ${ring}`}>
          {extra}
        </Avatar>
      ) : null}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    OTLET:    { label: "Ötletelés",   cls: "bg-amber-500/10  text-amber-300  border-amber-500/30" },
    SZAVAZAS: { label: "Szavazás",    cls: "bg-brand-500/10  text-brand-700  border-brand-500/30" },
    VEGLEGES: { label: "Véglegesítve", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
    LEZAJLOTT:{ label: "Lezajlott",   cls: "bg-hatch text-subtle border-line" },
  };
  const it = map[status] || map.OTLET;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${it.cls}`}
    >
      {it.label}
    </span>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="card card-ghost text-center py-16">
      <div className="text-3xl mb-3 text-brand-500/60">✦</div>
      <div className="font-medium text-ink">{title}</div>
      {hint && <div className="text-sm text-subtle mt-1.5 max-w-md mx-auto leading-relaxed">{hint}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-line/40 border-t-brand-500 ${className}`}
    />
  );
}

/* wecan-stílusú szekció-fejléc kis aláhúzó vonallal */
export function SectionLabel({ children, className = "" }) {
  return (
    <div className={`label flex items-center gap-2.5 ${className}`}>
      <span className="h-px w-6 bg-brand-500" />
      <span>{children}</span>
    </div>
  );
}
