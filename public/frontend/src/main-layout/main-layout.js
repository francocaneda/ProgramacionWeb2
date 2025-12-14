// frontend/src/main-layout/main-layout.js (Código Completo)

import { useContext } from 'react';
import { Outlet, Navigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext'; // ⬅️ Importamos el contexto
import Navbar from "../navbar/navbar"; // ⬅️ Asumo esta ruta de importación
import Footer from "../footer/footer"; 

export default function MainLayout() {
    // 1. Obtener el estado global, el usuario, la carga y la función de logout
    const { isAuthenticated, user, logout, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="loading-screen">
                Cargando sesión...
            </div>
        ); 
    }

    // 2. Proteger las rutas anidadas
    if (!isAuthenticated) return <Navigate to="/" replace />;
    
    // 3. Preparar las propiedades (props) para el Navbar
    const navProps = {
        isAuthenticated: isAuthenticated,
        
        // Asumiendo que el objeto 'user' tiene estos campos
        avatarUrl: user?.avatar || "/Access.ico", 
        userName: user?.nombre || "Usuario",
        role: user?.rol === 'admin' ? "Administrador" : "Miembro",
        isAdmin: user?.rol === 'admin',

        onLogout: logout, // ⬅️ Pasamos la función logout del contexto

        // Datos del foro (pendientes de implementar con useFetch)
        posts: [], 
        notifications: [], 
        unreadCount: 0,
        onMarkNotificationRead: () => {}, 
    };
    
    return (
        <>
            <Navbar {...navProps} /> 
            <main className="app-content">
                <Outlet /> 
            </main>
            <Footer />
        </>
    );
}