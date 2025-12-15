// profile.js (CÓDIGO JSX/HTML CORREGIDO MANTENIENDO TU ESTILO)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext'; // <--- Asegúrate de usar useAuth aquí
import './profile.css'; 

// ------------------- TIPOS Y CONSTANTES (Sin Cambios) -------------------
const defaultTheme = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  cardColor: 'rgba(255, 255, 255, 0.05)',
  textColor: '#ffffff',
  accentColor: '#64b3f4',
  borderRadius: '20px'
};

const themes = [
  { name: 'Azul Océano (Predeterminado)', config: defaultTheme },
  {
    name: 'Púrpura Galáctico',
    config: {
      background: 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
      cardColor: 'rgba(255, 255, 255, 0.08)',
      textColor: '#ffffff',
      accentColor: '#a29bfe',
      borderRadius: '20px'
    }
  },
  {
    name: 'Verde Bosque',
    config: {
      background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      cardColor: 'rgba(255, 255, 255, 0.07)',
      textColor: '#ffffff',
      accentColor: '#55efc4',
      borderRadius: '20px'
    }
  },
  {
    name: 'Naranja Atardecer',
    config: {
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      cardColor: 'rgba(0, 0, 0, 0.1)',
      textColor: '#2d3436',
      accentColor: '#fd79a8',
      borderRadius: '20px'
    }
  },
  {
    name: 'Oscuro Carbón',
    config: {
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)',
      cardColor: 'rgba(255, 255, 255, 0.03)',
      textColor: '#ffffff',
      accentColor: '#00d2d3',
      borderRadius: '20px'
    }
  },
  {
    name: 'Rosa Suave',
    config: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardColor: 'rgba(255, 255, 255, 0.1)',
      textColor: '#ffffff',
      accentColor: '#fd79a8',
      borderRadius: '20px'
    }
  }
];

// ------------------- UTILIDADES (Ajustamos formatFechaLarga para evitar errores de zona horaria) -------------------

const formatFechaLarga = (fecha) => {
    if (!fecha || fecha === '0000-00-00') return 'N/A';
    try {
        const fechaDate = new Date(fecha);
        // Si la fecha es YYYY-MM-DD, a veces se interpreta como el día anterior en UTC.
        // Sumamos 1 día solo para fechas de nacimiento (generalmente sin hora) para corregir el desfase.
        if (fecha.length === 10) fechaDate.setDate(fechaDate.getDate() + 1); 
        return format(fechaDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (e) {
        console.error("Error al formatear fecha:", e);
        return fecha; 
    }
};

const applyTheme = (theme) => {
  if (!theme) return;
  
  const body = document.body;
  body.style.background = theme.background;
  
  document.documentElement.style.setProperty('--card-color', theme.cardColor);
  document.documentElement.style.setProperty('--text-color', theme.textColor);
  document.documentElement.style.setProperty('--accent-color', theme.accentColor);
  document.documentElement.style.setProperty('--border-radius', theme.borderRadius);
};

// ------------------- COMPONENTE PRINCIPAL -------------------

export default function Profile() {
  const navigate = useNavigate();
  // Usamos useAuth para obtener el usuario real
  const { user, isAuthenticated, loading } = useAuth();
  const apiUrl = 'http://localhost:8012/miproyecto/api'; 

  const [userData, setUserData] = useState({
    userNameWeb: '',
    email: '',
    nombre: '',
    apellido: '',
    avatar: '',
    fechaNacimiento: '',
    bio: '',
    rol: '',
    fechaRegistro: '',
  });

  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);

  const selectTheme = (themeConfig) => {
    setCurrentTheme(themeConfig);
    sessionStorage.setItem('userTheme', JSON.stringify(themeConfig));
  };
  
  const resetToDefault = () => {
    selectTheme(defaultTheme);
  };


  // 1. Efecto para cargar los datos del usuario DESDE EL CONTEXTO
  useEffect(() => {
    // Si el usuario está cargado y autenticado, cargamos los datos.
    if (!loading && isAuthenticated && user) {
        setUserData({
            userNameWeb: user.userNameWeb || '',
            email: user.email || '',
            nombre: user.nombre || '', 
            apellido: user.apellido || '', 
            avatar: user.avatar || '',
            fechaNacimiento: user.fechaNacimiento || '',
            bio: user.bio || '',
            rol: user.rol || '',
            fechaRegistro: user.fechaRegistro || '',
        });
    } else if (!loading && !isAuthenticated) {
        // Si no está autenticado, redirigir
        navigate('/login'); 
    }
    // NOTA: EL fetchUserData simulado de tu código anterior fue eliminado
    // y reemplazado por la lógica de useAuth.
  }, [loading, isAuthenticated, user, navigate]); 

  // 2. y 3. Efectos para el tema (sin cambios, funcionan bien)
  useEffect(() => {
    try {
        const savedThemeString = sessionStorage.getItem('userTheme');
        let themeToApply = defaultTheme;
        if (savedThemeString) {
            themeToApply = JSON.parse(savedThemeString);
        }
        setCurrentTheme(themeToApply);
        applyTheme(themeToApply);
    } catch (error) {
        console.error('Error al cargar tema guardado:', error);
        applyTheme(defaultTheme);
    }
  }, []);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Manejadores de navegación
  const irCambiarContrasena = useCallback(() => {
    navigate('/main-layout/change-password');
  }, [navigate]);

  const irEditarPerfil = useCallback(() => {
    navigate('/registrarte', { state: { edit: true } }); 
  }, [navigate]);

  const viewSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  // Estados de carga/no autenticado
  if (loading) {
    return <div className="loading-message">Cargando perfil...</div>;
  }
  if (!isAuthenticated || !user) {
    // La redirección está en el useEffect, pero devolvemos esto por si acaso
    return <div className="not-authenticated-message">Redirigiendo al login...</div>;
  }


  return (
    <div className="container">
      {/* Header del Perfil */}
      <div className="profile-header">
        {/* En React, [src] se convierte en src={} */}
        <img 
            src={`${apiUrl}/${userData.avatar}`} 
            alt="Avatar del usuario" 
            className="profile-avatar" 
            id="userAvatar" 
        />
        {/* Los IDs no son necesarios en React a menos que manipules el DOM directamente */}
        <h1 className="profile-username">{userData.userNameWeb}</h1> 
        <span className="profile-role">{userData.rol}</span> 
        <p className="profile-fullname">{userData.nombre} {userData.apellido}</p>
      </div>

      {/* Información del Perfil */}
      <div className="profile-info">
        <div className="info-card">
          <div className="info-label">
            <span className="info-icon"><i className="bi bi-person-circle"></i></span>
            Nombre Completo: {userData.nombre} {userData.apellido}
          </div>
        </div>

        <div className="info-card">
          <div className="info-label">
            <span className="info-icon"><i className="bi bi-cake2-fill"></i></span>
            Fecha de nacimiento: {userData.fechaNacimiento}
          </div>
        </div>

        <div className="info-card">
          <div className="info-label">
            <span className="info-icon"><i className="bi bi-calendar-heart"></i></span>
            Miembro desde: {formatFechaLarga(userData.fechaRegistro)}
          </div>
        </div>

        <div className="info-card">
          <div className="info-label">
            <span className="info-icon"><i className="bi bi-envelope-at-fill"></i></span>
            Correo: {userData.email}
          </div>
        </div>
      </div>

      {/* Biografía */}
      <div className="biography-section">
        <h2 className="biography-title">
          <span className="info-icon">📖</span>
          Biografía
        </h2>
        <div className="biography-content">{userData.bio || 'Aún no hay biografía.'}</div>
      </div>

      {/* Botones de Acción */}
      <div className="action-buttons">
        <button className="action-btn" onClick={irEditarPerfil}> {/* (click) se convierte en onClick={} */}
          
          Editar Perfil
        </button>
        <button type="button" className="action-btn secondary" onClick={irCambiarContrasena}>
          
          Cambiar Contraseña
        </button>
        <button className="action-btn" onClick={viewSettings}>
          
          Configuración
        </button>
      </div>

      {/* Modal de Configuración (Reemplazamos *ngIf y [class.show] por renderizado condicional) */}
      {showSettings && (
        <div className={`settings-modal ${showSettings ? 'show' : ''}`}>
          <div className="settings-overlay" onClick={closeSettings}></div>
          <div className="settings-content">
            <div className="settings-header">
              <h2 className="settings-title"> Personalizar Apariencia</h2>
              <button className="close-btn" onClick={closeSettings}>&times;</button>
            </div>
            
            <div className="settings-body">
              <h3 className="section-title">Temas Predefinidos</h3>
              <div className="theme-grid">
                {themes.map((theme, i) => ( // *ngFor se convierte en .map()
                  <div 
                    key={i}
                    className={`theme-option ${currentTheme === theme.config ? 'active' : ''}`} // [class.active]
                    onClick={() => selectTheme(theme.config)} // (click)
                  >
                    <div className="theme-preview" style={{ background: theme.config.background }}> {/* [style] */}
                      <div className="theme-preview-card" style={{ backgroundColor: theme.config.cardColor }}>
                        <div className="theme-preview-text" style={{ color: theme.config.textColor }}>Aa</div>
                        <div className="theme-preview-accent" style={{ backgroundColor: theme.config.accentColor }}></div>
                      </div>
                    </div>
                    <span className="theme-name">{theme.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="settings-actions">
                <button className="reset-btn" onClick={resetToDefault}>
                  <span>🔄</span>
                  Restablecer Predeterminado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <br/><br/><br/>
    </div>
  );
}