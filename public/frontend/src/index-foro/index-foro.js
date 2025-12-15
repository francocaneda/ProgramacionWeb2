import React, { useEffect, useRef, useState } from "react";
import { Carousel } from "bootstrap";
import axios from "axios";
import "./index-foro.css";

export default function IndexForo({ estaLogueado = true }) {
  const carouselRef = useRef(null);

  // Estados dinámicos
  const [nombre, setNombre] = useState("Usuario");
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComentarios, setTotalComentarios] = useState(0);

  // Inicializar carrusel
  useEffect(() => {
    if (!carouselRef.current) return;
    const instance = Carousel.getOrCreateInstance(carouselRef.current, {
      interval: 5000,
      ride: false,
      pause: false,
      wrap: true,
      touch: true,
      keyboard: true,
    });
    return () => instance.dispose();
  }, []);

  // Traer datos dinámicos desde el backend
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    // 1️⃣ Nombre del usuario
    if (estaLogueado) {
      axios
        .get("http://localhost:8012/api/perfil", config)
        .then((res) => {
          if (res.data?.nombre_completo) setNombre(res.data.nombre_completo);
        })
        .catch(() => setNombre("Usuario"));
    }

    // 2️⃣ Total de usuarios
    axios
      .get("http://localhost:8012/api/usuarios/count")
      .then((res) => setTotalUsuarios(res.data.total || 0))
      .catch(() => setTotalUsuarios(0));

    // 3️⃣ Total de posts e interacciones
    axios
      .get("http://localhost:8012/api/posts")
      .then((res) => {
        const posts = res.data || [];
        setTotalPosts(posts.length);

        let totalComs = 0;
        posts.forEach((p) => {
          if (p.comentarios) totalComs += p.comentarios.length;
        });
        setTotalComentarios(totalComs);
      })
      .catch(() => {
        setTotalPosts(0);
        setTotalComentarios(0);
      });
  }, [estaLogueado]);

  return (
    <div className="foro-scope">
      <div className="container">
        {/* Carrusel */}
        <div
          id="foroCarousel"
          className="carousel slide"
          ref={carouselRef}
          data-bs-touch="true"
          data-bs-interval="5000"
        >
          {/* Indicadores */}
          <div className="carousel-indicators">
            <button
              type="button"
              data-bs-target="#foroCarousel"
              data-bs-slide-to="0"
              className="active"
              aria-current="true"
              aria-label="Slide 1"
            />
            <button
              type="button"
              data-bs-target="#foroCarousel"
              data-bs-slide-to="1"
              aria-label="Slide 2"
            />
            <button
              type="button"
              data-bs-target="#foroCarousel"
              data-bs-slide-to="2"
              aria-label="Slide 3"
            />
          </div>

          <div className="carousel-inner">
            {/* Slide 1 */}
            <div className="carousel-item active">
              <div className="slice-container slice1">
                <div className="slice1-icon">🎯</div>
                <div className="slice1-content">
                  <h1 className="slice1-title">
                    ¡Bienvenido/a {nombre} a ForoRandomUces!
                  </h1>
                  <p className="slice1-subtitle">
                    El espacio donde todas las ideas cobran vida. Únete a nuestra
                    comunidad vibrante y descubre un mundo de posibilidades infinitas.
                  </p>
                </div>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="carousel-item">
              <div className="slice-container slice2">
                <div className="slice2-content">
                  <div className="slice2-text">
                    <h2 className="slice2-title">Comparte tus Ideas</h2>
                    <p className="slice2-subtitle">
                      {nombre}, crea publicaciones únicas, inicia debates
                      fascinantes y conecta con mentes brillantes.
                    </p>
                  </div>
                  <div className="slice2-graphic">
                    <div className="about-stats">
                      <div className="stat-card">
                        <div className="stat-number">{totalUsuarios}</div>
                        <div className="stat-label">Miembros Activos</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-number">{totalPosts}</div>
                        <div className="stat-label">Publicaciones</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 3 */}
            <div className="carousel-item">
              <div className="slice-container slice3">
                <div className="slice3-icons">
                  <div className="slice3-icon">📚</div>
                  <div className="slice3-icon">🎓</div>
                  <div className="slice3-icon">🏛️</div>
                </div>
                <div className="slice3-content">
                  <div className="slice3-badge">Universidad UCES</div>
                  <h2 className="slice2-title">Comunidad Única</h2>
                  <p className="slice3-subtitle">
                    Conecta con la comunidad UCES y comparte temas de cualquier
                    índole. ¡Todos son bienvenidos!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles Prev / Next */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#foroCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#foroCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>

        {/* Sección Características */}
        <div className="section">
          <h2 className="section-title">¿Por qué elegir ForoRandomUces?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Innovación Constante</h3>
              <p className="feature-description">
                Siempre estamos implementando nuevas funcionalidades y mejoras
                basadas en las sugerencias de nuestra comunidad.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3 className="feature-title">Comunidad Respetuosa</h3>
              <p className="feature-description">
                Fomentamos un ambiente de respeto mutuo donde todas las
                opiniones son valoradas y escuchadas.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3 className="feature-title">Aprendizaje Continuo</h3>
              <p className="feature-description">
                Cada debate es una oportunidad para aprender algo nuevo y
                expandir tus horizontes intelectuales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
