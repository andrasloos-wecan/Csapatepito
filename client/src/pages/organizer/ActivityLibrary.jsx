import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api.js";
import { Chip, Btn, EmptyState, Spinner } from "../../components/primitives.jsx";

const CATEGORIES = [
  { v: "", l: "Mind" },
  { v: "JEGTORO", l: "Jégtörő" },
  { v: "KOMMUNIKACIO", l: "Kommunikáció" },
  { v: "BIZALOM", l: "Bizalom" },
  { v: "PROBLEMA", l: "Problémamegoldó" },
  { v: "KREATIV", l: "Kreatív" },
  { v: "FIZIKAI", l: "Fizikai" },
  { v: "ONLINE", l: "Online" },
  { v: "KVIZ", l: "Kvíz" },
];

const ENERGY = [
  { v: "", l: "bármi" },
  { v: "ALACSONY", l: "alacsony" },
  { v: "KOZEPES", l: "közepes" },
  { v: "MAGAS", l: "magas" },
];

export default function ActivityLibrary() {
  const [filters, setFilters] = useState({
    category: "",
    q: "",
    minSize: "",
    indoor: false,
    outdoor: false,
    energy: "",
    durationMax: "",
  });
  const [items, setItems] = useState(null);

  useEffect(() => {
    const params = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v === "" || v === false) continue;
      params[k] = v;
    }
    api.get("/activities", { params }).then(({ data }) => setItems(data.activities));
  }, [filters]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <h1 className="font-head text-3xl">Aktivitás könyvtár</h1>
        <p className="text-subtle text-sm mt-1">
          Szűrd a kínálatot, és add hozzá a tervezett eventjeidhez.
        </p>
      </header>

      <div className="grid grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-5">
          <div>
            <div className="label mb-2">Kategória</div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.v}
                  onClick={() => setFilters({ ...filters, category: c.v })}
                  className={
                    filters.category === c.v
                      ? "chip chip-on text-xs"
                      : "chip chip-ghost text-xs"
                  }
                >
                  {c.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label mb-2">Keresés</div>
            <input
              className="input"
              placeholder="cím vagy leírás…"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>

          <div>
            <div className="label mb-2">Létszám (legalább)</div>
            <input
              type="number"
              className="input"
              placeholder="pl. 10"
              value={filters.minSize}
              onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
            />
          </div>

          <div>
            <div className="label mb-2">Maximális hossz (perc)</div>
            <input
              type="number"
              className="input"
              placeholder="pl. 60"
              value={filters.durationMax}
              onChange={(e) => setFilters({ ...filters, durationMax: e.target.value })}
            />
          </div>

          <div>
            <div className="label mb-2">Helyszín</div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, indoor: !filters.indoor })}
                className={filters.indoor ? "chip chip-on" : "chip"}
              >
                Beltér
              </button>
              <button
                onClick={() => setFilters({ ...filters, outdoor: !filters.outdoor })}
                className={filters.outdoor ? "chip chip-on" : "chip"}
              >
                Kültér
              </button>
            </div>
          </div>

          <div>
            <div className="label mb-2">Energia</div>
            <div className="flex flex-wrap gap-1.5">
              {ENERGY.map((e) => (
                <button
                  key={e.v}
                  onClick={() => setFilters({ ...filters, energy: e.v })}
                  className={
                    filters.energy === e.v
                      ? "chip chip-on text-xs"
                      : "chip chip-ghost text-xs"
                  }
                >
                  {e.l}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {!items ? (
            <Spinner />
          ) : items.length === 0 ? (
            <EmptyState
              title="Nincs találat"
              hint="Lazíts a szűrőkön, vagy hozz létre saját aktivitást."
            />
          ) : (
            <>
              <div className="text-xs text-subtle mb-3">{items.length} találat</div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map((a) => (
                  <ActivityCard key={a.id} a={a} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ a }) {
  return (
    <Link
      to={`/activities/${a.id}`}
      className="card hover:shadow-card transition flex flex-col"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{a.imageEmoji}</span>
        <Chip className="text-xs">
          {a.category === "JEGTORO"
            ? "Jégtörő"
            : a.category === "KOMMUNIKACIO"
            ? "Kommunikáció"
            : a.category === "BIZALOM"
            ? "Bizalom"
            : a.category === "PROBLEMA"
            ? "Problémamegoldó"
            : a.category === "KREATIV"
            ? "Kreatív"
            : a.category === "FIZIKAI"
            ? "Fizikai"
            : a.category === "ONLINE"
            ? "Online"
            : "Kvíz"}
        </Chip>
      </div>
      <div className="font-medium leading-snug">{a.name}</div>
      <p className="text-xs text-subtle mt-1 line-clamp-2 flex-1">{a.description}</p>
      <div className="text-xs text-subtle mt-3 flex flex-wrap gap-x-3 gap-y-1">
        <span>⏱ {a.durationMin} perc</span>
        <span>👥 {a.minSize}–{a.maxSize}</span>
        <span>{a.indoor && a.outdoor ? "bel/kül" : a.indoor ? "beltér" : "kültér"}</span>
      </div>
    </Link>
  );
}
