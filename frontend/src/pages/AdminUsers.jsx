import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ShieldCheck, User } from "lucide-react";

const ROLES = [
  { value: "player", label: "Joueur" },
  { value: "moderator", label: "Modérateur" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ username: "", password: "", role: "moderator" });
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { setUsers((await api.get("/admin/users")).data); }
    catch (e) { setError(formatApiError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createUser = async (e) => {
    e.preventDefault(); setError("");
    try {
      await api.post("/admin/users", draft);
      setDraft({ username: "", password: "", role: "moderator" });
      setCreating(false);
      load();
    } catch (e) { setError(formatApiError(e)); }
  };

  const changeRole = async (id, role) => {
    setError("");
    try { await api.put(`/admin/users/${id}/role`, { role }); load(); }
    catch (e) { setError(formatApiError(e)); }
  };

  const remove = async (u) => {
    if (!confirm(`Supprimer le compte "${u.username}" ? Action irréversible.`)) return;
    try { await api.delete(`/admin/users/${u.id}`); load(); }
    catch (e) { setError(formatApiError(e)); }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-pixel text-xs text-gold">ADMIN · UTILISATEURS</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl mt-2">Comptes & rôles.</h1>
          <p className="text-zinc-400 mt-2 max-w-2xl">
            Crée des comptes pour ta team. <span className="text-emerald-400">Modérateur</span> = accès aux sites de vote. <span className="text-gold">Admin</span> = accès complet.
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)} data-testid="users-new-btn"
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm">
          <Plus className="w-4 h-4 mr-2" />{creating ? "Annuler" : "Créer un compte"}
        </Button>
      </div>

      {error && <div className="border border-red-500/40 bg-red-500/10 p-3 rounded-sm mb-4 text-sm text-red-400 font-mono-stat" data-testid="users-error">{error}</div>}

      {creating && (
        <form onSubmit={createUser} className="border border-emerald-500/30 bg-[#121418] p-5 rounded-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-3" data-testid="users-create-form">
          <div>
            <Label className="font-pixel text-[10px] text-zinc-400">PSEUDO</Label>
            <Input data-testid="users-new-username" value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })}
              minLength={3} maxLength={16} required className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1" />
          </div>
          <div>
            <Label className="font-pixel text-[10px] text-zinc-400">MOT DE PASSE</Label>
            <Input data-testid="users-new-password" type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              minLength={6} required className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1" />
          </div>
          <div>
            <Label className="font-pixel text-[10px] text-zinc-400">RÔLE</Label>
            <select data-testid="users-new-role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-border rounded-sm font-mono-stat mt-1 px-3 h-10 text-sm">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" data-testid="users-create-submit" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm">Créer</Button>
          </div>
        </form>
      )}

      <div className="border border-border rounded-sm overflow-hidden bg-[#121418]" data-testid="users-table">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-border bg-[#0F1115] text-[10px] font-pixel text-zinc-500">
          <div className="col-span-5">PSEUDO</div>
          <div className="col-span-4">RÔLE</div>
          <div className="col-span-3 text-right">ACTIONS</div>
        </div>
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-14 border-b border-border bg-[#15181F]/30 animate-pulse" />)
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-zinc-500 font-mono-stat text-sm">Aucun compte.</p>
        ) : users.map((u) => {
          const isSelf = u.id === me.id;
          const RoleIcon = u.role === "admin" ? ShieldCheck : User;
          const roleColor = u.role === "admin" ? "text-gold" : u.role === "moderator" ? "text-emerald-400" : "text-zinc-400";
          return (
            <div key={u.id} data-testid={`user-row-${u.username}`} className="grid grid-cols-12 items-center px-5 py-3 border-b border-border last:border-0 hover:bg-white/[0.02]">
              <div className="col-span-5 flex items-center gap-2">
                <RoleIcon className={`w-4 h-4 ${roleColor}`} />
                <span className="font-medium">{u.username}</span>
                {isSelf && <span className="font-pixel text-[9px] text-zinc-500">(toi)</span>}
              </div>
              <div className="col-span-4">
                <select value={u.role} disabled={isSelf} onChange={(e) => changeRole(u.id, e.target.value)}
                  data-testid={`user-role-${u.username}`}
                  className="bg-[#0A0A0B] border border-border rounded-sm font-mono-stat px-2 h-8 text-xs disabled:opacity-50">
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="col-span-3 text-right">
                <Button size="sm" variant="outline" disabled={isSelf}
                  onClick={() => remove(u)}
                  data-testid={`user-delete-${u.username}`}
                  className="bg-transparent border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-40">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
