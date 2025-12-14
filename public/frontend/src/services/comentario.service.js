import axios from 'axios';

const API_URL = 'http://localhost:8012/api/comentarios';

// Helper para headers con token
const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { Authorization: `Bearer ${token}` };
};

// Obtener comentarios (con nested threading si el back lo soporta)
const getComentarios = async (id_post) => {
  try {
    const resp = await axios.get(`${API_URL}/post/${id_post}`);
    return resp.data;
  } catch (error) {
    console.error("Error al obtener comentarios:", error.response?.data || error);
    throw error;
  }
};

// Crear comentario
const crearComentario = async (id_post, contenido, id_comentario_padre = null) => {
  try {
    const body = { contenido, id_comentario_padre };

    const resp = await axios.post(
      `${API_URL}/post/${id_post}`,
      body,
      { headers: authHeaders() }
    );

    return resp.data;
  } catch (error) {
    console.error("Error al crear comentario:", error.response?.data || error);
    throw error;
  }
};

// Eliminar comentario
const eliminarComentario = async (id_comentario) => {
  try {
    const resp = await axios.delete(
      `${API_URL}/${id_comentario}`,
      { headers: authHeaders() }
    );
    return resp.data;
  } catch (error) {
    console.error("Error al eliminar comentario:", error.response?.data || error);
    throw error;
  }
};

export default {
  getComentarios,
  crearComentario,
  eliminarComentario
};
