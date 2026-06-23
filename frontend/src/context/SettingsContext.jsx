import { useEffect, useState, createContext, useContext } from "react";
import { api } from "@/lib/api";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  const load = () => api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, reload: load }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
