// frontend/src/navbar/navbar.js

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./navbar.css";

export default function Navbar({
  isAuthenticated = true,
  posts = [],
  notifications = [],
  unreadCount = 0,
  onMarkNotificationRead = () => {},
  onLogout,
  avatarUrl = "/Access.ico",
  userName = "Usuario",
  role = "Miembro",
  isAdmin = false,
  addNewPost = null,
}) {
  const navigate = useNavigate();

  // ================== BÚSQUEDA ==================
  const [term, setTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const blurTimer = useRef(null);

  const [localPosts, setLocalPosts] = useState(posts || []);

  // Permitir que el padre inyecte nuevos posts sin recargar
  const handleAddNewPost = (post) => {
    setLocalPosts((prev) => [post, ...prev]);
  };

  useEffect(() => {
    if (typeof addNewPost === "function") {
      addNewPost(handleAddNewPost);
    }
  }, [addNewPost]);

  // ⛔ BUG FIX IMPORTANTE:
  // Siempre actualizar localPosts cuando cambien los posts del padre
  useEffect(() => {
    if (Array.isArray(posts)) {
      setLocalPosts(posts);
    }
  }, [posts]);

  // Cargar posts la primera vez
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (isAuthenticated && (!localPosts || localPosts.length === 0)) {
          const resp = await axios.get("http://localhost:8012/api/posts");
          if (!cancelled && Array.isArray(resp.data)) {
            setLocalPosts(resp.data);
          }
        }
      } catch (err) {
        console.error("Error cargando posts desde navbar:", err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const normalizedPosts = useMemo(() => {
    return (localPosts || []).map((p) => ({
      ...p,
      _searchTitle: (p.titulo || p.title || "").toString(),
      _id: p.id_post ?? p.id ?? p.ID,
    }));
  }, [localPosts]);

  const filteredPosts = useMemo(() => {
    if (!isAuthenticated || !term.trim()) return [];
    const t = term.toLowerCase();

    return normalizedPosts
      .filter((p) => (p._searchTitle || "").toLowerCase().includes(t))
      .slice(0, 10);
  }, [normalizedPosts, term, isAuthenticated]);

  const goToPost = (id) => {
    if (!id) return;
    navigate(`/main-layout/post-detail/${id}`);
    setTerm("");
    setShowSearch(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredPosts.length > 0) {
      goToPost(filteredPosts[0]._id);
    }
  };

  const handleSearchBlur = () => {
    blurTimer.current = setTimeout(() => setShowSearch(false), 150);
  };

  const handleSearchFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setShowSearch(true);
  };

  // ================== NOTIFICACIONES ==================
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const toggleNotifs = (e) => {
    e.stopPropagation();
    setShowNotifs((v) => !v);
    setShowUserMenu(false);
  };

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleClickNotif = (n) => {
    onMarkNotificationRead?.(n);
  };

  // ================== USER MENU ==================
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const toggleUserMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifs(false);
    setShowUserMenu((v) => !v);
  };

  useEffect(() => {
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    setShowUserMenu(false);
    try {
      await onLogout?.();
    } catch {}
    finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/", { replace: true });
    }
  };

  return (
    // CAMBIO CLAVE: Se eliminó el div #main-wrapper contenedor innecesario
    <div className="modern-navbar">
      <div className="navbar-container">

        {/* Logo */}
        <div className="logo-section">
          <Link to="/foro" className="navbar-brand-link">
            <img src="/foro.png" alt="ForoRandomUces" className="logo" />
            <span className="brand-text">ForoRandomUces</span>
          </Link>
        </div>

        {/* Search */}
        <div className="search-container d-none d-md-flex">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Busca una publicación..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onKeyDown={handleKeyDown}
            />
            <i className="bi bi-search search-icon" />
          </div>

          <div className={`search-dropdown ${showSearch ? "show" : ""}`}>
            {filteredPosts.map((p) => (
              <div
                key={p._id}
                className="search-item"
                onMouseDown={() => goToPost(p._id)}
              >
                {p._searchTitle || "(sin título)"}
              </div>
            ))}

            {term.length > 0 && filteredPosts.length === 0 && (
              <div className="search-item search-item-disabled">
                No se encontraron publicaciones
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="nav-actions d-none d-md-flex">
          <Link to="/main-layout/categorias" className="nav-btn btn-primary">
            <i className="bi bi-list-task" />
            <span>Categorías</span>
          </Link>

          <Link to="/main-layout/create-post" className="nav-btn btn-outline">
            <i className="bi bi-plus-lg" />
            <span>Crear Publicación</span>
          </Link>
        </div>

        {/* Usuario */}
        <div className="user-section">

          {/* Notificaciones */}
          <div className="notification-container" ref={notifRef}>
            <button className="notification-btn" onClick={toggleNotifs}>
              <i className="bi bi-bell-fill" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            <div className={`notification-dropdown ${showNotifs ? "show" : ""}`}>
              <h6 className="notification-header">Notificaciones</h6>

              {notifications.length === 0 ? (
                <div className="no-notifications">Sin notificaciones</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${
                      n.leido === 0 ? "notification-new" : ""
                    }`}
                    onClick={() => handleClickNotif(n)}
                  >
                    <div className="notification-message">
                      {n.usuario_origen}:{" "}
                      <span
                        dangerouslySetInnerHTML={{ __html: n.mensaje }}
                      />
                    </div>
                    <div className="notification-date">{n.fecha_envio}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Menú usuario */}
          <div className="user-dropdown" ref={userMenuRef}>
            <button className="user-trigger" onClick={toggleUserMenu}>
              <i className="bi bi-person-circle user-avatar-icon" />
              <div className="user-info d-none d-md-block">
                <div className="user-name">{userName}</div>
                <div className="user-role">{role}</div>
              </div>
              <i className="bi bi-chevron-down" />
            </button>

            <ul
              className={`dropdown-menu dropdown-menu-end modern-dropdown ${
                showUserMenu ? "show" : ""
              }`}
            >
              <li>
                <Link
                  to="/main-layout/profile"
                  className="dropdown-item modern-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="bi bi-person-lines-fill" /> Perfil
                </Link>
              </li>

              {isAdmin && (
                <li>
                  <Link
                    to="/main-layout/admin"
                    className="dropdown-item modern-dropdown-item text-danger botonAdmin"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <i className="bi bi-people-fill" /> Panel de usuarios
                  </Link>
                </li>
              )}

              <li>
                <button
                  className="dropdown-item modern-dropdown-item"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-left" /> Cerrar sesión
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}