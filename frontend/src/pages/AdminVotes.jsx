import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Check, X, Vote as VoteIcon, Settings } from "lucide-react";

const empty = { name: "", url: "", reward: "", order: 1, configured: true };

export default function AdminVotes() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(empty);
  const [editName, setEditName] = useState(null);
  const [editDraft, setEditDraft] = useState(empty);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/vote-sites");
      setSites(data);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submitNew = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/vote-sites", draft);
      setDraft(empty);
      setCreating(false);
      load();
    } catch (e) { setError(formatApiError(e)); }
  };

  const startEdit = (s) => {
    setEditName(s.name);
    setEditDraft({ ...s });
  };

  const saveEdit = async () => {
    setError("");
    try {
      await api.put(`/admin/vote-sites/${encodeURIComponent(editName)}`, editDraft);
      setEditName(null);
      load();
    } catch (e) { setError(formatApiError(e)); }
  };

  const removeSite = async (name) => {
    if (!confirm(`Supprimer le site "${name}" ?`)) return;
    try {
      await api.delete(`/admin/vote-sites/${encodeURIComponent(name)}`);
      load();
    } catch (e) { setError(formatApiError(e)); }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-pixel text-xs text-emerald-400">ADMIN · SITES DE VOTE</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl mt-2">
            Configure les votes.
          </h1>
          <p className="text-zinc-400 mt-2 max-w-2xl">
            Ajoute, modifie ou supprime les plateformes de vote. Les changements
            sont visibles immédiatement sur la page publique.
          </p>
        </div>
        <Button
          onClick={() => setCreating((v) => !v)}
          data-testid="admin-new-site-btn"
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {creating ? "Annuler" : "Ajouter un site"}
        </Button>
      </div>

      <div className="mb-6">
        <Link to="/admin/settings" data-testid="admin-link-settings">
          <Button variant="outline" className="bg-transparent border-gold-soft text-gold hover:bg-gold-soft">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres du site (IP, maintenance, textes)
          </Button>
        </Link>
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-500/10 p-3 rounded-sm mb-4 text-sm text-red-400 font-mono-stat" data-testid="admin-error">
          {error}
        </div>
      )}

      {creating && (
        <form
          onSubmit={submitNew}
          className="border border-emerald-500/30 bg-[#121418] p-5 rounded-sm mb-6 space-y-3"
          data-testid="admin-new-form"
        >
          <FormGrid draft={draft} setDraft={setDraft} prefix="new" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setCreating(false); setDraft(empty); }}>
              Annuler
            </Button>
            <Button type="submit" data-testid="admin-save-new" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm">
              Créer
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 border border-border bg-[#121418] animate-pulse rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-testid="admin-sites-list">
          {sites.map((s) => (
            <div
              key={s.name}
              data-testid={`admin-site-${s.name}`}
              className="border border-border bg-[#121418] p-5 rounded-sm"
            >
              {editName === s.name ? (
                <div className="space-y-3">
                  <FormGrid draft={editDraft} setDraft={setEditDraft} prefix={`edit-${s.name}`} disableName />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setEditName(null)} data-testid={`admin-cancel-${s.name}`}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button onClick={saveEdit} data-testid={`admin-save-${s.name}`} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm">
                      <Check className="w-4 h-4 mr-2" /> Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-[#0A0A0B] border border-border flex items-center justify-center rounded-sm">
                    <VoteIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-lg">{s.name}</h3>
                      <span className="font-pixel text-[9px] text-zinc-500">#{s.order}</span>
                      {!s.configured && (
                        <span className="font-pixel text-[9px] text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-sm">
                          NON CONFIGURÉ
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{s.url}</p>
                    <p className="text-xs text-emerald-400 mt-1 font-mono-stat">{s.reward}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(s)}
                    data-testid={`admin-edit-${s.name}`}
                    className="bg-transparent border-border"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeSite(s.name)}
                    data-testid={`admin-delete-${s.name}`}
                    className="bg-transparent border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormGrid({ draft, setDraft, prefix, disableName = false }) {
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <Label className="font-pixel text-[10px] text-zinc-400">NOM</Label>
        <Input
          data-testid={`${prefix}-name`}
          value={draft.name}
          onChange={set("name")}
          disabled={disableName}
          required
          className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
        />
      </div>
      <div>
        <Label className="font-pixel text-[10px] text-zinc-400">ORDRE</Label>
        <Input
          data-testid={`${prefix}-order`}
          type="number"
          value={draft.order}
          onChange={(e) => setDraft({ ...draft, order: parseInt(e.target.value || "0") })}
          className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
        />
      </div>
      <div className="md:col-span-2">
        <Label className="font-pixel text-[10px] text-zinc-400">URL</Label>
        <Input
          data-testid={`${prefix}-url`}
          value={draft.url}
          onChange={set("url")}
          placeholder="https://..."
          required
          className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
        />
      </div>
      <div className="md:col-span-2">
        <Label className="font-pixel text-[10px] text-zinc-400">RÉCOMPENSE</Label>
        <Input
          data-testid={`${prefix}-reward`}
          value={draft.reward}
          onChange={set("reward")}
          placeholder="100 coins + 1 diamant"
          required
          className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-400 md:col-span-2">
        <input
          type="checkbox"
          checked={draft.configured}
          onChange={(e) => setDraft({ ...draft, configured: e.target.checked })}
          data-testid={`${prefix}-configured`}
          className="accent-emerald-500"
        />
        Marquer comme configuré (URL valide)
      </label>
    </div>
  );
}
