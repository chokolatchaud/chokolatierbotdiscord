import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, Tooltip, YAxis,
} from "recharts";

const ICONES = {
  Mineur: "⛏️",
  Farmeur: "🌾",
  Pecheur: "🐟",
  Agriculteur: "🐷",
  Tueur: "⚔️",
};

export default function Market() {
  const [metiers, setMetiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      api.get("/market/metiers")
        .then((r) => setMetiers(r.data))
        .finally(() => setLoading(false));
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <p className="font-pixel text-xs text-emerald-400">MARCHÉ EN TEMPS RÉEL</p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl mt-2">
          Le marché des métiers.
        </h1>
        <p className="text-zinc-400 mt-2 max-w-2xl">
          Chaque métier a son propre Jeton, dont le prix évolue selon l'offre et la demande.
          Trop de ventes fait chuter le prix — surveille le marché avant de vendre.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-border bg-[#121418] h-64 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : metiers.length === 0 ? (
        <div className="border border-dashed border-border rounded-sm p-12 text-center" data-testid="market-empty">
          <p className="font-pixel text-xs text-zinc-500">MARCHÉ VIDE</p>
          <p className="text-zinc-400 mt-3">
            Aucun métier coté pour le moment.
          </p>
          <p className="text-xs text-zinc-500 mt-2 font-mono-stat">
            Le marché se peuplera dès que ton plugin pousse les premiers prix sur{" "}
            <code className="text-emerald-400">POST /api/market/metiers</code>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="market-grid">
          {metiers.map((m) => (
            <MetierCard key={m.metier} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MetierCard({ m }) {
  const up = (m.change_pct || 0) >= 0;
  const color = up ? "#10B981" : "#EF4444";
  const data = (m.history || []).map((h, i) => ({ i, price: h.price }));

  return (
    <div
      data-testid={`metier-card-${m.metier}`}
      className="border border-border bg-[#121418] p-5 rounded-sm lift-card flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="font-pixel text-[10px] text-zinc-500">JETON</span>
          <h3 className="font-display font-bold text-lg mt-1">
            {ICONES[m.metier] || ""} {m.metier}
          </h3>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-mono-stat font-bold ${
            up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {up ? "+" : ""}{m.change_pct}%
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <p className="font-mono-stat font-bold text-3xl">
          {Number(m.prix_actuel).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
          <span className="text-sm text-zinc-500 ml-1">$FB</span>
        </p>
        {m.coefficient != null && (
          <span className="text-xs font-mono-stat text-zinc-500">
            marché à {m.coefficient}%
          </span>
        )}
      </div>

      <div className="mt-4 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id={`g-${m.metier}`} x1="0" y1="0" x2="0" y2="1">
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
