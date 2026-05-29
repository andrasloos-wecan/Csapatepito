import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import api from "../../api.js";
import { Btn, AvStack, Chip, EmptyState, Spinner } from "../../components/primitives.jsx";

const COLUMNS = [
  { key: "OTLET", label: "Ötletelés", hint: "Még csak ötlet" },
  { key: "SZAVAZAS", label: "Szavazás alatt", hint: "Időpont/aktivitás szavazás" },
  { key: "VEGLEGES", label: "Véglegesítve", hint: "Indulásra kész" },
  { key: "LEZAJLOTT", label: "Lezajlott", hint: "Visszajelzés begyűjtve" },
];

export default function Dashboard() {
  const [events, setEvents] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const nav = useNavigate();
  // Akkor true, amikor a legutóbbi gesztus drag volt — a kártya onClick ezt
  // ellenőrzi, hogy a drag végén ne navigáljunk át az event-detail oldalra.
  const wasDragRef = useRef(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    load();
  }, []);
  async function load() {
    const { data } = await api.get("/events");
    setEvents(data.events);
  }

  const byCol = useMemo(() => {
    const m = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
    if (events) for (const e of events) (m[e.status] || m.OTLET).push(e);
    return m;
  }, [events]);

  const active = events?.find((e) => e.id === activeId);

  async function handleDragEnd(ev) {
    setActiveId(null);
    const overCol = ev.over?.id;
    const activeId = ev.active?.id;
    if (!overCol || !activeId) return;
    const e = events.find((x) => x.id === activeId);
    if (!e || e.status === overCol) return;
    setEvents((es) =>
      es.map((x) => (x.id === activeId ? { ...x, status: overCol } : x))
    );
    try {
      await api.patch(`/events/${activeId}`, { status: overCol });
    } catch {
      load(); // visszatöltés ha hiba van
    }
  }

  async function submitAiPrompt(e) {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    // P0 stub: létrehoz egy üres ötletet a prompt alapján, majd átirányít a wizardra
    const name = aiPrompt.slice(0, 60);
    const { data } = await api.post("/events", {
      name,
      description: aiPrompt,
      status: "OTLET",
    });
    nav(`/events/${data.event.id}`);
  }

  if (!events)
    return (
      <div className="p-8">
        <Spinner /> <span className="ml-2 text-sm text-subtle">Betöltés…</span>
      </div>
    );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-head text-3xl">Vezérlőpult</h1>
          <p className="text-subtle text-sm mt-1">
            Az eseményeid életciklus szerint — húzd át a kártyákat az új státuszra.
          </p>
        </div>
        <Link to="/events/new" className="btn btn-primary">
          + Új esemény
        </Link>
      </header>

      <form
        onSubmit={submitAiPrompt}
        className="card card-accent flex items-center gap-3 mb-6"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-medium flex-shrink-0">
          ✦
        </span>
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
          placeholder='„Szervezz fél napos csapatnapot ~20 főnek, kültéren…"'
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
        />
        <Btn primary type="submit" disabled={!aiPrompt.trim()}>
          ✦ Javaslat
        </Btn>
      </form>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => {
          wasDragRef.current = true;
          setActiveId(e.active.id);
        }}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              col={col}
              events={byCol[col.key]}
              draggingId={activeId}
              onCardClick={(eventId) => {
                if (wasDragRef.current) {
                  wasDragRef.current = false;
                  return;
                }
                nav(`/events/${eventId}`);
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {active ? <EventCard event={active} dragging /> : null}
        </DragOverlay>
      </DndContext>

      {events.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="Még nincs egy esemény sem"
            hint="Indítsd el az elsőt — válaszd az AI-segédet vagy az új esemény gombot."
            action={
              <Btn primary as="link" to="/events/new">
                + Új esemény
              </Btn>
            }
          />
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ col, events, draggingId, onCardClick }) {
  const { isOver, setNodeRef } = useDroppable({ id: col.key });
  return (
    <div className="flex flex-col">
      <div className="mb-2 px-1">
        <div className="flex items-baseline justify-between">
          <h3 className="font-head text-lg">{col.label}</h3>
          <span className="text-xs text-subtle">{events.length}</span>
        </div>
        <div className="text-[11px] text-subtle">{col.hint}</div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] rounded-xl border-2 border-dashed p-2 space-y-2 transition ${
          isOver ? "border-brand-500 bg-brand-50/40" : "border-line bg-[#faf9f4]/40"
        }`}
      >
        {events.map((e) => (
          <DraggableCard
            key={e.id}
            event={e}
            hidden={draggingId === e.id}
            onClick={() => onCardClick(e.id)}
          />
        ))}
        {events.length === 0 && (
          <div className="text-xs text-subtle text-center py-6">húzz ide</div>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ event, hidden, onClick }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: event.id,
  });
  const style = {
    transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
    opacity: hidden ? 0 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? onClick() : null)}
      className="touch-none select-none cursor-grab active:cursor-grabbing"
    >
      <EventCard event={event} />
    </div>
  );
}

function EventCard({ event, dragging }) {
  return (
    <div
      className={`bg-card border-2 border-ink rounded-xl p-3 hover:shadow-card transition ${
        dragging ? "shadow-card rotate-1" : ""
      }`}
    >
      <div className="text-[15px] font-medium leading-snug">{event.name}</div>
      <div className="text-xs text-subtle mt-0.5">
        {event.startDate
          ? new Date(event.startDate).toLocaleDateString("hu-HU", {
              month: "short",
              day: "numeric",
            })
          : "időpont nincs"}
        {event.expectedHeadcount ? ` · ${event.expectedHeadcount} fő` : ""}
      </div>

      {(event.rsvpRatio > 0 || event.status === "VEGLEGES") && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-subtle">
          <span>RSVP</span>
          <div className="meter flex-1">
            <i style={{ width: `${event.rsvpRatio}%` }} />
          </div>
          <span>{event.rsvpRatio}%</span>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <AvStack names={["A", "B"]} extra={event._count?.participants > 2 ? `+${event._count.participants - 2}` : undefined} />
        {event.status === "LEZAJLOTT" && event._count?.feedback > 0 && (
          <Chip>★ visszajelzés</Chip>
        )}
      </div>
    </div>
  );
}
