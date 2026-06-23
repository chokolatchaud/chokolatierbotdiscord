import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function IPCopier({ ip = "mine.farm-and.fr", size = "lg" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.createElement("textarea");
      el.value = ip;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const big = size === "lg";

  return (
    <button
      onClick={handleCopy}
      data-testid="copy-ip-button"
      className={`group relative inline-flex items-center gap-3 border-2 ${
        copied ? "border-emerald-400" : "border-border"
      } bg-[#121418] hover:border-emerald-500 transition-all rounded-sm ${
        big ? "px-6 py-4" : "px-4 py-2"
      }`}
    >
      <span className={`font-pixel text-emerald-400 ${big ? "text-xs" : "text-[10px]"}`}>
        IP DU SERVEUR
      </span>
      <div className="w-px h-6 bg-border" />
      <span
        className={`font-mono-stat font-bold tracking-tight ${
          big ? "text-2xl md:text-3xl" : "text-base"
        }`}
        data-testid="server-ip-text"
      >
        {ip}
      </span>
      <span
        className={`flex items-center justify-center ${
          copied ? "bg-emerald-500 text-black" : "bg-white/5 text-emerald-400"
        } ${big ? "w-9 h-9" : "w-7 h-7"} rounded-sm transition-colors`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </span>
      {copied && (
        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-emerald-400 font-mono-stat">
          Copié !
        </span>
      )}
    </button>
  );
}
