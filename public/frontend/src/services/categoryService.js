// frontend/src/services/categoryService.js 

import apiClient from './apiClient'; 
import { useAuth } from '../context/AuthContext'; 
import { useMemo } from 'react'; 

/**
 * Hook personalizado para acceder a las funciones del servicio de categorías.
 * Utiliza useMemo para asegurar que las funciones sean estables a través de los renders.
 */
export function useCategoryService() {
    
    const { getToken, logout } = useAuth();
    
    const apiClientInstance = apiClient; 

    // CLAVE: Memoizamos el objeto de funciones del servicio
    const serviceFunctions = useMemo(() => {
        
        const getCategorias = async () => {
            try {
                const response = await apiClientInstance.get('/api', { 
                    params: { 
                        comando: 'categorias' 
                    } 
                }); 
                // ⬇️ AJUSTE CRÍTICO: Devolver el objeto de datos del servidor (sin envoltorio de Axios)
                return response.data; 
            } catch (error) {
                // Manejo de errores a nivel de servicio
                throw error;
            }
        };

        const crearCategoria = (data) => {
            return apiClientInstance.post('/api', data, { 
                params: { 
                    comando: 'crearcategoria' 
                } 
            }); 
        };

        const eliminarCategoria = (id) => {
            return apiClientInstance.post('/api', { id_categoria: id }, { 
                params: { 
                    comando: 'eliminarcategoria' 
                } 
            }); 
        };

        return {
            getCategorias,
            crearCategoria,
            eliminarCategoria,
        };
    }, [apiClientInstance]); 

    return serviceFunctions;
}