import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Market from "@/pages/Market";
import Leaderboard from "@/pages/Leaderboard";
import Vote from "@/pages/Vote";
import Login from "@/pages/Login";
import Guide from "@/pages/Guide";
import AdminVotes from "@/pages/AdminVotes";
import AdminSettings from "@/pages/AdminSettings";
import AdminHome from "@/pages/AdminHome";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SettingsProvider } from "@/context/SettingsContext";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Toaster } from "@/components/ui/sonner";

// URL admin chargée depuis les variables d'environnement — jamais dans le code source
const ADMIN_PATH = process.env.REACT_APP_ADMIN_PATH || "admin_secret";

function App() {
  return (
    <div className="App min-h-screen bg-[#0A0A0B] text-white">
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <MaintenanceBanner />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marche" element={<Market />} />
                <Route path="/classement" element={<Leaderboard />} />
                <Route path="/vote" element={<Vote />} />
                <Route path="/guide" element={<Guide />} />
                {/* Login accessible uniquement pour l'admin */}
                <Route path={`/${ADMIN_PATH}/login`} element={<Login />} />
                {/* Panel admin — URL secrète */}
                <Route path={`/${ADMIN_PATH}`} element={
                  <ProtectedRoute adminOnly>
                    <AdminHome />
                  </ProtectedRoute>
                } />
                <Route path={`/${ADMIN_PATH}/votes`} element={
                  <ProtectedRoute adminOnly>
                    <AdminVotes />
                  </ProtectedRoute>
                } />
                <Route path={`/${ADMIN_PATH}/settings`} element={
                  <ProtectedRoute adminOnly>
                    <AdminSettings />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
