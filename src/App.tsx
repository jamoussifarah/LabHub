import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import TechnicianDashboard from "./pages/Dashboard/TechnicianDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <Router>
      {/* ⚠️ AuthProvider DOIT être à l'intérieur de <Router>
           pour que useNavigate() fonctionne dans SignInForm */}
      <AuthProvider>
        <ScrollToTop />
        <Routes>

          {/* ── Dashboard Admin (protégé, role=admin) ──────────────── */}
          <Route
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/"            element={<Home />} />
            <Route path="/profile"           element={<UserProfiles />} />
            <Route path="/calendar"          element={<Calendar />} />
            <Route path="/blank"             element={<Blank />} />
            <Route path="/form-elements"     element={<FormElements />} />
            <Route path="/basic-tables"      element={<BasicTables />} />
            <Route path="/alerts"            element={<Alerts />} />
            <Route path="/avatars"           element={<Avatars />} />
            <Route path="/badge"             element={<Badges />} />
            <Route path="/buttons"           element={<Buttons />} />
            <Route path="/images"            element={<Images />} />
            <Route path="/videos"            element={<Videos />} />
            <Route path="/line-chart"        element={<LineChart />} />
            <Route path="/bar-chart"         element={<BarChart />} />
          </Route>

          {/* ── Dashboard Technicien (protégé, role=technicien) ────── */}
          <Route
            path="/technicien/dashboard"
            element={
              <ProtectedRoute allowedRole="technicien">
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Auth (publique) ─────────────────────────────────────── */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* ── Fallback ────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}