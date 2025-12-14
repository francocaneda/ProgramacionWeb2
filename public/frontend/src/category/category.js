// src/category/category.js 

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './category.css';

import { useAuth } from '../context/AuthContext'; 
import { useCategoryService } from '../services/categoryService'; 
import apiClient from '../services/apiClient'; // Para contar posts

function ForumCategories() {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth(); 
    const { getCategorias, crearCategoria, eliminarCategoria } = useCategoryService();

    const [categorias, setCategorias] = useState([]);
       const [isLoading, setIsLoading] = useState(true);
    const [nuevoNombreCategoria, setNuevoNombreCategoria] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [mostrarMensaje, setMostrarMensaje] = useState(false);

    // Cargar categorías con cantidad de posts y comentarios
    const cargarCategorias = useCallback(async () => {
        setIsLoading(true);
        try {
            const resp = await getCategorias(); 
            const cats = resp.categorias || [];

            const categoriasConDatos = await Promise.all(
                cats.map(async (cat) => {
                    // -----------------------------
                    // 1) Contar POSTS por categoría
                    // -----------------------------
                    let cantidadPosts = 0;
                    let postsArray = [];

                    try {
                        const postsResp = await apiClient.get(`/api/posts/categoria/${cat.id_categoria}`);
                        postsArray = Array.isArray(postsResp.data) ? postsResp.data : [];
                        cantidadPosts = postsArray.length;
                    } catch (err) {
                        if (err.response && err.response.status === 404) {
                            cantidadPosts = 0;
                        } else {
                            console.error("Error contando posts:", err);
                        }
                    }

                    // -----------------------------------------------
                    // 2) Contar COMENTARIOS totales de todos los posts
                    // -----------------------------------------------
                    let cantidadComentarios = 0;

                    try {
                        const comentariosPromises = postsArray.map(async (post) => {
                            try {
                                const comResp = await apiClient.get(`/api/comentarios/post/${post.id_post}`);
                                if (Array.isArray(comResp.data)) {
                                    return comResp.data.length;
                                }
                                return 0;
                            } catch {
                                return 0;
                            }
                        });

                        const comentariosPorPost = await Promise.all(comentariosPromises);
                        cantidadComentarios = comentariosPorPost.reduce((a, b) => a + b, 0);

                    } catch (err) {
                        console.error("Error contando comentarios:", err);
                        cantidadComentarios = 0;
                    }

                    return { 
                        ...cat, 
                        cantidadPosts,
                        cantidadComentarios 
                    };
                })
            );

            setCategorias(categoriasConDatos);

        } catch (err) {
            console.error('Error al cargar categorías', err);
        } finally {
            setIsLoading(false);
        }
    }, [getCategorias]);

    useEffect(() => {
        if (isAuthenticated) {
            cargarCategorias(); 
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, cargarCategorias]);

    // Crear categoría
    const crearCategoriaHandler = async () => {
        if (!nuevoNombreCategoria.trim()) return;

        const nombreACrear = nuevoNombreCategoria.trim();
        setNuevoNombreCategoria('');

        try {
            await crearCategoria({ nombre_categoria: nombreACrear }); 
            await cargarCategorias(); 

            setMensajeExito('¡Categoría creada exitosamente!');
            setMostrarMensaje(true);
            setTimeout(() => setMostrarMensaje(false), 3000);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo crear la categoría. Intenta nuevamente.', 'error');
        }
    };

    // Navegar a post-list
    const cargarPosts = (categoria) => {
        navigate(`/main-layout/post-list/${categoria.id_categoria}`);
    };

    // Eliminar categoría
    const eliminarCategoriaHandler = async (id_categoria) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await eliminarCategoria(id_categoria); 
                    await cargarCategorias(); 
                    Swal.fire('Eliminada', 'La categoría fue eliminada exitosamente.', 'success');
                } catch (err) {
                    console.error('Error al eliminar categoría', err);
                    Swal.fire('Error', 'No se pudo eliminar la categoría. Intenta nuevamente.', 'error');
                }
            }
        });
    };

    return (
        <div className="categories-container">
            <div className="categories-header">
                <h1 className="categories-title">Categorías del Foro</h1>
                <p className="categories-subtitle">
                    Explora las diferentes secciones de nuestro foro y únete a las conversaciones que más te interesen.
                </p>
            </div>

            {isLoading && (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            )}

            {!isLoading && !isAuthenticated && (
                <div className="not-authenticated-message">
                    <p>Debes iniciar sesión para ver las categorías del foro.</p>
                </div>
            )}
            
            {!isLoading && isAuthenticated && categorias.length === 0 && (
                <div className="no-data-message text-center p-5">
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                    <h4 className="mt-3">No hay categorías disponibles.</h4>
                    {isAdmin && <p>Usa el formulario de abajo para crear la primera categoría.</p>}
                </div>
            )}

            {!isLoading && isAuthenticated && categorias.length > 0 && (
                <div className="categories-grid">
                    {categorias.map((categoria) => (
                        <div 
                            key={categoria.id_categoria} 
                            className="category-card" 
                            onClick={() => cargarPosts(categoria)} 
                        >
                            <div className="category-header d-flex align-items-center gap-2">
                                <div className="category-icon">📂</div>
                                <h3 className="category-title">{categoria.nombre_categoria}</h3>
                            </div>

                            <p className="category-description">
                                Participa en la categoría {categoria.nombre_categoria} y comparte tus ideas con la comunidad.
                            </p>

                            <div className="category-stats d-flex gap-3">
                                <div className="category-stat d-flex align-items-center gap-1">
                                    <span className="category-stat-icon">📝</span>
                                    <span>Posts: {categoria.cantidadPosts || 0}</span> 
                                </div>

                                <div className="category-last-post d-flex align-items-center gap-1">
                                    <span className="category-last-post-icon">💬</span>
                                    <span>Comentarios: {categoria.cantidadComentarios || 0}</span> 
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="boton-eliminar-container">
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            eliminarCategoriaHandler(categoria.id_categoria); 
                                        }}
                                        className="btn btn-danger btn-sm btn-eliminar-cat"
                                        title="Eliminar categoría"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isAdmin && (
                <div className="crear-categoria-container my-3 p-3 border rounded bg-light d-flex gap-2 align-items-center seccionCrearCategoria">
                    <input 
                        type="text" 
                        value={nuevoNombreCategoria} 
                        onChange={(e) => setNuevoNombreCategoria(e.target.value)} 
                        placeholder="Nuevo nombre de categoría" 
                        className="form-control"
                        style={{ maxWidth: '300px' }}
                    />
                    <button 
                        className="btn btn-primary"
                        onClick={crearCategoriaHandler} 
                        disabled={!nuevoNombreCategoria.trim()} 
                    >
                        Crear Categoría
                    </button>
                </div>
            )}

            {mostrarMensaje && (
                <div className="alert alert-success text-center mensaje-flotante">
                    {mensajeExito}
                </div>
            )}
        </div>
    );
}

export default ForumCategories;
