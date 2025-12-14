// src/admin/AdminPanel.js

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel() {
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔐 Redirección si no es admin (Lógica sin cambios)
    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    // 📥 Cargar usuarios (Lógica sin cambios)
    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const resp = await apiClient.get('/api/usuarios', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUsuarios(resp.data || []);
        } catch (err) {
            console.error('Error al obtener usuarios', err);
            Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            cargarUsuarios();
        }
    }, [isAuthenticated, isAdmin]);

    // 🗑️ Eliminar usuario (Lógica sin cambios)
    const eliminarUsuario = async (id_usuario) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'No podrás revertir esta acción',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('authToken');

                    await apiClient.delete(`/api/usuarios/${id_usuario}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
                    cargarUsuarios();
                } catch (err) {
                    console.error('Error al eliminar usuario', err);
                    Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="admin-loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 text-muted">Cargando datos de usuarios...</p>
            </div>
        );
    }

    return (
        <div className="admin-panel-container container mt-5 mb-5 p-4 rounded shadow-lg">
            <h1 className="admin-panel-title mb-4 border-bottom pb-2">
                <i className="bi bi-people-fill me-3"></i>Administración de Usuarios
            </h1>
            
            <div className="table-responsive">
                <table className="table table-striped table-hover table-sm align-middle admin-users-table">
                    
                    {/* CORRECCIÓN: Quitamos el espacio en blanco entre <thead> y <tr> */}
                    <thead className="table-dark">
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th className="text-center">Rol</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {usuarios.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center text-muted p-4">
                                    <i className="bi bi-info-circle me-2"></i>No hay usuarios registrados
                                </td>
                            </tr>
                        )}

                        {usuarios.map((user) => (
                            <tr key={user.id}>
                                <td className="text-truncate" style={{ maxWidth: '150px' }}>
                                    <i className="bi bi-person-circle me-2 text-primary"></i>
                                    <strong>{user.nombre_completo || user.user_nameweb}</strong>
                                </td>
                                <td className="text-truncate" style={{ maxWidth: '200px' }}>{user.email}</td>
                                <td className="text-center">
                                    {/* Insignia dinámica según el rol */}
                                    <span className={`badge ${user.rol === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                                        {user.rol.toUpperCase()}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-sm btn-outline-danger admin-delete-btn"
                                        onClick={() => eliminarUsuario(user.id)}
                                        title="Eliminar Usuario"
                                    >
                                        <i className="bi bi-trash-fill me-1"></i> Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPanel;