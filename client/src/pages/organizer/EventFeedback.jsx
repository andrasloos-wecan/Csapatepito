import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api.js";
import { Spinner, EmptyState } from "../../components/primitives.jsx";

export default function EventFeedback() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [fb, setFb] = useState(null);

  useEffect(() => {
    Promise.all([api.get(`/events/${id}`), api.get(`/feedback`, { params: { eventId: id } })]).then(
      ([a, b]) => {
        setEvent(a.data.event);
        setFb(b.data);
      }
    );
  }, [id]);

  if (!event || !fb) return <div className="p-8"><Spinner /></div>;

  const s = fb.summary;

  return (
    <div className="p-8 max-w-[1000px] mx-auto pb-24">
      <Link to={`/events/${id}`} className="text-xs text-subtle hover:text-ink">
        ← {event.name}
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-head text-3xl">Visszajelzés</h1>
        <p className="text-subtle text-sm mt-1">
          {s.count} válasz · Az eredmény bemutatható PDF-ben is.
        </p>
      </header>

      {s.count === 0 ? (
        <EmptyState
          title="Még nincs válasz"
          hint="A résztvevők a token-linkjükön át küldhetnek visszajelzést — a vége után kapnak emlékeztetőt."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Kpi label="Válaszok" value={s.count} />
            <Kpi label="Átlag csillag" value={`${s.avgRating} / 5`} />
            <Kpi label="Átlag NPS" value={s.avgNps} />
            <Kpi label="NPS pontszám" value={s.npsScore} accent />
          </div>

          <section className="card">
            <h2 className="font-head text-xl mb-3">Szöveges válaszok</h2>
            <div className="space-y-3">
              {fb.items.map((it) => (
                <div key={it.id} className="border-l-4 border-brand-300 pl-3">
                  <div className="text-xs text-subtle flex items-center justify-between">
                    <span>
                      {it.anonymous
                        ? "Anonim"
                        : it.participant?.name || "Résztvevő"}
                    </span>
                    <span>
                      {it.rating ? `★ ${it.rating}` : ""}
                      {it.nps != null ? `  ·  NPS ${it.nps}` : ""}
                    </span>
                  </div>
                  {it.text && <div className="text-sm mt-1">„{it.text}"</div>}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }) {
  return (
    <div className={`card ${accent ? "card-accent" : ""}`}>
      <div className="label">{label}</div>
      <div className={`font-head text-3xl mt-1 ${accent ? "text-brand-600" : ""}`}>
        {value}
      </div>
    </div>
  );
}
