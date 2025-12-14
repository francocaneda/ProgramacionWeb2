// frontend/src/context/AuthContext.jsx  

import React, { useState, createContext, useMemo, useEffect, useCallback, useContext } from "react";
import apiClient from "../services/apiClient"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const loadUser = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }
            
            const response = await apiClient.get('/api/perfil');
            const userDataBackend = response.data; // Datos completos del backend (snake_case)
            
            // Mapeo de snake_case (DB) a camelCase (FE) + uid
            const userMapeado = {
                uid: userDataBackend.id, // ✅ ID real de la DB
                userNameWeb: userDataBackend.user_nameweb, 
                email: userDataBackend.email,
                nombre: userDataBackend.nombre_completo,
                avatar: userDataBackend.avatar, 
                bio: userDataBackend.bio,
                rol: userDataBackend.rol,
                fechaNacimiento: userDataBackend.fecha_nacimiento,
                fechaRegistro: userDataBackend.fecha_registro,
                isAdmin: userDataBackend.rol === 'admin',
                apellido: '', // opcional
            };
            
            setIsAuthenticated(true);
            setUser(userMapeado); 
            
        } catch (error) {
            console.error("Error al cargar usuario o token inválido:", error);
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, clave) => {
        try {
            const response = await apiClient.post('/api/login', { email, clave });
            const token = response.data.jwt;

            localStorage.setItem('authToken', token);
            await loadUser(); 
            return true;
        } catch (error) {
            console.error("Fallo de inicio de sesión:", error);
            throw error;
        }
    }, [loadUser]);

    const logout = useCallback(async () => {
        setIsAuthenticated(false);
        setUser(null);
        
        try {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user"); 
        } catch (e) {
            console.error("Error clearing storage", e);
        }
    }, []);
    
    const getToken = () => localStorage.getItem('authToken');
    const isAdmin = user?.isAdmin || false;

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const contextValue = useMemo(() => ({
        isAuthenticated,
        user,
        isAdmin, 
        loading,
        login,
        logout,
        loadUser,
        getToken,
    }), [isAuthenticated, user, isAdmin, loading, login, logout, loadUser]); 

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
