import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Pickaxe } from "lucide-react";

const links = [
  { to: "/", label: "Accueil", id: "nav-home" },
  { to: "/marche", label: "Marché", id: "nav-market" },
  { to: "/classement", label: "Classement", id: "nav-leaderboard" },
  { to: "/vote", label: "Vote", id: "nav-vote" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#0A0A0B]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
          <div className="w-8 h-8 flex items-center justify-center rounded-sm" style={{background: "linear-gradient(135deg, #10B981 0%, #F5C518 100%)"}}>
            <Pickaxe className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-lg tracking-tight">Farm & Build</span>
            <span className="font-pixel text-[10px] text-gold">FREEBUILD ÉCONOMIQUE</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={l.id}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && user !== false ? (
            <>
              <Link
                to="/dashboard"
                data-testid="nav-dashboard"
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-emerald-400 transition-colors"
              >
                Dashboard
              </Link>
              {(user.role === "admin" || user.role === "moderator") && (
                <Link
                  to="/admin"
                  data-testid="nav-admin"
                  className="hidden sm:inline-flex px-3 py-1.5 text-xs font-pixel text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-sm hover:bg-amber-500/20"
                >
                  {user.role === "admin" ? "ADMIN" : "STAFF"}
                </Link>
              )}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-border rounded-sm">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono-stat text-xs" data-testid="navbar-username">
                  {user.username}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => { await logout(); navigate("/"); }}
                data-testid="logout-btn"
                className="bg-transparent border-border hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : user === false ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate("/login")}
                data-testid="login-nav-btn"
                className="text-zinc-300 hover:text-white"
              >
                Connexion
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/register")}
                data-testid="register-nav-btn"
                className="bg-gold hover:bg-yellow-500 text-black font-semibold"
              >
                S'inscrire
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-border flex overflow-x-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            data-testid={`${l.id}-mobile`}
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
