import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Destinations from "./pages/Destinations";
import Itineraries from "./pages/Itineraries";
import SearchInput from "./pages/SearchInput";

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>Wexa Smart Travel</h1>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<SearchInput />} />
            <Route path="/destinations" element={<Destinations />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
