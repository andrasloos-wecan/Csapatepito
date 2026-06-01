import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api.js";
import {
  Btn,
  Chip,
  StatusBadge,
  Meter,
  Spinner,
  AvStack,
} from "../../components/primitives.jsx";

const BLOCKS = [
  { key: "helyszin", label: "Helyszín" },
  { key: "program", label: "Program" },
  { key: "csapat", label: "Csapat" },
  { key: "koltseg", label: "Költség" },
  { key: "fotok", label: "Fotók" },
];

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [active, setActive] = useState("helyszin");
  const refs = useRef({});

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}`),
      api.get(`/comments`, { params: { eventId: id } }),
    ]).then(([a, b]) => {
      setEvent(a.data.event);
      setComments(b.data.comments);
    });
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      let cur = "helyszin";
      for (const b of BLOCKS) {
        const el = refs.current[b.key];
        if (el && el.getBoundingClientRect().top < 200) cur = b.key;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!event) return <div className="p-8"><Spinner /></div>;

  const commentsByBlock = (key) => comments.filter((c) => c.blockKey === key);
  const reload = () =>
    api.get(`/comments`, { params: { eventId: id } }).then(({ data }) => setComments(data.comments));

  async function exportPdf() {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/export/event/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert("PDF export sikertelen.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto pb-24">
      {/* Hero */}
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-subtle uppercase tracking-wider">
              {event.startDate
                ? new Date(event.startDate).toLocaleDateString("hu-HU", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                : "időpont nincs megadva"}
            </div>
            <h1 className="font-head text-4xl mt-1">{event.name}</h1>
            <div className="text-sm text-subtle mt-1">
              {event.location || "helyszín nincs megadva"}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Btn onClick={exportPdf}>PDF</Btn>
              <Btn as="link" to={`/events/${id}/timeline`}>Timeline</Btn>
              <Btn as="link" to={`/events/${id}/participants`} primary>
                Résztvevők
              </Btn>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={event.status} />
              <Link to={`/events/${id}/feedback`} className="text-xs text-subtle underline">
                Visszajelzések ({event.feedback?.length || 0})
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[140px_1fr] gap-6">
        {/* Sticky nav */}
        <aside className="sticky top-4 self-start">
          <div className="label mb-2">Ugrás</div>
          <div className="space-y-1.5">
            {BLOCKS.map((b) => (
              <a
                key={b.key}
                onClick={() => {
                  refs.current[b.key]?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`block text-sm pl-3 py-1 border-l-2 cursor-pointer transition ${
                  active === b.key
                    ? "border-brand-500 text-ink font-medium"
                    : "border-line text-subtle hover:text-ink"
                }`}
              >
                {b.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Blokkok */}
        <div className="space-y-5">
          <Block
            ref={(el) => (refs.current.helyszin = el)}
            title="Helyszín"
            eventId={id}
            blockKey="helyszin"
            comments={commentsByBlock("helyszin")}
            onComment={reload}
          >
            <div className="rounded-lg bg-gradient-to-br from-brand-50 to-brand-200 h-32 flex items-center justify-center text-subtle text-sm">
              🗺️ Térkép (placeholder — Google Maps integráció P1)
            </div>
            <div className="mt-3 text-sm">{event.location || "Nincs helyszín megadva."}</div>
          </Block>

          <Block
            ref={(el) => (refs.current.program = el)}
            title="Program"
            eventId={id}
            blockKey="program"
            comments={commentsByBlock("program")}
            onComment={reload}
            action={
              <Btn sm as="link" to={`/events/${id}/timeline`}>
                Timeline szerkesztő →
              </Btn>
            }
          >
            {event.eventActivities?.length === 0 ? (
              <div className="text-sm text-subtle">Még nincs programpont.</div>
            ) : (
              <div className="space-y-1.5">
                {event.eventActivities?.map((it) => (
                  <div key={it.id} className="flex items-baseline gap-3">
                    <Chip ghost>{it.startTime}</Chip>
                    <span className="text-sm">
                      {it.customTitle || it.activity?.name}
                    </span>
                    <span className="text-xs text-subtle ml-auto">
                      {it.durationMin} perc · {it.lane}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Block>

          <Block
            ref={(el) => (refs.current.csapat = el)}
            title="Csapat"
            eventId={id}
            blockKey="csapat"
            comments={commentsByBlock("csapat")}
            onComment={reload}
            action={
              <Btn sm as="link" to={`/events/${id}/participants`}>
                Kezelés →
              </Btn>
            }
          >
            <div className="flex items-center justify-between">
              <AvStack
                names={event.participants?.slice(0, 5).map((p) => p.name[0]) || []}
                extra={
                  event.participants?.length > 5
                    ? `+${event.participants.length - 5}`
                    : undefined
                }
              />
              <Chip on>
                {event.counts?.yes ?? 0} / {event.participants?.length ?? 0} megerősítve
              </Chip>
            </div>
            <Meter
              pct={event.rsvpRatio}
              className="mt-3"
            />
          </Block>

          <Block
            ref={(el) => (refs.current.koltseg = el)}
            title="Költség"
            eventId={id}
            blockKey="koltseg"
            comments={commentsByBlock("koltseg")}
            onComment={reload}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="label">Tervezett</div>
                <div className="font-head text-xl mt-1">
                  {formatFt(event.budgetPlanned)} Ft
                </div>
              </div>
              <div>
                <div className="label">Eddigi költés</div>
                <div className="font-head text-xl mt-1">
                  {formatFt(event.budgetActual)} Ft
                </div>
              </div>
            </div>
            <Meter
              pct={
                event.budgetPlanned
                  ? Math.round((event.budgetActual / event.budgetPlanned) * 100)
                  : 0
              }
              className="mt-3"
            />
          </Block>

          <Block
            ref={(el) => (refs.current.fotok = el)}
            title="Fotók"
            eventId={id}
            blockKey="fotok"
            comments={commentsByBlock("fotok")}
            onComment={reload}
          >
            <div className="text-sm text-subtle">
              Fotófal P1 — itt jelennek meg a résztvevők feltöltött képei.
            </div>
          </Block>
        </div>
      </div>
    </div>
  );
}

import { forwardRef } from "react";
const Block = forwardRef(function Block(
  { title, children, blockKey, comments, eventId, onComment, action },
  ref
) {
  const [draft, setDraft] = useState("");

  async function add() {
    if (!draft.trim()) return;
    await api.post("/comments", { eventId, blockKey, content: draft });
    setDraft("");
    onComment();
  }

  return (
    <section ref={ref} className="card card-fill">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-head text-xl">{title}</h3>
        {action}
      </div>

      {children}

      <div className="mt-5 border-t border-line/60 pt-4 space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            <span className="bg-brand-500/10 border border-brand-500/30 text-ink rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-sm px-3 py-1.5 text-sm">
              <span className="font-medium text-brand-700">@{c.authorName}:</span> {c.content}
            </span>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Komment a blokkhoz…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Btn onClick={add} disabled={!draft.trim()}>
            Hozzáad
          </Btn>
        </div>
      </div>
    </section>
  );
});

function formatFt(n) {
  return new Intl.NumberFormat("hu-HU").format(n || 0);
}
