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
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import AdminVotes from "@/pages/AdminVotes";
import AdminSettings from "@/pages/AdminSettings";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SettingsProvider } from "@/context/SettingsContext";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Toaster } from "@/components/ui/sonner";

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
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/votes"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminVotes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />
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
