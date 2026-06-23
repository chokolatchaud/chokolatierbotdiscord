import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Vote, Settings, Users, Activity, Server, ShieldCheck, ArrowRight, TrendingUp } from "lucide-react";

export default function AdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);
  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div
        className="relative overflow-hidden border border-border rounded-sm mb-10 px-6 md:px-10 py-10"
        style={{ background: "linear-gradient(115deg, #0F1115 0%, rgba(16,185,129,0.10) 60%, rgba(245,197,24,0.12) 100%)" }}
      >
        <p className="font-pixel text-xs text-gold">PANEL · {user?.role?.toUpperCase()}</p>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl mt-2">
          Bienvenue dans le panel, <span className="text-gold">{user?.username}</span>.
        </h1>
        <p className="text-zinc-300 mt-2 max-w-2xl text-sm md:text-base">
          Vue d'ensemble de Farm & Build. {isAdmin ? "Tu as accès à tout." : "En tant que modérateur, tu peux gérer les sites de vote."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat icon={<Activity />} label="JOUEURS EN LIGNE" value={`${stats?.online_players ?? "—"}/${stats?.max_players ?? "—"}`} testId="stat-online" />
        <Stat icon={<Users />} label="COMPTES" value={stats?.users_count ?? "—"} testId="stat-users" />
        <Stat icon={<TrendingUp />} label="STRUCTURES" value={stats?.structures_count ?? "—"} testId="stat-structs" />
        <Stat icon={<Vote />} label="SITES DE VOTE" value={stats?.vote_sites_count ?? "—"} testId="stat-votes" />
      </div>

      {/* Quick actions */}
      <p className="font-pixel text-xs text-zinc-500 mb-3">ACTIONS</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Tile to="/admin/votes" icon={<Vote />} title="Sites de vote" desc="Ajouter, modifier, supprimer" testId="tile-votes" />
        {isAdmin && <Tile to="/admin/settings" icon={<Settings />} title="Paramètres du site" desc="IP, maintenance, textes" testId="tile-settings" />}
        {isAdmin && <Tile to="/admin/users" icon={<ShieldCheck />} title="Utilisateurs & rôles" desc="Modérateurs, admins, comptes" testId="tile-users" />}
        <Tile to="/dashboard" icon={<Server />} title="Mon dashboard joueur" desc="Solde, structures, sécurité" testId="tile-dashboard" />
      </div>

      {stats?.maintenance && (
        <div className="mt-8 border border-amber-500/40 bg-amber-500/10 p-4 rounded-sm text-sm text-amber-300">
          ⚠️ Mode maintenance activé. Les visiteurs voient une bannière jaune.
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, testId }) {
  return (
    <div data-testid={testId} className="border border-border bg-[#121418] p-4 rounded-sm lift-card">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[10px] text-zinc-500">{label}</span>
        <span className="text-emerald-400">{icon}</span>
      </div>
      <p className="font-mono-stat font-bold text-2xl mt-2">{value}</p>
    </div>
  );
}

function Tile({ to, icon, title, desc, testId }) {
  return (
    <Link to={to} data-testid={testId} className="border border-border bg-[#121418] p-5 rounded-sm lift-card flex items-center gap-4 group">
      <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 rounded-sm group-hover:bg-emerald-500 group-hover:text-black transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold">{title}</h3>
        <p className="text-xs text-zinc-400">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
    </Link>
  );
}
