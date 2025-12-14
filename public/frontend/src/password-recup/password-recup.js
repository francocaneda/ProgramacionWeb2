// src/password-recup/password-recup.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient"
import "./password-recup.css";

export default function PasswordRecup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email.trim()) return;

  try {
    setLoading(true);

    await apiClient.post("/api/forgot-password", { email });

    alert("¡Listo! Te enviamos un link para recuperar la contraseña.");
    navigate("/"); // vuelve al login
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      "No se pudo enviar el correo de recuperación.";
    alert(msg);
  } finally {
    setLoading(false);
  }
};

  const isInvalid = !email.trim();

  return (
    <div className="recup-scope">
      <div className="wrapper fadeInDown">
        <div className="formContent">
          <div className="fadeIn first header">
            <div className="icon" aria-hidden />
            <h1>Recuperar o Modificar Contraseña</h1>
            <p className="subtitle">
              Le enviaremos un link a su correo para recuperar la contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <label htmlFor="recup-email" className="label">
              Ingrese su Email de Usuario
            </label>

            <input
              type="email"
              id="recup-email"
              className="input fadeIn second"
              name="email"
              placeholder="Email de Usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isInvalid || loading}
              className={`submit-btn fadeIn fourth ${loading ? "loading" : ""} ${
                isInvalid ? "disabled" : ""
              }`}
            >
              {loading ? "Enviando..." : "Ingresar"}
            </button>

            {loading && <div className="spinner" aria-label="Cargando…" />}
          </form>

          <div className="formFooter">
            <Link className="underlineHover" to="/">Volver al Inicio de Sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
