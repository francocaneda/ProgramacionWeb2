// src/pages/PostList.jsx

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import apiClient from "../services/apiClient";
import "./post-list.css";

export default function PostList() {
  const { id } = useParams();              // ID de categoría
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const userId = Number(localStorage.getItem("userId"));
  const userRole = localStorage.getItem("userRole");

  // Obtener el nombre de la categoría
  useEffect(() => {
    const cargarCategoria = async () => {
      try {
        const resp = await apiClient.get("/api/categorias");
        const categoria = resp.data.categorias.find(
          (c) => c.id_categoria === Number(id)
        );
        setNombreCategoria(categoria?.nombre_categoria || "");
      } catch (err) {
        console.error("Error al obtener categorías:", err);
      }
    };

    cargarCategoria();
  }, [id]);

  // Cargar publicaciones
  useEffect(() => {
    const cargarPosts = async () => {
      try {
        setIsLoading(true);

        const resp = await apiClient.get(`/api/posts/categoria/${id}`);
        const lista = Array.isArray(resp.data) ? resp.data : [];

        // Agregar fields como en Angular
        const enriched = lista.map((post) => ({
          ...post,
          likes: 0,
          comentarios: 0,
          vistas: post.cantidad_vistas ?? 0
        }));

        setPosts(enriched);
      } catch (err) {
        console.error("Error al obtener posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    cargarPosts();
  }, [id]);

  // ELIMINAR POST
  const eliminarPost = async (id_post) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el post permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const body = { id_post };

          await apiClient.delete(`/api/posts/${id_post}`, body);

          Swal.fire("Eliminado", "El post ha sido eliminado.", "success");
          setPosts((prev) => prev.filter((p) => p.id_post !== id_post));
        } catch (err) {
          console.error("Error al eliminar post:", err);
          Swal.fire("Error", "No se pudo eliminar el post.", "error");
        }
      }
    });
  };

  return (
    <div className="category-posts-container">

      {/* Loader */}
      {isLoading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Breadcrumb */}
          <div className="category-header">
            <div className="category-breadcrumb">
              <Link to="/" className="breadcrumb-link">Foro</Link>
              <span className="breadcrumb-separator">›</span>

              <Link to="/main-layout/categorias" className="breadcrumb-link">
                Categorías
              </Link>

              <span className="breadcrumb-separator">›</span>
              <span>Publicaciones</span>
            </div>

            <div className="category-info">
              <div className="category-icon">📂</div>
              <div className="category-details">
                <h1>{nombreCategoria} - Publicaciones</h1>
                <p className="category-description">
                  Explorá las publicaciones recientes de esta categoría y sumate a la conversación.
                </p>
              </div>
            </div>
          </div>

          {/* Botón Crear Post */}
          <div className="posts-actions">
            <Link
              className="create-post-btn"
              to={`/main-layout/create-post`}
            >
              <span>➕</span> Crear Nueva Publicación
            </Link>
          </div>

          {/* LISTA DE POSTS */}
          {posts.length > 0 ? (
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post.id_post} className="post-card">

                  {/* ⚡ Aquí se corrigió la ruta */}
                  <Link to={`/main-layout/post-detail/${post.id_post}`} className="post-header">
                    <div className="post-main-info">
                      <h3 className="post-title">Título: {post.titulo}</h3>
                      <p className="post-preview">{post.contenido}</p>
                    </div>
                  </Link>

                  <div className="post-stats">
                    <div className="post-time">
                      <span>🕐</span>
                      <span>
                        Publicado el:{" "}
                        {new Date(post.fecha_creacion).toLocaleDateString("es-AR")}
                      </span>
                    </div>

                    {(userRole === "admin" || userId === post.id_usuario) && (
                      <button
                        onClick={() => eliminarPost(post.id_post)}
                        className="btn-delete"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">Aún no hay publicaciones en esta categoría.</p>
          )}
        </>
      )}
    </div>
  );
}
