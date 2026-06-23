export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="font-pixel text-xs text-gold">FARM & BUILD</p>
          <p className="text-sm text-zinc-400 mt-1">
            Serveur Minecraft freebuild économique — mine.farm-and.fr
          </p>
        </div>
        <p className="text-xs text-zinc-500 font-mono-stat">
          © {new Date().getFullYear()} farm-and.fr · Non affilié à Mojang
        </p>
      </div>
    </footer>
  );
}
