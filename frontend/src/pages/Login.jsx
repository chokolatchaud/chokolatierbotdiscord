import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

const ADMIN_PATH = process.env.REACT_APP_ADMIN_PATH || "admin_secret";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await login(username.trim(), password);
    setBusy(false);
    if (res.ok) navigate(`/${ADMIN_PATH}`);
    else setError(res.error);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 items-center justify-center rounded-sm mb-4 bg-amber-500/20 border border-amber-500/30">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <p className="font-pixel text-xs text-amber-400">ACCÈS ADMINISTRATION</p>
          <h1 className="font-display font-extrabold text-2xl mt-2">Panel Admin</h1>
        </div>

        <form onSubmit={submit} className="border border-border bg-[#121418] p-6 rounded-sm space-y-4">
          <div className="space-y-2">
            <Label className="font-pixel text-[10px] text-zinc-400">PSEUDO</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Chokolatchaud" className="bg-[#0A0A0B] border-border rounded-sm" required />
          </div>
          <div className="space-y-2">
            <Label className="font-pixel text-[10px] text-zinc-400">MOT DE PASSE</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="bg-[#0A0A0B] border-border rounded-sm" required />
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          <Button type="submit" disabled={busy}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-sm">
            {busy ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}
