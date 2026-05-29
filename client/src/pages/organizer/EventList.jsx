import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api.js";
import { Btn, StatusBadge, EmptyState, Spinner } from "../../components/primitives.jsx";

export default function EventList() {
  const [events, setEvents] = useState(null);
  useEffect(() => {
    api.get("/events").then(({ data }) => setEvents(data.events));
  }, []);

  if (!events) return <div className="p-8"><Spinner /></div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-head text-3xl">Eventek</h1>
          <p className="text-subtle text-sm mt-1">Összes eseményed lista-nézetben.</p>
        </div>
        <Btn primary as="link" to="/events/new">+ Új esemény</Btn>
      </header>

      {events.length === 0 ? (
        <EmptyState
          title="Nincs még esemény"
          hint="Hozd létre az elsőt — onnan már megy minden."
          action={<Btn primary as="link" to="/events/new">+ Új esemény</Btn>}
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper text-subtle text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Név</th>
                <th className="text-left px-4 py-3">Dátum</th>
                <th className="text-left px-4 py-3">Helyszín</th>
                <th className="text-left px-4 py-3">Státusz</th>
                <th className="text-right px-4 py-3">RSVP</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-line/60 hover:bg-paper/50">
                  <td className="px-4 py-3">
                    <Link to={`/events/${e.id}`} className="font-medium text-ink hover:text-brand-700">
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-subtle">
                    {e.startDate
                      ? new Date(e.startDate).toLocaleDateString("hu-HU")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-subtle">{e.location || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-right text-subtle">
                    {e.counts?.yes ?? 0} / {e._count?.participants ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
