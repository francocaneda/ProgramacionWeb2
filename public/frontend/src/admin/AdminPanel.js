// src/admin/AdminPanel.js

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel() {
    const { isAuthenticated, isAdmin, user } = useAuth();
    const navigate = useNavigate();

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔐 Redirección si no es admin
    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    // 📥 Cargar usuarios
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

    // 🗑️ Eliminar usuario
    const eliminarUsuario = async (id_usuario) => {
        Swal.fire({
            title: '¿Eliminar usuario?',
            text: 'Esta acción no se puede deshacer',
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

    // 👑 Cambiar rol (admin <-> normaluser)
    const cambiarRol = async (u) => {
        const nuevoRol = u.rol === 'admin' ? 'normaluser' : 'admin';

        Swal.fire({
            title: `¿Cambiar rol a ${nuevoRol.toUpperCase()}?`,
            text:
                nuevoRol === 'admin'
                    ? 'El usuario tendrá acceso total al sistema'
                    : 'El usuario perderá permisos administrativos',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('authToken');

                    await apiClient.put(
                        `/api/usuarios/${u.id}/rol`,
                        { rol: nuevoRol },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    Swal.fire('Listo', 'Rol actualizado correctamente', 'success');
                    cargarUsuarios();
                } catch (err) {
                    console.error('Error al cambiar rol', err);
                    Swal.fire('Error', 'No se pudo cambiar el rol', 'error');
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="admin-loading-container">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Cargando datos de usuarios...</p>
            </div>
        );
    }

    return (
        <div className="admin-panel-container container mt-5 mb-5 p-4 rounded shadow-lg">
            <h1 className="admin-panel-title mb-4 border-bottom pb-2">
                <i className="bi bi-people-fill me-3"></i>
                Administración de Usuarios
            </h1>

            <div className="table-responsive">
                <table className="table table-striped table-hover table-sm align-middle admin-users-table">
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
                                    <i className="bi bi-info-circle me-2"></i>
                                    No hay usuarios registrados
                                </td>
                            </tr>
                        )}

                        {usuarios.map((u) => {
                            // Asumiendo que el admin principal tiene ID 1 (si lo quieres intocable)
                            const esAdminGeneral = u.id === 1; 
                            const esUsuarioActual = u.id === user?.id;

                            return (
                                <tr key={u.id}>
                                    <td className="text-truncate" style={{ maxWidth: '150px' }}>
                                        <i className="bi bi-person-circle me-2 text-primary"></i>
                                        <strong>{u.nombre_completo || u.user_nameweb}</strong>
                                    </td>

                                    <td className="text-truncate" style={{ maxWidth: '200px' }}>{u.email}</td>

                                    <td className="text-center">
                                        <span
                                            className={`badge ${
                                                u.rol === 'admin' ? 'bg-danger' : 'bg-success'
                                            }`}
                                        >
                                            {u.rol.toUpperCase()}
                                        </span>
                                    </td>

                                    <td className="text-center">
                                        {/* CONTENEDOR FLEX PARA CENTRAR LOS BOTONES JUNTOS */}
                                        <div className="d-inline-flex justify-content-center"> 
                                            {/* ❌ Admin general: sin acciones */}
                                            {!esAdminGeneral && (
                                                <>
                                                    {/* Eliminar */}
                                                    <button
                                                        className="btn btn-sm btn-outline-danger me-2"
                                                        onClick={() => eliminarUsuario(u.id)}
                                                        disabled={esUsuarioActual}
                                                        title={
                                                            esUsuarioActual
                                                                ? 'No puedes eliminar tu propia cuenta'
                                                                : 'Eliminar usuario'
                                                        }
                                                    >
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>

                                                    {/* Cambiar rol */}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => cambiarRol(u)}
                                                        disabled={esUsuarioActual}
                                                        title={
                                                            esUsuarioActual
                                                                ? 'No puedes cambiar tu propio rol'
                                                                : 'Cambiar rol'
                                                        }
                                                    >
                                                        <i className="bi bi-shield-lock-fill"></i>
                                                    </button>
                                                </>
                                            )}

                                            {esAdminGeneral && (
                                                <span className="text-muted fst-italic">
                                                    Administrador General
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPanel;