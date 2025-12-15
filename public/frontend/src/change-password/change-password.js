import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import "./change-password.css"


export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth(); 

    const isInvalid = !currentPassword.trim() || !newPassword.trim() || newPassword !== confirmNewPassword || newPassword.length < 6;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isInvalid) return;

        setSubmitting(true);
        try {
            await userService.updatePassword(currentPassword, newPassword);

            // 1. Mostrar éxito
            await Swal.fire({
                icon: 'success',
                title: 'Contraseña Actualizada',
                text: 'Su contraseña ha sido cambiada. Debe volver a iniciar sesión con su nueva contraseña.',
                confirmButtonText: 'Aceptar'
            });

            // 2. Cerrar sesión
            logout();

            // 3. Redirigir al Login
            navigate('/', { replace: true });

        } catch (err) {
            const message = err.response?.data?.message || 'Error al actualizar la contraseña.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="regis-scope"> {/* Usa la clase contenedora de tus formularios */}
            <div className="wrapper fadeInDown">
                <div className="formContent">
                    <h2 className="fadeIn first header">Actualizar Contraseña</h2>
                    <form onSubmit={handleSubmit}>
                        
                        {/* Contraseña Actual */}
                        <div className="regis-field">
                            <label className="regis-label">Contraseña Actual</label>
                            <input
                                type="password"
                                className="regis-input"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Ingrese su contraseña actual"
                                required
                            />
                        </div>
                        
                        {/* Nueva Contraseña */}
                        <div className="regis-field">
                            <label className="regis-label">Nueva Contraseña (mín. 6 chars)</label>
                            <input
                                type="password"
                                className="regis-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Ingrese la nueva contraseña"
                                required
                            />
                        </div>
                        
                        {/* Confirmar Nueva Contraseña */}
                        <div className="regis-field">
                            <label className="regis-label">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                className="regis-input"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Repita la nueva contraseña"
                                required
                            />
                            {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                                <p className="regis-error">Las contraseñas no coinciden.</p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="regis-submit" 
                            disabled={isInvalid || submitting}
                        >
                            {submitting ? 'Actualizando...' : 'Actualizar'}
                        </button>
                    </form>

                    <div className="formFooter">
                        <button className="underlineHover" onClick={() => navigate('/main-layout/profile')}>
                            Volver al Perfil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}