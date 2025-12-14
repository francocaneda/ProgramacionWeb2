// src/password-reset/password-reset.js
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../services/apiClient";
import "./password-reset.css";

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // 🔑 Leer token desde la URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (!tokenFromUrl) {
      alert("Token inválido o no proporcionado");
      navigate("/");
      return;
    }

    setToken(tokenFromUrl);
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert("Por favor complete ambos campos");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      setLoading(true);

      await apiClient.post("/api/reset-password", {
        token,
        newPassword : password, // 🔥 compatible con backend
      });

      alert("¡Contraseña actualizada exitosamente!");
      navigate("/");
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);
      const msg =
        err?.response?.data?.message ||
        "No se pudo restablecer la contraseña. El token puede haber expirado.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const isInvalid =
    !password ||
    !confirmPassword ||
    password !== confirmPassword ||
    loading;

  return (
    <div className="reset-scope">
      <div className="wrapper fadeInDown">
        <div className="formContent">
          <div className="fadeIn first header">
            <div className="icon" aria-hidden />
            <h1>Restablecer Contraseña</h1>
            <p className="subtitle">Ingrese su nueva contraseña</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <label className="label">Nueva Contraseña</label>

            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="input fadeIn second"
                placeholder="Nueva Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <label className="label">Confirmar Nueva Contraseña</label>

            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input fadeIn third"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {password && confirmPassword && password !== confirmPassword && (
              <p className="error-message fadeIn">
                Las contraseñas no coinciden
              </p>
            )}

            <button
              type="submit"
              disabled={isInvalid}
              className={`submit-btn fadeIn fourth ${
                loading ? "loading" : ""
              } ${isInvalid ? "disabled" : ""}`}
            >
              {loading ? "Actualizando..." : "Restablecer Contraseña"}
            </button>

            {loading && <div className="spinner" />}
          </form>

        </div>
      </div>
    </div>
  );
}
