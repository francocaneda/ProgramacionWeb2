import apiClient from "./apiClient"; 

const postService = {

    // Obtener posts por categoría
    getPostsByCategory: async (id_categoria) => {
        try {
            const response = await apiClient.get(`/api/posts/categoria/${id_categoria}`);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo posts por categoría:", error);
            throw error;
        }
    },

    // Crear nuevo post
    createPost: async (data) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No hay token de usuario. Debes iniciar sesión.');

            const response = await apiClient.post('/api/posts', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error creando post:", error);
            throw error;
        }
    },

    // Obtener detalle de un post por ID (RUTA CORREGIDA)
    getPostDetalle: async (id_post) => {
        try {
            const response = await apiClient.get(`/api/posts/detalle/${id_post}`);
            return response.data; // Esperamos { post: {...} }
        } catch (error) {
            console.error("Error obteniendo detalle del post:", error);
            throw error;
        }
    },

    // Eliminar un post por ID
    eliminarPost: async (id_post) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No hay token de usuario. Debes iniciar sesión.');

            const response = await apiClient.delete(`/api/posts/${id_post}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error eliminando post:", error);
            throw error;
        }
    }

};

export default postService;
