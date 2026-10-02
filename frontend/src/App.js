import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Market from "@/pages/Market";
import Leaderboard from "@/pages/Leaderboard";
import Vote from "@/pages/Vote";
import Guide from "@/pages/Guide";
import CmsPage from "@/cms/CmsPage";
import VisualEditor from "@/cms/VisualEditor";
import { SettingsProvider } from "@/context/SettingsContext";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return <div className="App min-h-screen bg-[#0A0A0B] text-white">
    <BrowserRouter><SettingsProvider><MaintenanceBanner/><Navbar/><main><Routes>
      <Route path="/" element={<CmsPage slug="/" />} />
      <Route path="/marche" element={<Market />} />
      <Route path="/classement" element={<Leaderboard />} />
      <Route path="/vote" element={<Vote />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/admin/editor" element={<VisualEditor />} />
    </Routes></main><Footer/><Toaster/></SettingsProvider></BrowserRouter>
  </div>;
}
export default App;
