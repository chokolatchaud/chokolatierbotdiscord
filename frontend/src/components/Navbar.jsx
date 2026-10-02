import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Accueil", id: "nav-home" },
  { to: "/marche", label: "Marché", id: "nav-market" },
  { to: "/classement", label: "Classement", id: "nav-leaderboard" },
  { to: "/vote", label: "Vote", id: "nav-vote" },
  { to: "/guide", label: "Guide", id: "nav-guide" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#0A0A0B]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center" data-testid="brand-logo">
          <img
            src="/farmland-logo-navbar.png"
            alt="Farmland"
            className="h-12 w-auto object-contain"
          />
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
