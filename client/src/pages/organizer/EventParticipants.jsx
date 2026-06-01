import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api.js";
import { Btn, Chip, Spinner, EmptyState } from "../../components/primitives.jsx";

const RSVP_LABEL = { PENDING: "Vár", YES: "Igen", NO: "Nem", MAYBE: "Talán" };
const RSVP_CLS = {
  PENDING: "bg-hatch text-subtle border-line",
  YES:     "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  NO:      "bg-rose-500/10    text-rose-300    border-rose-500/30",
  MAYBE:   "bg-amber-500/10   text-amber-300   border-amber-500/30",
};

export default function EventParticipants() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  useEffect(() => {
    load();
  }, [id]);
  async function load() {
    const [e, p] = await Promise.all([
      api.get(`/events/${id}`),
      api.get(`/participants`, { params: { eventId: id } }),
    ]);
    setEvent(e.data.event);
    setParticipants(p.data.participants);
  }

  async function copyLink(participantId) {
    const { data } = await api.get(`/participants/${participantId}/invite-link`);
    await navigator.clipboard.writeText(data.link);
    alert("Meghívó-link a vágólapon:\n" + data.link);
  }

  if (!event || !participants) return <div className="p-8"><Spinner /></div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto pb-24">
      <Link to={`/events/${id}`} className="text-xs text-subtle hover:text-ink">
        ← {event.name}
      </Link>
      <header className="mt-3 mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-head text-3xl">Résztvevők</h1>
          <p className="text-subtle text-sm mt-1">
            {participants.length} résztvevő · {event.counts?.yes || 0} megerősítve ·{" "}
            {event.counts?.pending || 0} vár
          </p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => setShowBulk(true)}>Tömeges hozzáadás</Btn>
          <Btn primary onClick={() => setShowAdd(true)}>+ Új résztvevő</Btn>
        </div>
      </header>

      {participants.length === 0 ? (
        <EmptyState
          title="Még nincs résztvevő"
          hint="Add hozzá email-listával vagy egyenként, és küldd ki a meghívó-linkeket."
          action={<Btn primary onClick={() => setShowBulk(true)}>Tömeges hozzáadás</Btn>}
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper text-xs text-subtle uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Név</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Csapat</th>
                <th className="text-left px-4 py-3">Diéta</th>
                <th className="text-left px-4 py-3">RSVP</th>
                <th className="text-right px-4 py-3">Művelet</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <Row key={p.id} p={p} onChange={load} onLink={() => copyLink(p.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddModal eventId={id} onClose={() => { setShowAdd(false); load(); }} />
      )}
      {showBulk && (
        <BulkModal eventId={id} onClose={() => { setShowBulk(false); load(); }} />
      )}
    </div>
  );
}

function Row({ p, onChange, onLink }) {
  async function setRsvp(rsvp) {
    await api.patch(`/participants/${p.id}`, { rsvp });
    onChange();
  }
  async function del() {
    if (!confirm(`Törlöd: ${p.name}?`)) return;
    await api.delete(`/participants/${p.id}`);
    onChange();
  }

  return (
    <tr className="border-t border-line/60 hover:bg-paper/40">
      <td className="px-4 py-3 font-medium">{p.name}</td>
      <td className="px-4 py-3 text-subtle">{p.email || "—"}</td>
      <td className="px-4 py-3 text-subtle">{p.team || "—"}</td>
      <td className="px-4 py-3 text-subtle">
        {p.dietary?.length ? (
          <div className="flex flex-wrap gap-1">
            {p.dietary.map((d) => (
              <span key={d} className="text-[10px] bg-marker px-1.5 py-0.5 rounded">
                {d}
              </span>
            ))}
          </div>
        ) : (
          "—"
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {["YES", "MAYBE", "NO", "PENDING"].map((r) => (
            <button
              key={r}
              onClick={() => setRsvp(r)}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${
                p.rsvp === r ? RSVP_CLS[r] : "border-transparent text-subtle/60 hover:text-ink"
              }`}
            >
              {RSVP_LABEL[r]}
            </button>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={onLink} className="text-xs text-brand-600 hover:underline mr-3">
          link
        </button>
        <button onClick={del} className="text-xs text-red-700 hover:underline">
          törlés
        </button>
      </td>
    </tr>
  );
}

function AddModal({ eventId, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", team: "" });
  async function save() {
    if (!form.name) return;
    await api.post("/participants", { ...form, eventId });
    onClose();
  }
  return (
    <ModalShell title="Új résztvevő" onClose={onClose}>
      <div className="space-y-3">
        <input className="input" placeholder="Név" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Email (opcionális)" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Csapat (opcionális)" value={form.team}
          onChange={(e) => setForm({ ...form, team: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Btn ghost onClick={onClose}>Mégsem</Btn>
          <Btn primary onClick={save}>Hozzáadás</Btn>
        </div>
      </div>
    </ModalShell>
  );
}

function BulkModal({ eventId, onClose }) {
  const [tab, setTab] = useState("lines");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      if (tab === "csv") {
        await api.post("/participants/csv", { eventId, csv: text });
      } else {
        const lines = text.split(/\n+/).filter((l) => l.trim());
        if (lines.length) await api.post("/participants/bulk", { eventId, lines });
      }
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell title="Tömeges hozzáadás" onClose={onClose}>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTab("lines")}
          className={tab === "lines" ? "chip chip-on" : "chip"}
        >
          Soronkénti lista
        </button>
        <button
          onClick={() => setTab("csv")}
          className={tab === "csv" ? "chip chip-on" : "chip"}
        >
          CSV import
        </button>
      </div>

      <textarea
        className="input font-mono text-sm min-h-[240px]"
        placeholder={
          tab === "csv"
            ? "name,email,team,dietary,accessibility\nKovács Anna,anna@ceg.hu,piros,vegan,—"
            : "Kovács Anna, anna@ceg.hu\nNagy Béla, bela@ceg.hu\nbalint@ceg.hu"
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end gap-2 mt-3">
        <Btn ghost onClick={onClose}>Mégsem</Btn>
        <Btn primary onClick={save} disabled={busy}>
          {busy ? "Mentés…" : "Importálás"}
        </Btn>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-head text-xl mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
