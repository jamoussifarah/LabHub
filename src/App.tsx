import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useEffect } from "react";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

import UserProfiles from "./pages/UserProfiles";
import Machines from "./pages/Machines";
import Laboratoires from "./pages/Laboratoires";
import Calendar from "./pages/Calendar";
import FormElements from "./pages/Forms/FormElements";
import BasicTables from "./pages/Tables/BasicTables";

import AppLayout from "./layout/AppLayout";
import TechnicianDashboard from "./features/technician/TechnicianDashboard";
import Home from "./pages/Dashboard/Home";

import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ScrollToTop } from "./components/common/ScrollToTop";

export default function App() {

  useEffect(() => {
    localStorage.removeItem("reclamation_user");
    localStorage.removeItem("reclamation_token");
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />

        <Routes>

          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Home />} />
            <Route path="/laboratoires" element={<Laboratoires />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
          </Route>

          <Route
            path="/technicien/dashboard"
            element={
              <ProtectedRoute allowedRole="TECHNICIEN">
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}