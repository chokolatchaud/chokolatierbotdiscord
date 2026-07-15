import { Link, NavLink } from "react-router-dom";
import { Pickaxe } from "lucide-react";

const links = [
  { to: "/", label: "Accueil", id: "nav-home" },
  { to: "/marche", label: "Marché", id: "nav-market" },
  { to: "/classement", label: "Classement", id: "nav-leaderboard" },
  { to: "/vote", label: "Vote", id: "nav-vote" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#0A0A0B]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
          <div className="w-8 h-8 flex items-center justify-center rounded-sm" style={{background: "linear-gradient(135deg, #10B981 0%, #F5C518 100%)"}}>
            <Pickaxe className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-lg tracking-tight">Farmland</span>
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
