import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setS(r.data)).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(false); setBusy(true);
    try {
      const { data } = await api.put("/admin/settings", s);
      setS(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) { setError(formatApiError(e)); }
    finally { setBusy(false); }
  };

  if (loading || !s) {
    return <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="h-96 border border-border bg-[#121418] animate-pulse rounded-sm" />
    </div>;
  }

  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-pixel text-xs text-gold">ADMIN · CONTENU DU SITE</p>
          <h1 className="font-display font-extrabold text-4xl mt-2">Paramètres du site.</h1>
        </div>
        <Button variant="ghost" onClick={() => navigate("/admin/votes")} data-testid="admin-back-votes">
          <ArrowLeft className="w-4 h-4 mr-2" /> Sites de vote
        </Button>
      </div>

      <form onSubmit={save} className="space-y-6" data-testid="admin-settings-form">
        {/* Maintenance */}
        <div className="border border-border bg-[#121418] rounded-sm">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <p className="font-pixel text-xs text-amber-400">MODE MAINTENANCE</p>
          </div>
          <div className="p-5 space-y-4">
            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display font-semibold">Activer la maintenance</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Affiche une bannière visible sur toutes les pages publiques.
                </p>
              </div>
              <Switch
                data-testid="settings-maintenance-toggle"
                checked={s.maintenance}
                onCheckedChange={(v) => setS({ ...s, maintenance: v })}
              />
            </label>
            <div>
              <Label className="font-pixel text-[10px] text-zinc-400">MESSAGE DE MAINTENANCE</Label>
              <Textarea
                data-testid="settings-maintenance-message"
                value={s.maintenance_message}
                onChange={set("maintenance_message")}
                rows={2}
                className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Server info */}
        <div className="border border-border bg-[#121418] rounded-sm">
          <div className="px-5 py-4 border-b border-border">
            <p className="font-pixel text-xs text-emerald-400">SERVEUR</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <Label className="font-pixel text-[10px] text-zinc-400">IP DU SERVEUR</Label>
              <Input
                data-testid="settings-ip"
                value={s.ip}
                onChange={set("ip")}
                placeholder="mine.farm-and.fr"
                className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
                required
              />
            </div>
            <div>
              <Label className="font-pixel text-[10px] text-zinc-400">MOTD (BASELINE)</Label>
              <Input
                data-testid="settings-motd"
                value={s.motd}
                onChange={set("motd")}
                className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
              />
            </div>
            <div>
              <Label className="font-pixel text-[10px] text-zinc-400">DISCORD URL (optionnel)</Label>
              <Input
                data-testid="settings-discord"
                value={s.discord_url || ""}
                onChange={set("discord_url")}
                placeholder="https://discord.gg/..."
                className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
              />
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="border border-border bg-[#121418] rounded-sm">
          <div className="px-5 py-4 border-b border-border">
            <p className="font-pixel text-xs text-emerald-400">TEXTES DE L'ACCUEIL</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <Label className="font-pixel text-[10px] text-zinc-400">MOT EN ACCENT DORÉ (HERO)</Label>
              <Input
                data-testid="settings-hero-accent"
                value={s.hero_title_accent}
                onChange={set("hero_title_accent")}
                className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Apparait dans : « Le freebuild <span className="text-gold">{s.hero_title_accent}</span> par l'économie. »
              </p>
            </div>
            <div>
              <Label className="font-pixel text-[10px] text-zinc-400">SOUS-TITRE</Label>
              <Textarea
                data-testid="settings-hero-subtitle"
                value={s.hero_subtitle}
                onChange={set("hero_subtitle")}
                rows={3}
                className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1 text-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 font-mono-stat" data-testid="settings-error">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-400 font-mono-stat" data-testid="settings-success">
            ✓ Paramètres enregistrés. Rafraîchis les pages publiques pour voir le résultat.
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={busy}
            data-testid="settings-save"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {busy ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
