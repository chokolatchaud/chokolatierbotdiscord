import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ExternalLink, Gift, Vote as VoteIcon, Clock } from "lucide-react";

export default function Vote() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vote/sites")
      .then((r) => setSites(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <p className="font-pixel text-xs text-emerald-400">SOUTIENS LE SERVEUR</p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl mt-2">
          Vote & gagne.
        </h1>
        <p className="text-zinc-400 mt-2 max-w-2xl">
          Chaque vote nous aide à grimper dans les classements et te rapporte des
          récompenses en jeu. Vote sur les 4 plateformes toutes les 24 heures.
        </p>
      </div>

      <div className="border border-emerald-500/20 bg-emerald-500/5 p-5 rounded-sm mb-8 flex items-center gap-4" data-testid="vote-info-banner">
        <div className="w-10 h-10 bg-emerald-500/20 flex items-center justify-center rounded-sm">
          <Clock className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="font-display font-semibold">Récompenses automatiques</p>
          <p className="text-sm text-zinc-400">
            Connecte-toi sur le serveur avec ton pseudo pour recevoir tes récompenses après vote.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 border border-border bg-[#121418] animate-pulse rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-testid="vote-sites-list">
          {sites.map((site, idx) => (
            <div
              key={site.name}
              data-testid={`vote-site-${idx + 1}`}
              className="border border-border bg-[#121418] p-5 rounded-sm lift-card flex items-center gap-5"
            >
              <div className="w-12 h-12 bg-[#0A0A0B] border border-border flex items-center justify-center rounded-sm">
                <span className="font-pixel text-emerald-400 text-sm">#{idx + 1}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg">{site.name}</h3>
                  {!site.configured && (
                    <span className="font-pixel text-[9px] text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-sm">
                      À CONFIGURER
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-sm text-zinc-400">
                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{site.reward}</span>
                </div>
              </div>

              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`vote-btn-${idx + 1}`}
              >
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm">
                  <VoteIcon className="w-4 h-4 mr-2" />
                  Voter
                  <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
                </Button>
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 border border-dashed border-border p-6 rounded-sm">
        <p className="font-pixel text-xs text-zinc-500">POUR L'ADMINISTRATEUR</p>
        <p className="text-sm text-zinc-400 mt-2">
          Cette page est prête à recevoir les liens de vote réels. Configure les URL des
          sites dans la base de données <code className="font-mono-stat text-emerald-400">vote_sites</code> ou
          via une future interface admin. Le plugin Minecraft pourra créditer
          automatiquement les récompenses via l'endpoint <code className="font-mono-stat text-emerald-400">POST /api/leaderboard</code>.
        </p>
      </div>
    </div>
  );
}
