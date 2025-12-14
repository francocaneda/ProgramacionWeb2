// src/regis-user/regis-user.js
import { useMemo, useState } from "react";
import "./regis-user.css";
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';



export default function RegisUser() {
  // Campos
  const [userNameWeb, setUserNameWeb] = useState("");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [clave, setClave] = useState("");
  const [reclave, setReclave] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [bio, setBio] = useState("");

  // Archivo
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");

  // Estado de interacción
  const [touched, setTouched] = useState({}); // {campo: true}
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();


  // Validaciones
  const errors = useMemo(() => {
    const e = {};
    if (!userNameWeb.trim()) e.userNameWeb = "Nombre de usuario requerido.";
    if (!email.trim()) e.email = "Email requerido.";
    else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) e.email = "Email inválido.";
    }
    if (!nombre.trim()) e.nombre = "Nombre requerido.";
    if (!apellido.trim()) e.apellido = "Apellido requerido.";
    if (!clave) e.clave = "Contraseña requerida.";
    else if (clave.length < 8) e.clave = "Mínimo 8 caracteres.";
    if (!reclave) e.reclave = "Repita la contraseña.";
    else if (reclave !== clave) e.reclave = "No coincide.";
    if (!fechaNacimiento) e.fechaNacimiento = "Fecha requerida.";
    return e;
  }, [userNameWeb, email, nombre, apellido, clave, reclave, fechaNacimiento]);

  const isValid = Object.keys(errors).length === 0;

  // Helpers
  const markTouched = (name) =>
    setTouched((t) => ({ ...t, [name]: true }));

  const showError = (name) =>
    (touched[name] || submitting) && errors[name];

  // File
  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) {
      setFileName("");
      setPreview("");
      return;
    }
    setFileName(f.name);
    setPreview(URL.createObjectURL(f));
  }

async function submit(e) {
  e.preventDefault();
  setSubmitting(true);

  // marcar touched como ya hacés
  setTouched({
    userNameWeb: true,
    email: true,
    nombre: true,
    apellido: true,
    clave: true,
    reclave: true,
    fechaNacimiento: true,
    bio: true,
  });

  if (!isValid) {
    setSubmitting(false);
    return;
  }

  try {
    await userService.register({
      user_nameweb: userNameWeb,
      email,
      clave,
      nombre_completo: `${nombre} ${apellido}`.trim(),
      fecha_nacimiento: fechaNacimiento || null,
      bio: bio || ''
    });

    alert('✅ Usuario registrado. Ahora podés iniciar sesión.');
    navigate("/")
  } catch (err) {
    const msg = err?.response?.data?.message || 'Error registrando usuario';
    alert(msg);
  } finally {
    setSubmitting(false);
  }
}


  return (
    <div className="regis-wrapper">
      <div className="regis-card">
        <div className="regis-header">
          <div className="regis-avatar">
            <svg className="regis-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="regis-title">Crear cuenta</h1>
          <p className="regis-subtitle">Completá tus datos para registrarte</p>
        </div>

        <form className="regis-form" onSubmit={submit} noValidate>
          <div className="regis-grid">
            <div className="regis-field">
              <label className="regis-label">Usuario</label>
              <input
                className="regis-input"
                value={userNameWeb}
                onChange={(e)=>setUserNameWeb(e.target.value)}
                onBlur={()=>markTouched("userNameWeb")}
                placeholder="tu_usuario"
                autoComplete="username"
              />
              {showError("userNameWeb") && <p className="regis-error">{errors.userNameWeb}</p>}
            </div>

            <div className="regis-field">
              <label className="regis-label">Email</label>
              <input
                className="regis-input"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                onBlur={()=>markTouched("email")}
                placeholder="tu@email.com"
                autoComplete="email"
              />
              {showError("email") && <p className="regis-error">{errors.email}</p>}
            </div>

            <div className="regis-field">
              <label className="regis-label">Nombre</label>
              <input
                className="regis-input"
                value={nombre}
                onChange={(e)=>setNombre(e.target.value)}
                onBlur={()=>markTouched("nombre")}
                placeholder="Nombre"
                autoComplete="given-name"
              />
              {showError("nombre") && <p className="regis-error">{errors.nombre}</p>}
            </div>

            <div className="regis-field">
              <label className="regis-label">Apellido</label>
              <input
                className="regis-input"
                value={apellido}
                onChange={(e)=>setApellido(e.target.value)}
                onBlur={()=>markTouched("apellido")}
                placeholder="Apellido"
                autoComplete="family-name"
              />
              {showError("apellido") && <p className="regis-error">{errors.apellido}</p>}
            </div>

            <div className="regis-field">
              <label className="regis-label">Contraseña</label>
              <input
                type="password"
                className="regis-input"
                value={clave}
                onChange={(e)=>setClave(e.target.value)}
                onBlur={()=>markTouched("clave")}
                placeholder="********"
                autoComplete="new-password"
              />
              {showError("clave") && <p className="regis-error">{errors.clave}</p>}
            </div>

            <div className="regis-field">
              <label className="regis-label">Repetir contraseña</label>
              <input
                type="password"
                className="regis-input"
                value={reclave}
                onChange={(e)=>setReclave(e.target.value)}
                onBlur={()=>markTouched("reclave")}
                placeholder="********"
                autoComplete="new-password"
              />
              {showError("reclave") && <p className="regis-error">{errors.reclave}</p>}
            </div>

            <div className="regis-field">
              <label className="regis-label">Fecha de nacimiento</label>
              <input
                type="date"
                className="regis-input"
                value={fechaNacimiento}
                onChange={(e)=>setFechaNacimiento(e.target.value)}
                onBlur={()=>markTouched("fechaNacimiento")}
              />
              {showError("fechaNacimiento") && <p className="regis-error">{errors.fechaNacimiento}</p>}
            </div>

            <div className="regis-field regis-field-col2">
              <label className="regis-label">Biografía</label>
              <textarea
                className="regis-input regis-textarea"
                rows={3}
                value={bio}
                onChange={(e)=>setBio(e.target.value)}
                onBlur={()=>markTouched("bio")}
                placeholder="Contanos algo sobre vos..."
              />
            </div>


          </div>

          <button className="regis-submit" disabled={!isValid || submitting}>
            {submitting ? "Enviando..." : "Registrarme"}
          </button>
        </form>

        <div className="regis-footer">
          <a className="regis-link" href="/">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  );
}