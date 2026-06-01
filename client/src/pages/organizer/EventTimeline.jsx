import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api.js";
import { Btn, Chip, Spinner } from "../../components/primitives.jsx";

const HOUR_WIDTH = 100; // px / hour

export default function EventTimeline() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [items, setItems] = useState(null);
  const [polls, setPolls] = useState([]);
  const [activities, setActivities] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    refresh();
    api.get("/activities").then(({ data }) => setActivities(data.activities));
  }, [id]);

  async function refresh() {
    const [e, ag, pl] = await Promise.all([
      api.get(`/events/${id}`),
      api.get(`/events/${id}/agenda`),
      api.get(`/polls`, { params: { eventId: id } }),
    ]);
    setEvent(e.data.event);
    setItems(ag.data.items);
    setPolls(pl.data.polls);
  }

  const lanes = useMemo(() => {
    if (!items) return [];
    const set = new Set(items.map((it) => it.lane));
    ["Fő helyszín", "Terem B", "Catering"].forEach((l) => set.add(l));
    return Array.from(set);
  }, [items]);

  const dayRange = useMemo(() => {
    if (!items || !items.length) return { start: 9, end: 17 };
    const startMins = items.map((it) => hhmm(it.startTime));
    const endMins = items.map((it) => hhmm(it.startTime) + it.durationMin);
    const startH = Math.max(0, Math.floor(Math.min(...startMins) / 60) - 1);
    const endH = Math.min(24, Math.ceil(Math.max(...endMins) / 60) + 1);
    return { start: startH, end: endH };
  }, [items]);

  if (!event || !items) return <div className="p-8"><Spinner /></div>;

  const totalHours = dayRange.end - dayRange.start;

  return (
    <div className="p-8 max-w-[1400px] mx-auto pb-24">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Link to={`/events/${id}`} className="text-xs text-subtle hover:text-ink">
            ← {event.name}
          </Link>
          <h1 className="font-head text-3xl mt-1">Párhuzamos menetrend</h1>
          <p className="text-subtle text-sm mt-1">
            Több helyszín / sáv egyszerre. A blokkok átfedéseit jelzi a rendszer.
          </p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => setAdding(true)}>+ Programpont</Btn>
        </div>
      </header>

      {/* Idő-tengely */}
      <div className="card overflow-x-auto">
        <div className="min-w-max">
          <div
            className="grid items-end pb-2 mb-2 border-b border-dashed border-line"
            style={{
              gridTemplateColumns: `120px repeat(${totalHours}, ${HOUR_WIDTH}px)`,
            }}
          >
            <div />
            {Array.from({ length: totalHours }, (_, i) => dayRange.start + i).map(
              (h) => (
                <div key={h} className="text-xs text-subtle font-mono text-center">
                  {String(h).padStart(2, "0")}:00
                </div>
              )
            )}
          </div>

          {lanes.map((lane) => (
            <Lane
              key={lane}
              lane={lane}
              items={items.filter((it) => it.lane === lane)}
              range={dayRange}
              onUpdate={refresh}
              eventId={id}
            />
          ))}
        </div>
      </div>

      {/* Élő interakció dokk */}
      <LivePolls
        eventId={id}
        polls={polls}
        onRefresh={() =>
          api.get(`/polls`, { params: { eventId: id } }).then(({ data }) => setPolls(data.polls))
        }
      />

      {adding && (
        <AddItemModal
          eventId={id}
          activities={activities}
          lanes={lanes}
          onClose={() => {
            setAdding(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function Lane({ lane, items, range, eventId, onUpdate }) {
  const totalHours = range.end - range.start;
  const startMins = range.start * 60;
  return (
    <div
      className="grid items-stretch py-2 border-t border-dashed border-line/50"
      style={{
        gridTemplateColumns: `120px repeat(${totalHours}, ${HOUR_WIDTH}px)`,
      }}
    >
      <div className="font-medium text-sm py-2 pr-3">{lane}</div>
      <div
        className="relative"
        style={{
          gridColumn: `2 / span ${totalHours}`,
          height: 56,
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent " +
            (HOUR_WIDTH - 1) +
            "px, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) " +
            HOUR_WIDTH +
            "px)",
        }}
      >
        {items.map((it) => {
          const startOffset = (hhmm(it.startTime) - startMins) / 60;
          const widthHours = it.durationMin / 60;
          return (
            <button
              key={it.id}
              onClick={async () => {
                if (!confirm(`Törlöd: ${it.customTitle || it.activity?.name}?`)) return;
                await api.delete(`/events/${eventId}/agenda/${it.id}`);
                onUpdate();
              }}
              className={`absolute top-1 bottom-1 rounded-md border px-2 py-1 text-xs text-left overflow-hidden ${
                laneColor(lane)
              }`}
              style={{
                left: `${startOffset * HOUR_WIDTH}px`,
                width: `${widthHours * HOUR_WIDTH - 4}px`,
              }}
              title={`Kattints a törléshez (${it.startTime} · ${it.durationMin} perc)`}
            >
              <div className="font-medium leading-snug truncate">
                {it.customTitle || it.activity?.name}
              </div>
              <div className="text-[10px] opacity-70">{it.startTime}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LivePolls({ eventId, polls, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "MOOD", question: "", options: "" });

  async function create() {
    if (!form.question) return;
    await api.post("/polls", {
      eventId,
      type: form.type,
      question: form.question,
      options: form.options
        ? form.options.split(",").map((s) => s.trim()).filter(Boolean)
        : ["1", "2", "3", "4", "5"],
    });
    setForm({ type: "MOOD", question: "", options: "" });
    setOpen(false);
    onRefresh();
  }

  return (
    <section className="card card-accent mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-head text-xl">Élő interakció</h3>
          <p className="text-xs text-subtle">
            Kvíz · hangulat-szavazás · kérdezz-felelek — a résztvevők a telefonjukon
            kapják.
          </p>
        </div>
        <Btn primary onClick={() => setOpen((v) => !v)}>
          {open ? "Mégsem" : "Szavazás indítása"}
        </Btn>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-dashed border-line/60 pt-4">
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="MOOD">Hangulat</option>
            <option value="QUIZ">Kvíz</option>
            <option value="QA">Kérdezz-felelek</option>
          </select>
          <input
            className="input md:col-span-2"
            placeholder="Kérdés…"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
          <input
            className="input md:col-span-2"
            placeholder="Opciók vesszővel (opcionális — ha üres: 1–5 skála)"
            value={form.options}
            onChange={(e) => setForm({ ...form, options: e.target.value })}
          />
          <Btn primary onClick={create}>Indítás</Btn>
        </div>
      )}

      {polls.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-dashed border-line/60 pt-4">
          {polls.map((p) => (
            <PollRow key={p.id} poll={p} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </section>
  );
}

function PollRow({ poll, onRefresh }) {
  const totalVotes = Object.values(poll.tallies || {}).reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-lg bg-paper p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{poll.question}</div>
          <div className="text-xs text-subtle">
            {poll.type === "MOOD" ? "Hangulat" : poll.type === "QUIZ" ? "Kvíz" : "Q&A"} ·{" "}
            {totalVotes} szavazat ·{" "}
            {poll.closedAt ? "lezárva" : "élő"}
          </div>
        </div>
        {!poll.closedAt && (
          <Btn sm onClick={async () => {
            await api.post(`/polls/${poll.id}/close`);
            onRefresh();
          }}>
            Lezár
          </Btn>
        )}
      </div>
      {poll.options.length > 0 && (
        <div className="mt-2 space-y-1">
          {poll.options.map((o) => {
            const n = poll.tallies?.[o] || 0;
            const pct = totalVotes ? Math.round((n / totalVotes) * 100) : 0;
            return (
              <div key={o} className="flex items-center gap-2 text-xs">
                <span className="w-20 truncate">{o}</span>
                <div className="flex-1 h-1.5 rounded-full bg-hatch overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-subtle w-8 text-right">{n}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddItemModal({ eventId, activities, lanes, onClose }) {
  const [form, setForm] = useState({
    activityId: "",
    customTitle: "",
    startTime: "09:00",
    durationMin: 30,
    lane: lanes[0] || "Fő helyszín",
  });

  async function save() {
    await api.post(`/events/${eventId}/agenda`, {
      activityId: form.activityId || null,
      customTitle: form.activityId ? null : form.customTitle,
      startTime: form.startTime,
      durationMin: Number(form.durationMin),
      lane: form.lane,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-head text-xl mb-4">+ Programpont</h3>
        <div className="space-y-3">
          <label className="block">
            <span className="label">Aktivitás (vagy egyedi cím lent)</span>
            <select
              className="input mt-1"
              value={form.activityId}
              onChange={(e) => setForm({ ...form, activityId: e.target.value })}
            >
              <option value="">— válassz —</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.imageEmoji} {a.name}
                </option>
              ))}
            </select>
          </label>
          {!form.activityId && (
            <label className="block">
              <span className="label">Egyedi cím</span>
              <input
                className="input mt-1"
                value={form.customTitle}
                onChange={(e) => setForm({ ...form, customTitle: e.target.value })}
                placeholder="pl. Reggeli"
              />
            </label>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Kezdés</span>
              <input
                type="time"
                className="input mt-1"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="label">Hossz (perc)</span>
              <input
                type="number"
                className="input mt-1"
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
              />
            </label>
          </div>
          <label className="block">
            <span className="label">Sáv</span>
            <input
              className="input mt-1"
              list="lanes"
              value={form.lane}
              onChange={(e) => setForm({ ...form, lane: e.target.value })}
            />
            <datalist id="lanes">
              {lanes.map((l) => <option key={l} value={l} />)}
            </datalist>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Btn ghost onClick={onClose}>Mégsem</Btn>
            <Btn primary onClick={save}>Mentés</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function hhmm(s) {
  const [h, m] = String(s).split(":").map(Number);
  return h * 60 + m;
}
function laneColor(lane) {
  if (lane.includes("Catering") || lane.toLowerCase().includes("ebéd"))
    return "bg-amber-500/15 text-amber-200 border-amber-500/40";
  if (lane.includes("B") || lane.includes("Workshop"))
    return "bg-purple-500/15 text-purple-200 border-purple-500/40";
  return "bg-brand-500/15 text-brand-700 border-brand-500/40";
}
