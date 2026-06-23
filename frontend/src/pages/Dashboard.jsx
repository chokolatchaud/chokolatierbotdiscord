import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trophy, Wallet, Package, Link2, ArrowRight } from "lucide-react";
import ChangePasswordCard from "@/components/ChangePasswordCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/player/me")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="h-64 border border-border bg-[#121418] rounded-sm animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Hero banner */}
      <div
        data-testid="dashboard-hero"
        className="relative overflow-hidden border border-border rounded-sm mb-10 h-44 md:h-56"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/18419510/pexels-photo-18419510.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.7) 45%, rgba(245,197,24,0.18) 100%)",
          }}
        />
        <div className="absolute inset-0 pixel-grid opacity-40" />
        <div className="relative h-full flex flex-col justify-center px-6 md:px-10">
          <p className="font-pixel text-xs text-gold">DASHBOARD</p>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl mt-2 leading-tight">
            Bonjour, <span className="text-gold">{user.username}</span>.
          </h1>
          <p className="text-zinc-300 mt-2 text-sm md:text-base max-w-xl">
            Ton portefeuille de structures cotées sur le marché Farm & Build.
          </p>
        </div>
      </div>

      {!data?.linked && (
        <div
          data-testid="dashboard-not-linked"
          className="border border-amber-500/30 bg-amber-500/5 p-5 rounded-sm mb-8 flex items-center gap-4"
        >
          <Link2 className="w-5 h-5 text-amber-400" />
          <div>
            <p className="font-display font-semibold">Pas encore de données en jeu</p>
            <p className="text-sm text-zinc-400">
              Connecte-toi sur le serveur Minecraft avec le pseudo{" "}
              <span className="font-mono-stat text-emerald-400">{user.username}</span>{" "}
              pour que le plugin synchronise ton solde et tes structures.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatBlock
          icon={<Wallet className="w-5 h-5" />}
          label="SOLDE"
          value={`${(data?.balance || 0).toLocaleString("fr-FR")} $FB`}
          testId="dash-balance"
        />
        <StatBlock
          icon={<Trophy className="w-5 h-5" />}
          label="RANG"
          value={data?.rank ? `#${data.rank}` : "—"}
          testId="dash-rank"
        />
        <StatBlock
          icon={<Package className="w-5 h-5" />}
          label="STRUCTURES"
          value={data?.structures_count || 0}
          testId="dash-structures"
        />
      </div>

      {/* Owned structures */}
      <div className="border border-border bg-[#121418] rounded-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="font-pixel text-xs text-zinc-500">TES STRUCTURES</p>
          <Link to="/marche" className="text-emerald-400 hover:underline text-xs font-mono-stat flex items-center gap-1">
            Voir le marché <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {(!data?.owned_structures || data.owned_structures.length === 0) ? (
          <p className="p-8 text-center text-zinc-500 font-mono-stat text-sm" data-testid="no-owned">
            Aucune structure enregistrée. Construis et déclare-en sur le serveur.
          </p>
        ) : (
          <div data-testid="owned-list">
            {data.owned_structures.map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center px-5 py-3 border-b border-border last:border-0"
              >
                <div className="col-span-6 font-medium">{s.name}</div>
                <div className="col-span-2 text-right font-mono-stat text-zinc-400 text-sm">
                  x{s.qty || 1}
                </div>
                <div className="col-span-4 text-right font-mono-stat font-bold text-emerald-400">
                  {Number(s.value || 0).toLocaleString("fr-FR")}
                  <span className="text-zinc-500 text-xs ml-1">$FB</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {user.role === "admin" && (
        <div className="mt-10 border border-emerald-500/30 bg-emerald-500/5 p-5 rounded-sm flex items-center justify-between">
          <div>
            <p className="font-pixel text-xs text-emerald-400">ADMINISTRATEUR</p>
            <p className="font-display font-semibold mt-1">Tu peux configurer les sites de vote.</p>
          </div>
          <Link to="/admin/votes" data-testid="dash-admin-link">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm">
              Interface admin <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function StatBlock({ icon, label, value, testId }) {
  return (
    <div data-testid={testId} className="border border-border bg-[#121418] p-6 rounded-sm lift-card">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[10px] text-zinc-500">{label}</span>
        <span className="text-emerald-400">{icon}</span>
      </div>
      <p className="font-mono-stat font-bold text-3xl mt-3">{value}</p>
    </div>
  );
}
old text-3xl mt-3">{value}</p>
    </div>
  );
}
