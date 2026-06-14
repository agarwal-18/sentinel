import { BrowserRouter, Routes, Route  } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StatusPage from "./pages/StatusPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/status/:username" element={<StatusPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;