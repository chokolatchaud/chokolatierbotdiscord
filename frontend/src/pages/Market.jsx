import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  LineChart, Line, ResponsiveContainer, Tooltip, YAxis,
} from "recharts";

export default function Market() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = () => {
      api.get("/market/structures")
        .then((r) => setStructures(r.data))
        .finally(() => setLoading(false));
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const filtered = structures.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    (s.category || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-pixel text-xs text-emerald-400">MARCHÉ EN TEMPS RÉEL</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl mt-2">
            Le marché des structures.
          </h1>
          <p className="text-zinc-400 mt-2 max-w-2xl">
            Les prix sont mis à jour par le plugin économique du serveur Farm & Build.
            Achète bas, construis grand, vends haut.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            data-testid="market-search"
            placeholder="Rechercher une structure..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-[#121418] border-border rounded-sm font-mono-stat text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-border bg-[#121418] h-64 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-zinc-400 font-mono-stat py-12 text-center">Aucune structure trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="market-grid">
          {filtered.map((s) => (
            <StructureCard key={s.name} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function StructureCard({ s }) {
  const up = (s.change_pct || 0) >= 0;
  const color = up ? "#10B981" : "#EF4444";
  const data = (s.history || []).map((h, i) => ({ i, price: h.price }));

  return (
    <div
      data-testid={`structure-card-${s.name}`}
      className="border border-border bg-[#121418] p-5 rounded-sm lift-card flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="font-pixel text-[10px] text-zinc-500">{s.category}</span>
          <h3 className="font-display font-bold text-lg mt-1">{s.name}</h3>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-mono-stat font-bold ${
            up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {up ? "+" : ""}{s.change_pct}%
        </div>
      </div>

      <div className="mt-4">
        <p className="font-mono-stat font-bold text-3xl">
          {Number(s.price).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
          <span className="text-sm text-zinc-500 ml-1">$FB</span>
        </p>
      </div>

      <div className="mt-4 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id={`g-${s.name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin", "dataMax"]} />
            <Tooltip
              contentStyle={{
                background: "#0A0A0B",
                border: "1px solid #2A2E35",
                borderRadius: 4,
                fontFamily: "JetBrains Mono",
                fontSize: 11,
              }}
              labelFormatter={() => ""}
              formatter={(v) => [Number(v).toFixed(2) + " $FB", "Prix"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
