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
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App min-h-screen bg-[#0A0A0B] text-white">
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marche" element={<Market />} />
              <Route path="/classement" element={<Leaderboard />} />
              <Route path="/vote" element={<Vote />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
