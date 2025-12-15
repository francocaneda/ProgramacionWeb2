import apiClient from "./apiClient";

const userService = {
  // Obtener la cantidad total de usuarios
  getTotalUsuarios: async () => {
    try {
      const response = await apiClient.get("/api/usuarios/count");
      return response.data.total || 0;
    } catch (error) {
      console.error("Error obteniendo total de usuarios:", error);
      return 0;
    }
  },

  // LISTA DE USUARIOS (ADMIN)
  getUsuarios: async () => {
    const token = localStorage.getItem('authToken');
    const res = await apiClient.get('/api/usuarios', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  },

  // ELIMINAR USUARIO (ADMIN)
  eliminarUsuario: async (id_usuario) => {
    const token = localStorage.getItem('authToken');
    const res = await apiClient.delete(`/api/usuarios/${id_usuario}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  },

    // CAMBIAR ROL DE USUARIO (ADMIN)
  cambiarRol: async (id_usuario, rol) => {
    const token = localStorage.getItem('authToken');

    const res = await apiClient.put(
      `/api/usuarios/${id_usuario}/rol`,
      { rol },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return res.data;
  },

  updateProfile : async (payload) => {
    // POST http://localhost:8012/api/perfil
  const { data } = await apiClient.patch('/api/perfil', payload);
  return data;
},

updatePassword: async (currentPassword, newPassword) => {
  const { data } = await apiClient.patch('/api/change-password', {
    currentPassword,
    newPassword
  });
  return data;
},


  register: async (payload) => {
    // POST http://localhost:8012/api/user
    const res = await apiClient.post('/api/usuarios', payload);
    return res.data;
  },
};

export default userService;
