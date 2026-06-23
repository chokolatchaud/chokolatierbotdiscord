import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pickaxe } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setBusy(true);
    const res = await register(username.trim(), password);
    setBusy(false);
    if (res.ok) navigate("/");
    else setError(res.error);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-emerald-500 items-center justify-center rounded-sm mb-4">
            <Pickaxe className="w-6 h-6 text-black" strokeWidth={3} />
          </div>
          <p className="font-pixel text-xs text-emerald-400">CRÉATION DE COMPTE</p>
          <h1 className="font-display font-extrabold text-3xl mt-2">Rejoins le serveur.</h1>
        </div>

        <form
          onSubmit={submit}
          className="border border-border bg-[#121418] p-6 rounded-sm space-y-4"
          data-testid="register-form"
        >
          <div className="space-y-2">
            <Label className="font-pixel text-[10px] text-zinc-400">PSEUDO MINECRAFT</Label>
            <Input
              data-testid="register-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Steve_Builder"
              minLength={3}
              maxLength={16}
              className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat"
              required
            />
            <p className="text-xs text-zinc-500">3 à 16 caractères</p>
          </div>
          <div className="space-y-2">
            <Label className="font-pixel text-[10px] text-zinc-400">MOT DE PASSE</Label>
            <Input
              data-testid="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="font-pixel text-[10px] text-zinc-400">CONFIRMATION</Label>
            <Input
              data-testid="register-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 font-mono-stat" data-testid="register-error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={busy}
            data-testid="register-submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm"
          >
            {busy ? "Création..." : "Créer mon compte"}
          </Button>

          <p className="text-center text-sm text-zinc-400 pt-2">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-emerald-400 hover:underline" data-testid="link-login">
              Connexion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
