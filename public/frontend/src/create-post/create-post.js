import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './create-post.css'; 

import { useCategoryService } from '../services/categoryService';
import postService from '../services/post.service';
import { useAuth } from '../context/AuthContext'; 

function CreatePost() {
    const navigate = useNavigate();
    const location = useLocation();
    const { getCategorias } = useCategoryService();
    const { user } = useAuth();

    const MAX_TITLE_LENGTH = 100;
    const MAX_CONTENT_LENGTH = 5000;

    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        id_categoria: '',
        titulo: '',
        contenido: '',
    });
    const [errors, setErrors] = useState({});

    // --- Cargar categorías ---
    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const data = await getCategorias();
                setCategorias(data.categorias || []);
            } catch (error) {
                console.error("Error al obtener categorías:", error);
                Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        cargarCategorias();
    }, [getCategorias]);

    // --- Validación ---
    const validateField = (name, value) => {
        let error = '';
        if (name === 'id_categoria' && !value) {
            error = 'Debes seleccionar una categoría.';
        } else if (name === 'titulo' && (!value || value.length > MAX_TITLE_LENGTH)) {
            error = 'El título es obligatorio y debe tener menos de 100 caracteres.';
        } else if (name === 'contenido' && (!value || value.length > MAX_CONTENT_LENGTH)) {
            error = 'El contenido es obligatorio y no debe superar los 5000 caracteres.';
        }
        return error;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        const error = validateField(id, value);
        setErrors(prev => ({ ...prev, [id]: error }));
    };

    // ================================
    //       SUBMIT FORM
    // ================================
    const onSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};
        let isValid = true;

        for (const [key, value] of Object.entries(formData)) {
            const error = validateField(key, value);
            newErrors[key] = error;
            if (error) isValid = false;
        }

        setErrors(newErrors);

        if (!isValid) {
            return Swal.fire({
                icon: 'warning',
                title: 'Formulario Incompleto',
                text: 'Por favor, revisa los campos marcados.'
            });
        }

        if (!user || !user.uid) {
            return Swal.fire('Error', 'No se pudo identificar al usuario. Por favor inicia sesión.', 'error');
        }

        try {
            const payload = { ...formData, id_usuario: user.uid };
            await postService.createPost(payload);

            // ============================
            // 🔥 IMPORTANTE: FORZAR UPDATE
            // ============================
            localStorage.setItem("postsUpdated", "true");

            Swal.fire('Éxito', 'Post creado correctamente', 'success');
            navigate('/foro');
        } catch (error) {
            console.error("Error al crear post:", error);
            Swal.fire('Error', 'No se pudo crear el post', 'error');
        }
    };

    const onCancel = () => navigate(-1);

    return (
        <div className="container">
            <div className="create-post-container">

                {/* Header */}
                <header className="create-post-header">
                    <i className="bi bi-pencil-square create-post-icon"></i>
                    <h1 className="create-post-title">Crear Nueva Publicación</h1>
                    <p className="create-post-subtitle">
                        Comparte tus conocimientos o inicia una discusión en el foro.
                        Asegúrate de elegir la categoría correcta.
                    </p>
                </header>

                {/* Form */}
                <form className="create-post-form" onSubmit={onSubmit}>

                    {/* Categoría */}
                    <div className={`form-group ${errors.id_categoria ? 'error' : formData.id_categoria ? 'success' : ''}`}>
                        <label htmlFor="id_categoria" className="form-label">
                            <i className="bi bi-bookmark-fill form-label-icon"></i> Categoría
                        </label>

                        <select
                            id="id_categoria"
                            className="form-select"
                            value={formData.id_categoria}
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value="">
                                {isLoading ? 'Cargando categorías...' : 'Selecciona una categoría...'}
                            </option>

                            {categorias.map(cat => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                    {cat.nombre_categoria}
                                </option>
                            ))}
                        </select>

                        {errors.id_categoria && (
                            <div className="error-message">
                                <i className="bi bi-x-circle-fill"></i> {errors.id_categoria}
                            </div>
                        )}

                        {!errors.id_categoria && formData.id_categoria && (
                            <div className="success-message">
                                <i className="bi bi-check-circle-fill"></i> Categoría seleccionada.
                            </div>
                        )}
                    </div>

                    {/* Título */}
                    <div className={`form-group ${errors.titulo ? 'error' : formData.titulo ? 'success' : ''}`}>
                        <label htmlFor="titulo" className="form-label">
                            <i className="bi bi-type-h1 form-label-icon"></i>
                            Título de la Publicación
                        </label>

                        <input
                            type="text"
                            id="titulo"
                            className="form-input"
                            placeholder="Ej: Cómo usar React Hooks de forma efectiva..."
                            value={formData.titulo}
                            onChange={handleChange}
                            maxLength={MAX_TITLE_LENGTH}
                        />

                        {errors.titulo && (
                            <div className="error-message">
                                <i className="bi bi-x-circle-fill"></i> {errors.titulo}
                            </div>
                        )}

                        <span className={`character-counter 
                            ${formData.titulo.length > MAX_TITLE_LENGTH - 10 ? 'warning' : ''} 
                            ${formData.titulo.length === MAX_TITLE_LENGTH ? 'danger' : ''}`}>
                            {formData.titulo.length} / {MAX_TITLE_LENGTH}
                        </span>
                    </div>

                    {/* Contenido */}
                    <div className={`form-group ${errors.contenido ? 'error' : formData.contenido ? 'success' : ''}`}>
                        <label htmlFor="contenido" className="form-label">
                            <i className="bi bi-body-text form-label-icon"></i>
                            Contenido (Markdown soportado)
                        </label>

                        <textarea
                            id="contenido"
                            className="form-textarea"
                            placeholder="Escribe el cuerpo de tu publicación aquí..."
                            value={formData.contenido}
                            onChange={handleChange}
                            maxLength={MAX_CONTENT_LENGTH}
                        />

                        {errors.contenido && (
                            <div className="error-message">
                                <i className="bi bi-x-circle-fill"></i> {errors.contenido}
                            </div>
                        )}

                        <span className={`character-counter 
                            ${formData.contenido.length > MAX_CONTENT_LENGTH - 200 ? 'warning' : ''} 
                            ${formData.contenido.length === MAX_CONTENT_LENGTH ? 'danger' : ''}`}>
                            {formData.contenido.length} / {MAX_CONTENT_LENGTH}
                        </span>
                    </div>

                    {/* Botones */}
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            <i className="bi bi-x-lg btn-icon"></i>
                            Cancelar
                        </button>

                        <button type="submit" className="btn btn-primary">
                            <i className="bi bi-send-fill btn-icon"></i>
                            Publicar Ahora
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default CreatePost;
