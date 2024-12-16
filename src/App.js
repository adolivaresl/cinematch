import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/views/Login.jsx";
import NotFound from "./components/views/NotFound.jsx";
import Register from "./components/views/Register.jsx";
import Catalog from "./components/views/Catalog.jsx";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/notfound" element={<NotFound />} />
        <Route exact path="/catalog" element={<Catalog/>}/>
        <Route exact path="/register" element={<Register/>}/>
        <Route exact path="/login" element={<Login/>}/>
        <Route path="/" element={<Login />} />      
      </Routes>
    </Router>
  );
}

export default App;