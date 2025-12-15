import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./regis-user.css";

import userService from "../services/userService";
import apiClient from "../services/apiClient";
import { useAuth } from "../context/AuthContext";


export default function RegisUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, getToken, loadUser } = useAuth();

  // Si venís desde Profile: navigate('/registrarte', { state: { edit: true } })
  const isEditMode = Boolean(location?.state?.edit && isAuthenticated && user);

  // Form state (mantenemos campos del registro + los que se editan)
  const [form, setForm] = useState({
    userNameWeb: "",
    email: "",
    nombre: "",
    apellido: "",
    clave: "",
    reclave: "",
    fechaNacimiento: "",
    bio: "",
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

useEffect(() => {
  if (!isEditMode || !user) return;

    if (Number(user?.uid) === 1) {
    Swal.fire(
      "Acción no permitida",
      "El administrador general del sistema no puede editar su perfil.",
      "warning"
    ).then(() => navigate("/main-layout/profile"));
    return;
    }
  const fullName = (user?.nombre || "").trim();
  const partes = fullName ? fullName.split(/\s+/) : [];

  const nombre = partes.shift() || "";
  const apellido = partes.join(" "); 

  setForm((prev) => ({
    ...prev,
    userNameWeb: user?.userNameWeb || "",
    email: user?.email || "", 
    nombre,
    apellido,
    fechaNacimiento: user?.fechaNacimiento || "",
    bio: user?.bio || "",
    clave: "",
    reclave: "",
  }));
}, [isEditMode, user]);

  const errors = useMemo(() => {
    const e = {};

    // username
    if (!form.userNameWeb?.trim()) e.userNameWeb = "Nombre de usuario requerido.";

    // En edición: NO pedimos email/clave/fecha
    if (!isEditMode) {
      if (!form.email?.trim()) e.email = "Email requerido.";
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email inválido.";

      if (!form.clave) e.clave = "Contraseña requerida.";
      else if (form.clave.length < 6) e.clave = "Mínimo 6 caracteres.";

      if (!form.reclave) e.reclave = "Repita la contraseña.";
      else if (form.reclave !== form.clave) e.reclave = "No coincide.";

      if (!form.fechaNacimiento) e.fechaNacimiento = "Fecha requerida.";
    }

    return e;
  }, [form, isEditMode]);

  const isValid = Object.keys(errors).length === 0;

  const markTouched = (name) => setTouched((t) => ({ ...t, [name]: true }));
  const showError = (name) => (touched[name] || submitting) && errors[name];

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // marcar touched
    const toTouch = isEditMode
      ? { userNameWeb: true, nombre: true, apellido: true, bio: true }
      : {
          userNameWeb: true,
          email: true,
          nombre: true,
          apellido: true,
          clave: true,
          reclave: true,
          fechaNacimiento: true,
          bio: true,
        };
    setTouched(toTouch);

    if (!isValid) {
      setSubmitting(false);
      return Swal.fire("Formulario incompleto", "Revisá los campos marcados.", "warning");
    }

    try {
      if (!isEditMode) {
        // ========= REGISTRO =========
        await userService.register({
          user_nameweb: form.userNameWeb,
          email: form.email,
          clave: form.clave,
          nombre_completo: `${form.nombre} ${form.apellido}`.trim(),
          fecha_nacimiento: form.fechaNacimiento || null,
          bio: form.bio || "",
        });

        await Swal.fire("Listo", "Usuario registrado. Ahora podés iniciar sesión.", "success");
        navigate("/");
        return;
      }

      
      const token = getToken?.() || localStorage.getItem("authToken");

      

      const payload = {
        user_nameweb: form.userNameWeb,
        nombre: form.nombre,
        apellido: form.apellido,
        bio: form.bio || "",
      };

      await apiClient.patch("/api/perfil", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // refrescar contexto
      if (typeof loadUser === "function") {
        await loadUser();
      }

      await Swal.fire("Guardado", "Perfil actualizado correctamente.", "success");
      navigate("/main-layout/profile");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Ocurrió un error. Revisá el backend/endpoints.";
      Swal.fire("Error", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="regis-wrapper">
      <div className="regis-card">
        <div className="regis-header">
          <div className="regis-avatar">
            <svg className="regis-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <h1 className="regis-title">{isEditMode ? "Editar perfil" : "Crear cuenta"}</h1>
          <p className="regis-subtitle">
            {isEditMode
              ? "Podés editar tu nombre, apellido, usuario y biografía."
              : "Completá tus datos para registrarte"}
          </p>
        </div>

        <form className="regis-form" onSubmit={onSubmit} noValidate>
          <div className="regis-grid">
            {/* Nombre */}
            <div className="regis-field">
              <label className="regis-label">Nombre</label>
              <input
                className={`regis-input ${showError("nombre") ? "is-invalid" : ""}`}
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                onBlur={() => markTouched("nombre")}
                placeholder="Tu nombre"
              />
              {showError("nombre") ? <div className="regis-error">{errors.nombre}</div> : null}
            </div>

            {/* Apellido */}
            <div className="regis-field">
              <label className="regis-label">Apellido</label>
              <input
                className={`regis-input ${showError("apellido") ? "is-invalid" : ""}`}
                name="apellido"
                value={form.apellido}
                onChange={onChange}
                onBlur={() => markTouched("apellido")}
                placeholder="Tu apellido"
              />
              {showError("apellido") ? <div className="regis-error">{errors.apellido}</div> : null}
            </div>

            {/* Usuario */}
            <div className="regis-field">
              <label className="regis-label">Nombre de usuario</label>
              <input
                className={`regis-input ${showError("userNameWeb") ? "is-invalid" : ""}`}
                name="userNameWeb"
                value={form.userNameWeb}
                onChange={onChange}
                onBlur={() => markTouched("userNameWeb")}
                placeholder="Nombre de Usuario del Foro"
              />
              {showError("userNameWeb") ? <div className="regis-error">{errors.userNameWeb}</div> : null}
            </div>

            {/* Email (solo registro) */}
            {!isEditMode && (
              <div className="regis-field">
                <label className="regis-label">Email</label>
                <input
                  className={`regis-input ${showError("email") ? "is-invalid" : ""}`}
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  onBlur={() => markTouched("email")}
                  placeholder="mail@ejemplo.com"
                />
                {showError("email") ? <div className="regis-error">{errors.email}</div> : null}
              </div>
            )}

            {/* Fecha (solo registro) */}
            {!isEditMode && (
              <div className="regis-field">
                <label className="regis-label">Fecha de nacimiento</label>
                <input
                  type="date"
                  className={`regis-input ${showError("fechaNacimiento") ? "is-invalid" : ""}`}
                  name="fechaNacimiento"
                  value={form.fechaNacimiento}
                  onChange={onChange}
                  onBlur={() => markTouched("fechaNacimiento")}
                />
                {showError("fechaNacimiento") ? (
                  <div className="regis-error">{errors.fechaNacimiento}</div>
                ) : null}
              </div>
            )}

            {/* Bio */}
            <div className="regis-field regis-field-full">
              <label className="regis-label">Biografía</label>
              <textarea
                className="regis-textarea"
                name="bio"
                value={form.bio}
                onChange={onChange}
                onBlur={() => markTouched("bio")}
                placeholder="Contá algo sobre vos..."
                rows={4}
              />
            </div>

            {/* Password (solo registro) */}
            {!isEditMode && (
              <>
                <div className="regis-field">
                  <label className="regis-label">Contraseña</label>
                  <input
                    type="password"
                    className={`regis-input ${showError("clave") ? "is-invalid" : ""}`}
                    name="clave"
                    value={form.clave}
                    onChange={onChange}
                    onBlur={() => markTouched("clave")}
                    placeholder="********"
                  />
                  {showError("clave") ? <div className="regis-error">{errors.clave}</div> : null}
                </div>

                <div className="regis-field">
                  <label className="regis-label">Repetir contraseña</label>
                  <input
                    type="password"
                    className={`regis-input ${showError("reclave") ? "is-invalid" : ""}`}
                    name="reclave"
                    value={form.reclave}
                    onChange={onChange}
                    onBlur={() => markTouched("reclave")}
                    placeholder="********"
                  />
                  {showError("reclave") ? <div className="regis-error">{errors.reclave}</div> : null}
                </div>
              </>
            )}
          </div>

          <div className="regis-actions">
            <button className="regis-btn" type="submit" disabled={submitting}>
              {submitting ? "Procesando..." : isEditMode ? "Guardar" : "Registrarme"}
            </button>

            <button
              className="regis-btn regis-btn-secondary"
              type="button"
              onClick={() => (isEditMode ? navigate("/main-layout/profile") : navigate("/"))}
              disabled={submitting}
            >
              Cancelar
            </button>
          </div>

          {isEditMode && (
            <p className="regis-hint">
              Para modificar otros campos (email, contraseña, fecha de nacimiento, rol), comunicate con el administrador.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
