import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api.js";
import { Chip, Btn, Spinner } from "../../components/primitives.jsx";

export default function ActivityDetail() {
  const { id } = useParams();
  const [a, setA] = useState(null);

  useEffect(() => {
    api.get(`/activities/${id}`).then(({ data }) => setA(data.activity));
  }, [id]);

  if (!a) return <div className="p-8"><Spinner /></div>;

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <Link to="/activities" className="text-xs text-subtle hover:text-ink">
        ← Aktivitás könyvtár
      </Link>

      <header className="mt-3 mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-5xl">{a.imageEmoji}</span>
            <h1 className="font-head text-4xl">{a.name}</h1>
          </div>
          <p className="text-subtle mt-2 max-w-2xl">{a.description}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Időtartam" value={`${a.durationMin} perc`} />
        <Stat label="Létszám" value={`${a.minSize}–${a.maxSize} fő`} />
        <Stat
          label="Helyszín"
          value={a.indoor && a.outdoor ? "Bel/Kül" : a.indoor ? "Beltér" : "Kültér"}
        />
        <Stat
          label="Energia"
          value={
            a.energyLevel === "ALACSONY"
              ? "Alacsony"
              : a.energyLevel === "MAGAS"
              ? "Magas"
              : "Közepes"
          }
        />
      </div>

      {a.materials && (
        <Section title="Eszközök">
          <p className="text-sm">{a.materials}</p>
        </Section>
      )}

      {a.steps?.length > 0 && (
        <Section title="Lépések">
          <ol className="space-y-2">
            {a.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="h-6 w-6 inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-xs flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {a.tips && (
        <Section title="Tippek">
          <p className="text-sm whitespace-pre-line">{a.tips}</p>
        </Section>
      )}

      {a.variations && (
        <Section title="Variációk">
          <p className="text-sm whitespace-pre-line">{a.variations}</p>
        </Section>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="font-medium mt-1">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="card mb-4">
      <h2 className="font-head text-xl mb-3">{title}</h2>
      {children}
    </section>
  );
}
