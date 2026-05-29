import { useEffect, useState } from "react";
import { useParams, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner, Btn, Chip } from "../../components/primitives.jsx";

const portal = axios.create({ baseURL: "/api/p" });

export default function ParticipantPortal() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("agenda");

  useEffect(() => {
    portal.get(`/${token}`).then(({ data }) => setData(data));
  }, [token]);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-subtle">
        <Spinner /> <span className="ml-2 text-sm">Betöltés…</span>
      </div>
    );

  const { event, participant, teamMates } = data;
  const primary = event.organization.primaryColor || "#3b6ea5";
  document.documentElement.style.setProperty("--brand", primary);
  const dateLabel = event.startDate
    ? new Date(event.startDate).toLocaleDateString("hu-HU", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    : "időpont nincs megadva";

  async function refresh() {
    const { data } = await portal.get(`/${token}`);
    setData(data);
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <div
        className="text-white px-5 py-6"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${shade(primary, -20)})`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          {event.organization.logoUrl ? (
            <img src={event.organization.logoUrl} className="h-7 w-7 rounded bg-white/20" />
          ) : (
            <span className="h-7 w-7 rounded bg-white/20 inline-flex items-center justify-center text-sm">
              ✦
            </span>
          )}
          <span className="text-sm opacity-90">{event.organization.name}</span>
        </div>
        <h1 className="font-head text-3xl leading-tight">{event.name}</h1>
        <div className="text-sm opacity-90 mt-1">
          {dateLabel}{event.location ? ` · ${event.location}` : ""}
        </div>

        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs">
          <span>Szia, {participant.name.split(" ")[0]}!</span>
          {participant.rsvp === "YES" && <span>✓ benne vagy</span>}
        </div>
      </div>

      {/* Tabs */}
      <nav className="bg-white border-b border-line sticky top-0 z-10">
        <div className="flex">
          {[
            { k: "agenda", l: "Agenda" },
            { k: "team", l: "Csapatom" },
            { k: "info", l: "Adataim" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`flex-1 py-3 text-sm font-medium transition ${
                tab === t.k
                  ? "text-brand-600 border-b-2 border-brand-600"
                  : "text-subtle"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab content */}
      <main className="p-4 pb-24 max-w-md mx-auto">
        {tab === "agenda" && <Agenda event={event} />}
        {tab === "team" && <Team participant={participant} mates={teamMates} />}
        {tab === "info" && (
          <Info
            token={token}
            participant={participant}
            onUpdate={refresh}
            eventStarted={
              event.startDate && new Date(event.startDate) < new Date()
            }
          />
        )}

        {event.polls?.length > 0 && (
          <LivePolls token={token} polls={event.polls} onAnswer={refresh} />
        )}
      </main>
    </div>
  );
}

function Agenda({ event }) {
  if (!event.agenda?.length) {
    return <div className="text-sm text-subtle text-center py-12">Még nincs program.</div>;
  }
  // Mai vagy aktív programok kiemelése
  const now = nowMins();
  return (
    <div>
      <div className="label mb-2">Mai program</div>
      <div className="space-y-3">
        {event.agenda.map((it) => {
          const s = hhmm(it.startTime);
          const e = s + it.durationMin;
          const isNow = now >= s && now < e;
          const isPast = now >= e;
          return (
            <div
              key={it.id}
              className={`rounded-xl border-2 p-3 ${
                isNow
                  ? "border-brand-500 bg-brand-50"
                  : isPast
                  ? "border-line bg-card opacity-60"
                  : "border-ink bg-card"
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm">{it.startTime}</span>
                <span className="text-xl">{it.imageEmoji}</span>
                <div className="flex-1">
                  <div className="font-medium">{it.title}</div>
                  <div className="text-xs text-subtle">
                    {it.durationMin} perc · {it.lane}
                  </div>
                </div>
                {isNow && <Chip on>MOST</Chip>}
              </div>
              {isNow && it.steps?.length > 0 && (
                <ol className="mt-3 space-y-1.5 border-t border-dashed border-line pt-3">
                  {it.steps.map((step, i) => (
                    <li key={i} className="text-xs flex gap-2">
                      <span className="text-brand-500 font-mono">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Team({ participant, mates }) {
  if (!participant.team) {
    return (
      <div className="text-sm text-subtle text-center py-12">
        Még nem vagy csapatba osztva. A szervező később hozzárendel.
      </div>
    );
  }
  return (
    <div>
      <div className="label mb-2">Csapatom</div>
      <div className="card mb-4">
        <div className="font-head text-2xl">{participant.team}</div>
        <div className="text-xs text-subtle mt-1">{mates.length} fő</div>
      </div>
      <div className="space-y-2">
        {mates.map((m) => (
          <div key={m.id} className="bg-card border border-line rounded-lg px-3 py-2 text-sm">
            {m.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ token, participant, onUpdate, eventStarted }) {
  const [diet, setDiet] = useState(participant.dietary || []);
  const [busy, setBusy] = useState(false);

  function toggleDiet(d) {
    setDiet((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));
  }

  async function setRsvp(rsvp) {
    setBusy(true);
    await portal.post(`/${token}/rsvp`, { rsvp, dietary: diet });
    setBusy(false);
    onUpdate();
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="label mb-2">Részt veszek?</div>
        <div className="grid grid-cols-3 gap-2">
          {["YES", "MAYBE", "NO"].map((r) => (
            <button
              key={r}
              onClick={() => setRsvp(r)}
              disabled={busy}
              className={`py-3 rounded-xl border-2 font-medium ${
                participant.rsvp === r
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-line bg-card"
              }`}
            >
              {r === "YES" ? "Igen" : r === "MAYBE" ? "Talán" : "Nem"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="label mb-2">Étkezési igények</div>
        <div className="flex flex-wrap gap-2">
          {["vega", "vegan", "gluten-mentes", "laktoz-mentes", "egyeb"].map((d) => (
            <button
              key={d}
              onClick={() => toggleDiet(d)}
              className={diet.includes(d) ? "chip chip-on" : "chip chip-ghost"}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          onClick={() => portal.post(`/${token}/rsvp`, { dietary: diet }).then(onUpdate)}
          className="mt-2 text-xs text-brand-600 hover:underline"
        >
          Mentés
        </button>
      </div>

      {eventStarted && <Feedback token={token} />}
    </div>
  );
}

function Feedback({ token }) {
  const [form, setForm] = useState({ nps: null, rating: null, text: "", anonymous: false });
  const [sent, setSent] = useState(false);

  async function send() {
    await portal.post(`/${token}/feedback`, form);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card card-accent text-center">
        <div className="text-3xl mb-2">🙏</div>
        <div className="font-medium">Köszönjük a visszajelzést!</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-head text-xl mb-3">Visszajelzés</h3>
      <div className="space-y-4">
        <div>
          <div className="label mb-2">Mennyire ajánlanád másoknak? (0–10)</div>
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => setForm({ ...form, nps: i })}
                className={`py-1 rounded text-xs font-medium border ${
                  form.nps === i
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-line text-subtle"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="label mb-2">Csillagok</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setForm({ ...form, rating: s })}
                className={`text-2xl ${form.rating >= s ? "text-yellow-500" : "text-line"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <textarea
          className="input min-h-[80px]"
          placeholder="Mit írnál a szervezőknek?"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />
        <label className="flex items-center gap-2 text-xs text-subtle">
          <input
            type="checkbox"
            checked={form.anonymous}
            onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
          />
          Névtelenül küldöm
        </label>
        <Btn primary onClick={send} className="w-full">
          Küldés
        </Btn>
      </div>
    </div>
  );
}

function LivePolls({ token, polls, onAnswer }) {
  return (
    <div className="mt-6">
      <div className="label mb-2">Élő szavazás</div>
      <div className="space-y-3">
        {polls.map((p) => (
          <PollCard key={p.id} token={token} poll={p} onAnswer={onAnswer} />
        ))}
      </div>
    </div>
  );
}

function PollCard({ token, poll, onAnswer }) {
  const [done, setDone] = useState(false);
  async function answer(opt) {
    await portal.post(`/${token}/polls/${poll.id}/vote`, { answer: opt });
    setDone(true);
    onAnswer();
  }
  if (done) {
    return (
      <div className="card card-accent text-center text-sm text-subtle">
        ✓ Szavazat rögzítve.
      </div>
    );
  }
  return (
    <div className="card card-accent">
      <div className="text-xs text-subtle mb-1">
        {poll.type === "QUIZ" ? "Kvíz" : poll.type === "MOOD" ? "Hangulat" : "Q&A"}
      </div>
      <div className="font-medium mb-3">{poll.question}</div>
      <div className="flex flex-wrap gap-2">
        {(poll.options.length ? poll.options : ["1", "2", "3", "4", "5"]).map((o) => (
          <button key={o} onClick={() => answer(o)} className="btn">
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function hhmm(s) {
  const [h, m] = String(s).split(":").map(Number);
  return h * 60 + m;
}
function nowMins() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function shade(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) + amt;
  let g = ((n >> 8) & 0xff) + amt;
  let b = (n & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
