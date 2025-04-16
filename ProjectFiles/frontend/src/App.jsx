import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Callback from "./components/Callback";
import Dashboard from "./pages/Dashboard/Dashboard";
import Resources from "./pages/Resources/Resources";
import Admin from "./pages/Admin/Admin";
import Login from "./pages/Login/Login";
import Docs from "./pages/Docs/Docs";
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/docs" element={<Docs />} />
            </Routes>
        </Router>
    );
}

export default App;
