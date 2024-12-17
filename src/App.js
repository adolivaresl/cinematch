import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/views/Login.jsx";
import NotFound from "./components/views/NotFound.jsx";
import Register from "./components/views/Register.jsx";
import Catalog from "./components/views/Catalog.jsx";
import ProtectedRoute from './components/views/ProtectedRoute.jsx';



function App() {
  return (
    <Router>
      <Routes>
        {/* ruta públicas */}   
        <Route  path="/register" element={<Register/>}/>
        <Route  path="/login" element={<Login/>}/> 
        {/* Ruta protegida */}
        <Route  path="/catalog" element={
          <ProtectedRoute>
            <Catalog />
          </ProtectedRoute>
        }/>   
         {/* Ruta por defecto */}
         <Route path="/" element={<Navigate to="/login" />} />
         {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/notfound" />} />
      </Routes>
    </Router>
  );
}

export default App;