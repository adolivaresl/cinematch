import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth"; // Asegúrate de configurar Firebase correctamente

const ProtectedRoute = ({ children }) => {
  const auth = getAuth();
  const user = auth.currentUser; // Verifica si hay un usuario autenticado

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;