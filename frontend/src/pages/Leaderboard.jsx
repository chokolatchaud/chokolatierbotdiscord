import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Crown, Medal, Trophy, Coins, Building2, Hammer } from "lucide-react";

const TABS = [
  { id: "argent",     label: "Argent",     endpoint: "/leaderboard/argent",     icon: Coins,     unit: "$FB",  field: "balance",    color: "text-yellow-400" },
  { id: "structures", label: "Structures", endpoint: "/leaderboard/structures", icon: Building2, unit: "str.", field: "structures", color: "text-emerald-400" },
  { id: "blocpose",   label: "Bâtisseurs", endpoint: "/leaderboard/blocpose",   icon: Hammer,    unit: "blocs", field: "blocpose",  color: "text-blue-400" },
];

function formatVal(val, unit) {
  if (unit === "$FB") {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M $FB";
    if (val >= 1_000)     return (val / 1_000).toFixed(1) + "k $FB";
    return val + " $FB";
  }
  if (unit === "blocs") {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M blocs";
    if (val >= 1_000)     return (val / 1_000).toFixed(1) + "k blocs";
    return val + " blocs";
  }
  return val + " " + unit;
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("argent");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = TABS.find(t => t.id === activeTab);
    if (data[activeTab]) return;
    setLoading(true);
    api.get(tab.endpoint)
      .then(r => setData(prev => ({ ...prev, [activeTab]: r.data })))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const tab = TABS.find(t => t.id === activeTab);
  const rows = data[activeTab] || [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="font-pixel text-xs text-emerald-400">CLASSEMENT</p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl mt-2">Top des joueurs.</h1>
        <p className="text-zinc-400 mt-2">Les meilleurs architectes de Farmland.</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-8">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm font-pixel text-xs transition-colors ${
                activeTab === t.id
                  ? "bg-emerald-500 text-black"
                  : "border border-border text-zinc-400 hover:border-emerald-500 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center text-zinc-500 py-20">Chargement...</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-zinc-500 py-20">Aucun joueur classé pour l'instant.</div>
      ) : (
        <>
          {/* Podium top 3 */}
          {rows.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[rows[1], rows[0], rows[2]].map((p, i) => {
                const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
                const height = rank === 1 ? "h-44" : rank === 2 ? "h-36" : "h-32";
                const colorCls = rank === 1 ? "text-yellow-400" : rank === 2 ? "text-zinc-300" : "text-amber-700";
                const Icon = rank === 1 ? Crown : rank === 2 ? Trophy : Medal;
                const gradient = rank === 1
                  ? "from-yellow-500/15 via-emerald-500/5 to-transparent"
                  : "from-emerald-500/10 to-transparent";
                return (
                  <div key={p.username} className="flex flex-col items-center">
                    <Icon className={`w-8 h-8 ${colorCls} mb-2`} />
                    <p className="font-display font-bold text-sm md:text-base text-center truncate w-full">
                      {p.username}
                    </p>
                    <p className={`font-mono font-bold text-xs md:text-sm ${tab.color}`}>
                      {formatVal(p[tab.field] || 0, tab.unit)}
                    </p>
                    <div className={`mt-3 w-full ${height} border ${rank === 1 ? "border-yellow-500/30" : "border-border"} bg-gradient-to-t ${gradient} rounded-sm flex items-start justify-center pt-3`}>
                      <span className={`font-pixel ${colorCls} text-2xl`}>#{rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Liste rang 4-20 */}
          <div className="border border-border rounded-sm overflow-hidden bg-[#121418]">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-border bg-[#0F1115] text-[10px] font-pixel text-zinc-500">
              <div className="col-span-1">RANG</div>
              <div className="col-span-7">JOUEUR</div>
              <div className="col-span-4 text-right">{tab.label.toUpperCase()}</div>
            </div>
            {rows.slice(3).map((p, idx) => (
              <div key={p.username}
                className="grid grid-cols-12 px-5 py-3 border-b border-border/50 last:border-0 hover:bg-white/3 transition-colors">
                <div className="col-span-1 font-pixel text-zinc-500 text-sm">#{idx + 4}</div>
                <div className="col-span-7 font-display font-bold truncate">{p.username}</div>
                <div className={`col-span-4 text-right font-mono font-bold ${tab.color}`}>
                  {formatVal(p[tab.field] || 0, tab.unit)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
