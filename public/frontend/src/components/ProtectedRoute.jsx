// frontend/src/components/ProtectedRoute.jsx (Código Completo y Corregido)

import React, { useContext } from 'react'; // ⬅️ IMPORTAR useContext
import { AuthContext } from '../context/AuthContext'; // ⬅️ Importar el objeto Context
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente de Ruta Protegida.
 */
export default function ProtectedRoute() {
    // ⬇️ CORRECCIÓN: Usar useContext en lugar de useAuth() ⬇️
    const { isAuthenticated, loading } = useContext(AuthContext); 

    if (loading) {
        return <div className="loading-screen">Verificando acceso...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};