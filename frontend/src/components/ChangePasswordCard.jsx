import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Check } from "lucide-react";

export default function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (next !== confirm) {
      setError("Les deux mots de passe ne correspondent pas");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/change-password", {
        current_password: current,
        new_password: next,
      });
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      data-testid="change-password-form"
      className="border border-border bg-[#121418] rounded-sm"
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-gold" />
        <p className="font-pixel text-xs text-gold">SÉCURITÉ · MOT DE PASSE</p>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <Label className="font-pixel text-[10px] text-zinc-400">MOT DE PASSE ACTUEL</Label>
          <Input
            data-testid="cp-current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="font-pixel text-[10px] text-zinc-400">NOUVEAU</Label>
            <Input
              data-testid="cp-new"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              minLength={6}
              className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
              required
            />
          </div>
          <div>
            <Label className="font-pixel text-[10px] text-zinc-400">CONFIRMATION</Label>
            <Input
              data-testid="cp-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              className="bg-[#0A0A0B] border-border rounded-sm font-mono-stat mt-1"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 font-mono-stat" data-testid="cp-error">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-400 font-mono-stat flex items-center gap-2" data-testid="cp-success">
            <Check className="w-4 h-4" /> Mot de passe mis à jour.
          </p>
        )}

        <Button
          type="submit"
          disabled={busy}
          data-testid="cp-submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm"
        >
          {busy ? "Mise à jour..." : "Changer le mot de passe"}
        </Button>
      </div>
    </form>
  );
}
