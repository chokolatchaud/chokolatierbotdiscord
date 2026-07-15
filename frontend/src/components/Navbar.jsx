import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck } from "lucide-react";

const links = [
  { to: "/",           label: "Accueil",    id: "nav-home" },
  { to: "/marche",     label: "Marché",     id: "nav-market" },
  { to: "/classement", label: "Classement", id: "nav-leaderboard" },
  { to: "/vote",       label: "Vote",       id: "nav-vote" },
  { to: "/guide",      label: "Guide",      id: "nav-guide" },
];

const ADMIN_PATH = process.env.REACT_APP_ADMIN_PATH || "admin_secret";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#0A0A0B]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo192.png" alt="Farm & Build" className="w-8 h-8 rounded-sm object-cover" />
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-lg tracking-tight">Farm & Build</span>
            <span className="font-pixel text-[10px] text-gold">FREEBUILD ÉCONOMIQUE</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                  isActive ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Bouton admin visible uniquement si connecté */}
        <div className="flex items-center gap-2">
          {user && user !== false ? (
            <>
              <Link to={`/${ADMIN_PATH}`}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-pixel text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-sm hover:bg-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMIN
              </Link>
              <Button size="sm" variant="outline"
                onClick={async () => { await logout(); navigate("/"); }}
                className="bg-transparent border-border hover:bg-white/5">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-border flex overflow-x-auto">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"}
            className={({ isActive }) =>
              `px-4 py-2 text-xs font-medium whitespace-nowrap ${
                isActive ? "text-emerald-400 border-b-2 border-emerald-400" : "text-zinc-400"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
