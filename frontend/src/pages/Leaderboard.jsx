import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Crown, Medal, Trophy } from "lucide-react";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leaderboard")
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <p className="font-pixel text-xs text-emerald-400">CLASSEMENT</p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl mt-2">
          Top des fortunes.
        </h1>
        <p className="text-zinc-400 mt-2">
          Les architectes les plus riches du serveur Farm & Build.
        </p>
      </div>

      {/* Podium */}
      {rows.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-8" data-testid="podium">
          {[rows[1], rows[0], rows[2]].map((p, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const height = rank === 1 ? "h-44" : rank === 2 ? "h-36" : "h-32";
            const color = rank === 1 ? "text-yellow-400" : rank === 2 ? "text-zinc-300" : "text-amber-700";
            const Icon = rank === 1 ? Crown : rank === 2 ? Trophy : Medal;
            return (
              <div key={p.username} className="flex flex-col items-center">
                <Icon className={`w-8 h-8 ${color} mb-2`} />
                <p className="font-display font-bold text-sm md:text-base text-center truncate w-full">
                  {p.username}
                </p>
                <p className="font-mono-stat font-bold text-emerald-400 text-xs md:text-sm">
                  {p.balance.toLocaleString("fr-FR")} $FB
                </p>
                <div className={`mt-3 w-full ${height} border border-border bg-gradient-to-t from-emerald-500/10 to-transparent rounded-sm flex items-start justify-center pt-3`}>
                  <span className={`font-pixel ${color} text-2xl`}>#{rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border border-border rounded-sm overflow-hidden bg-[#121418]" data-testid="leaderboard-table">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-border bg-[#0F1115] text-[10px] font-pixel text-zinc-500">
          <div className="col-span-1">RANG</div>
          <div className="col-span-5">JOUEUR</div>
          <div className="col-span-3 text-right">STRUCTURES</div>
          <div className="col-span-3 text-right">SOLDE</div>
        </div>

        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-14 border-b border-border animate-pulse bg-[#15181F]/30" />
          ))
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-zinc-500 font-mono-stat text-sm">
            Aucune donnée. Le plugin n'a pas encore publié de classement.
          </p>
        ) : (
          rows.map((r, i) => (
            <div
              key={r.username}
              data-testid={`leaderboard-row-${i + 1}`}
              className="grid grid-cols-12 items-center px-5 py-3 border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="col-span-1 font-mono-stat font-bold text-zinc-400">
                #{i + 1}
              </div>
              <div className="col-span-5 font-medium">{r.username}</div>
              <div className="col-span-3 text-right font-mono-stat text-zinc-400 text-sm">
                {r.structures}
              </div>
              <div className="col-span-3 text-right font-mono-stat font-bold text-emerald-400">
                {r.balance.toLocaleString("fr-FR")}
                <span className="text-zinc-500 text-xs ml-1">$FB</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
