import { useSettings } from "@/context/SettingsContext";
import { AlertTriangle } from "lucide-react";

export default function MaintenanceBanner() {
  const ctx = useSettings();
  const settings = ctx?.settings;
  if (!settings?.maintenance) return null;
  return (
    <div
      data-testid="maintenance-banner"
      className="bg-amber-500 text-black border-b border-amber-600"
    >
      <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={3} />
        <p className="font-pixel text-[10px] tracking-wider">MAINTENANCE</p>
        <span className="text-sm font-medium truncate">{settings.maintenance_message}</span>
      </div>
    </div>
  );
}
