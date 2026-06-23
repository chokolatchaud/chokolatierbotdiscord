import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import IPCopier from "@/components/IPCopier";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ArrowRight, TrendingUp, Trophy, Vote, Users, Zap } from "lucide-react";

export default function Home() {
  const [status, setStatus] = useState({ online_players: 0, max_players: 100, version: "1.21" });
  const [structures, setStructures] = useState([]);

  useEffect(() => {
    api.get("/server/status").then((r) => setStatus(r.data)).catch(() => {});
    api.get("/market/structures").then((r) => setStructures(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/18419510/pexels-photo-18419510.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/50 via-[#0A0A0B]/80 to-[#0A0A0B]" />
        <div className="absolute inset-0 pixel-grid opacity-50" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-emerald" />
              <span className="font-pixel text-[10px] text-emerald-300">
                SERVEUR EN LIGNE · {status.online_players}/{status.max_players} JOUEURS
              </span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight mt-6 leading-[1.05]">
              Le freebuild
              <br />
              <span className="text-gold">réinventé</span> par l'économie.
            </h1>

            <p className="mt-6 text-base md:text-lg text-zinc-400 max-w-xl">
              Construis ce que tu veux. Définis tes structures. Le marché fixe leur valeur.
              Plus la demande monte, plus tu gagnes. Bienvenue sur Farm & Build.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <IPCopier ip="mine.farm-and.fr" />
              <Link to="/marche" data-testid="cta-market">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm h-[60px] px-6">
                  Voir le marché <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BENTO */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="JOUEURS CONNECTÉS"
            value={status.online_players}
            sub={`Capacité max ${status.max_players}`}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="STRUCTURES COTÉES"
            value={structures.length || 8}
            sub="Marché en temps réel"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="VERSION"
            value={status.version}
            sub="Java Edition"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-6 py-16 border-t border-border">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-pixel text-xs text-emerald-400">COMMENT ÇA MARCHE</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-2">
              Construis. Cote. Encaisse.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              n: "01",
              t: "Définis ta structure",
              d: "Construis librement et déclare ta structure auprès du plugin économique. Donne-lui un nom, une catégorie.",
            },
            {
              n: "02",
              t: "Le marché évalue",
              d: "Le plugin observe la rareté, la demande et la complexité. Une courbe de prix dynamique apparaît sur le site.",
            },
            {
              n: "03",
              t: "Gagne en argent réel du serveur",
              d: "Vends tes structures cotées sur le marché. Plus la demande grimpe, plus ta fortune explose.",
            },
          ].map((s) => (
            <div key={s.n} className="border border-border bg-[#121418] p-6 rounded-sm lift-card relative">
              <span className="font-pixel text-emerald-400 text-xs">{s.n}</span>
              <h3 className="font-display font-bold text-xl mt-3">{s.t}</h3>
              <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="mx-auto max-w-7xl px-6 py-16 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickLink to="/marche" icon={<TrendingUp />} title="Marché" desc="Cours en temps réel des structures" testId="quick-market" />
          <QuickLink to="/classement" icon={<Trophy />} title="Classement" desc="Top des plus grosses fortunes" testId="quick-leaderboard" />
          <QuickLink to="/vote" icon={<Vote />} title="Voter" desc="Soutiens le serveur, gagne des récompenses" testId="quick-vote" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="border border-border bg-[#121418] p-6 rounded-sm lift-card">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[10px] text-zinc-500">{label}</span>
        <span className="text-emerald-400">{icon}</span>
      </div>
      <p className="font-mono-stat font-bold text-4xl mt-3">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{sub}</p>
    </div>
  );
}

function QuickLink({ to, icon, title, desc, testId }) {
  return (
    <Link
      to={to}
      data-testid={testId}
      className="border border-border bg-[#121418] p-6 rounded-sm lift-card flex items-center gap-4 group"
    >
      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 rounded-sm group-hover:bg-emerald-500 group-hover:text-black transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold text-lg">{title}</h3>
        <p className="text-xs text-zinc-400">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
    </Link>
  );
}
