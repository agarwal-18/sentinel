import { BrowserRouter, Routes, Route  } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MonitorDetails from "./pages/MonitorDetails"
import StatusPage from "./pages/StatusPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";


function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />

        <Route path="/dashboard" element={ 
          <ProtectedRoute> 
            <Dashboard />
          </ProtectedRoute>}
        />

        <Route path="monitor/:id" element={
          <ProtectedRoute>
            <MonitorDetails />
          </ProtectedRoute>}
        />

        <Route path="/status/:username" element={<StatusPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;