// src/components/Login.js (Versión Corregida)
import { useMemo, useState, useEffect, useContext } from "react"; // ⬅️ Añadimos useContext
import { Link, useNavigate } from "react-router-dom";
// IMPORTAR EL CONTEXTO DE AUTENTICACIÓN
import { AuthContext } from '../context/AuthContext'; // ⬅️ Importamos el objeto Context
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  
  // ⬇️ CORRECCIÓN: USAR EL CONTEXTO DIRECTAMENTE ⬇️
  const { login, isAuthenticated } = useContext(AuthContext); 
  // ... (El resto del código es el mismo) ...

  // --- Estado Principal (Mantenido) ---
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [touched, setTouched] = useState({ email: false, clave: false });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(""); 
  
  // --- Efecto de Escritura (Mantenido) ---
  const [displayedText, setDisplayedText] = useState(["", "", ""]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const textLines = useMemo(() => ["Miles de ideas", "en un solo", "lugar"], []);

  // Si el usuario ya está autenticado, redirigir inmediatamente
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/foro", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Lógica de efectos de escritura y cursor (Mantenida)
  useEffect(() => {
    if (currentLine < textLines.length) {
        if (currentChar < textLines[currentLine].length) {
            const timer = setTimeout(() => {
                setDisplayedText((prev) => {
                    const next = [...prev];
                    next[currentLine] = textLines[currentLine].substring(0, currentChar + 1);
                    return next;
                });
                setCurrentChar((c) => c + 1);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                setCurrentLine((l) => l + 1);
                setCurrentChar(0);
            }, 800);
            return () => clearTimeout(timer);
        }
    }
  }, [currentChar, currentLine, textLines]);

  useEffect(() => {
    const cursorTimer = setInterval(() => setShowCursor((v) => !v), 500);
    return () => clearInterval(cursorTimer);
  }, []);

  // Validaciones (Mantenidas)
  const errors = useMemo(() => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "El email es obligatorio.";
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) errs.email = "Debe ser un email válido.";
    }
    if (!clave) {
      errs.clave = "La contraseña es obligatoria.";
    } else if (clave.length < 8) {
      errs.clave = "Mínimo 8 caracteres.";
    }
    return errs;
  }, [email, clave]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // --- Función handleSubmit con JWT ---
  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, clave: true });
    setServerError("");
    if (!isValid) return;

    try {
      setLoading(true);
      
      await login(email, clave); 
      
    } catch (err) {
      console.error("Error al loguear:", err);
      
      let message = "Credenciales incorrectas o el servidor está inactivo.";
      if (err.response && err.response.status === 401) {
          message = "Email o contraseña inválidos.";
      } else if (err.message && err.message.includes("Network Error")) {
          message = "Error de conexión. El servidor no está disponible.";
      }

      setServerError(message);
      
    } finally {
      setLoading(false);
    }
  }
  // ------------------------------------------

  // El JSX se mantiene igual
  return (
    <div className="login-container">
      {/* efectos de fondo */}
      <div className="background-effects">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      <div className="main-content">
        {/* texto animado */}
        <div className="hero-text-section">
          <h2 className="hero-text">
            <div className="typing-line gradient-text">
              {displayedText[0]}
              {currentLine === 0 && showCursor && <span className="cursor">|</span>}
            </div>
            <div className="typing-line gradient-text">
              {displayedText[1]}
              {currentLine === 1 && showCursor && <span className="cursor">|</span>}
            </div>
            <div className="typing-line gradient-text">
              {displayedText[2]}
              {currentLine === 2 && showCursor && <span className="cursor">|</span>}
            </div>
          </h2>
        </div>

        {/* card login */}
        <div className="login-card-wrapper">
          <div className="card-glow" />
          <div className="login-card">
            <div className="login-header">
              <div className="user-avatar">
                <svg className="user-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h1 className="login-title">Iniciar Sesion</h1>
              <p className="login-subtitle">Inicia sesión en tu cuenta</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-wrapper">
                  <div className="input-icon separadito">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className="form-input"
                    placeholder="Ingresar email"
                    autoComplete="email"
                  />
                </div>
                {touched.email && errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <div className="input-wrapper">
                  <div className="input-icon separadito">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, clave: true }))}
                    className="form-input"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                {touched.clave && errors.clave && <p className="error-message">{errors.clave}</p>}
              </div>

              {serverError && (
                <div className="server-error">
                  <p>{serverError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!isValid || loading}
                className={`submit-btn ${loading ? "loading" : ""} ${!isValid ? "disabled" : ""}`}
              >
                {loading ? (
                  <>
                    <svg className="spinner" fill="none" viewBox="0 0 24 24">
                      <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="spinner-path"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>

              <div className="login-footer">
                <Link to="/password-recup" className="forgot-link">
                  ¿Olvidaste tu contraseña?
                </Link>
                <div className="register-text">
                  ¿No tienes cuenta?{" "}
                  <Link to="/registrarte" className="register-link">
                    Regístrate aquí
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}