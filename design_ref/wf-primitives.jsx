/* wf-primitives.jsx — reusable low-fi wireframe building blocks */
const { useState } = React;

/* a screen "frame" with faux toolbar */
function Frame({ title, children }) {
  return (
    <div className="frame">
      <div className="frame__bar">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="frame__title">{title}</span>
      </div>
      <div className="frame__body">{children}</div>
    </div>
  );
}

/* numbered marker that ties an element to a note below */
function Mk({ n, marker }) {
  return <span className={"mk mk-inline" + (marker ? " mk--marker" : "")}>{n}</span>;
}

/* text placeholder line */
function Bar({ w = "100%", cls = "" }) {
  return <span className={"bar " + cls} style={{ width: w }}></span>;
}

/* group of placeholder lines */
function Lines({ rows = 3, last = "60%" }) {
  return (
    <div className="col" style={{ gap: 7 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Bar key={i} cls="sm" w={i === rows - 1 ? last : "100%"} />
      ))}
    </div>
  );
}

function Chip({ children, on, ghost }) {
  return <span className={"chip" + (on ? " chip--on" : "") + (ghost ? " chip--ghost" : "")}>{children}</span>;
}

function Btn({ children, solid, marker, sm }) {
  return (
    <span className={"btn" + (solid ? " btn--solid" : "") + (marker ? " btn--marker" : "") + (sm ? " btn--sm" : "")}>
      {children}
    </span>
  );
}

function Avatar({ children, sm }) {
  return <span className={"av" + (sm ? " sm" : "")}>{children}</span>;
}

function AvStack({ names = [], extra }) {
  return (
    <div className="av-stack">
      {names.map((n, i) => <span key={i} className="av sm">{n}</span>)}
      {extra ? <span className="av sm">{extra}</span> : null}
    </div>
  );
}

function Ph({ h = 80, label = "kép", w = "100%" }) {
  return <div className="ph" style={{ height: h, width: w }}>{label}</div>;
}

function Meter({ pct = 60, marker }) {
  return <div className={"meter" + (marker ? " mk-fill" : "")}><i style={{ width: pct + "%" }}></i></div>;
}

/* readiness ring */
function Ring({ pct = 78, num, label }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--accent)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          transform="rotate(-90 36 36)" />
      </svg>
      <div className="ring-num" style={{ marginTop: -48, marginBottom: 22 }}>{num ?? pct + "%"}</div>
      {label ? <div className="ring-lab">{label}</div> : null}
    </div>
  );
}

/* notes list under a variation */
function Notes({ items = [] }) {
  return (
    <div className="notes">
      <div className="notes-title">✦ Kreatív UX ötletek</div>
      {items.map((it, i) => (
        <div className="note" key={i}>
          <span className={"mk" + (it.marker ? " mk--marker" : "")}>{it.n ?? i + 1}</span>
          <p><b>{it.title}</b> {it.text}</p>
        </div>
      ))}
    </div>
  );
}

/* one variation column: tag + name + frame + notes */
function Variant({ tag, name, sub, notes, children }) {
  return (
    <div className="variant">
      <div className="variant__head">
        <span className="variant__tag">{tag}</span>
        <span className="variant__name">{name}</span>
      </div>
      {sub ? <div className="variant__sub" style={{ marginTop: -4, marginBottom: 10 }}>{sub}</div> : null}
      {children}
      <Notes items={notes || []} />
    </div>
  );
}

Object.assign(window, {
  Frame, Mk, Bar, Lines, Chip, Btn, Avatar, AvStack, Ph, Meter, Ring, Notes, Variant,
});
