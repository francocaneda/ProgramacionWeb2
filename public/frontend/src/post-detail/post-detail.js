import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import postService from '../services/post.service';
import comentarioService from '../services/comentario.service';
import { useAuth } from '../context/AuthContext';
import './post-detail.css';

function PostDetail() {
  const { id_post } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comentarios, setComentarios] = useState([]);

  const [nuevoComentario, setNuevoComentario] = useState('');

  const [respuestaA, setRespuestaA] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState('');

  // ID del comentario que está eliminándose (para animación)
  const [animandoEliminacion, setAnimandoEliminacion] = useState(null);

  // ID del comentario que está entrando con fade-in
  const [animandoCreacion, setAnimandoCreacion] = useState(null);

  useEffect(() => {
    const cargarPost = async () => {
      try {
        const resp = await postService.getPostDetalle(Number(id_post));
        setPost(resp.post || resp);
      } catch {
        Swal.fire('Error', 'No se pudo cargar el post', 'error');
      } finally {
        setLoading(false);
      }
    };
    cargarPost();
  }, [id_post]);

  useEffect(() => {
    const cargarComentarios = async () => {
      try {
        const data = await comentarioService.getComentarios(Number(id_post));
        const arbol = buildCommentTree(data);
        setComentarios(arbol);
      } catch (err) {
        console.error('Error cargando comentarios', err);
      }
    };
    cargarComentarios();
  }, [id_post]);

  // ============================================
  // 🔥 ARMAR COMENTARIOS ANIDADOS
  // ============================================
  const buildCommentTree = (lista) => {
    const mapa = {};

    lista.forEach(c => {
      mapa[c.id_comentario] = { ...c, respuestas: [] };
    });

    const raiz = [];

    lista.forEach(c => {
      if (c.id_comentario_padre) {
        mapa[c.id_comentario_padre].respuestas.push(mapa[c.id_comentario]);
      } else {
        raiz.push(mapa[c.id_comentario]);
      }
    });

    return raiz;
  };

  const eliminarPost = async () => {
    if (!post) return;

    if (user?.uid !== post.id_usuario && !user?.isAdmin) {
      return Swal.fire('Error', 'No tienes permisos para eliminar este post', 'error');
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Deseas eliminar este post?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await postService.eliminarPost(post.id_post);
        Swal.fire('Eliminado', 'El post fue eliminado correctamente', 'success');
        navigate(-1);
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el post', 'error');
      }
    }
  };

  const getInitials = (nombre) =>
    nombre ? nombre.split(' ').map(p => p[0]).join('').toUpperCase() : '';

  const formatFechaRelativa = (fecha) => {
    if (!fecha) return '';
    const f = new Date(fecha);
    const diff = Date.now() - f.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Hace un momento';
    if (mins < 60) return `Hace ${mins} minuto${mins > 1 ? 's' : ''}`;
    const horas = Math.floor(mins / 60);
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    const dias = Math.floor(horas / 24);
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  };

  // ============================================
  // 🟦 CREAR COMENTARIO (con fade-in)
  // ============================================
  const handleCrearComentario = async () => {
    if (!nuevoComentario.trim()) return;

    try {
      const creado = await comentarioService.crearComentario(id_post, nuevoComentario);
      
      setAnimandoCreacion(creado.id_comentario);  
      setNuevoComentario('');

      const data = await comentarioService.getComentarios(Number(id_post));
      setComentarios(buildCommentTree(data));

      setTimeout(() => setAnimandoCreacion(null), 300);
    } catch {
      Swal.fire('Error', 'No se pudo crear el comentario', 'error');
    }
  };

  // ============================================
  // 🟦 RESPONDER COMENTARIO (con fade-in)
  // ============================================
  const handleResponderComentario = async (id_padre) => {
    if (!textoRespuesta.trim()) return;

    try {
      const creado = await comentarioService.crearComentario(id_post, textoRespuesta, id_padre);

      setAnimandoCreacion(creado.id_comentario);
      setTextoRespuesta('');
      setRespuestaA(null);

      const data = await comentarioService.getComentarios(Number(id_post));
      setComentarios(buildCommentTree(data));

      setTimeout(() => setAnimandoCreacion(null), 300);
    } catch {
      Swal.fire('Error', 'No se pudo responder el comentario', 'error');
    }
  };

  // ============================================
  // ❌ ELIMINAR COMENTARIO (sin sweetalert)
  // ============================================
  const handleEliminarComentario = async (id_comentario, id_usuario) => {
    if (user.uid !== id_usuario && !user.isAdmin) return;

    // activar fade-out
    setAnimandoEliminacion(id_comentario);

    setTimeout(async () => {
      try {
        await comentarioService.eliminarComentario(id_comentario);

        const data = await comentarioService.getComentarios(Number(id_post));
        setComentarios(buildCommentTree(data));
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el comentario', 'error');
      } finally {
        setAnimandoEliminacion(null);
      }
    }, 350);
  };

  if (loading) return <div>Cargando post...</div>;
  if (!post) return <div>Post no encontrado</div>;

  // ========================================
  // 🔥 FUNCIÓN RECURSIVA PARA RENDERIZAR
  // ========================================
  const renderComentario = (c, nivel = 0) => (
    <div
      key={c.id_comentario}
      className={`
        comentario-card
        ${animandoEliminacion === c.id_comentario ? "fade-out" : ""}
        ${animandoCreacion === c.id_comentario ? "fade-in" : ""}
      `}
      style={{ marginLeft: nivel * 25 }}
    >
      <div className="comentario-header">
        <strong>{c.nombre_completo}</strong> – <small>{formatFechaRelativa(c.fecha_comentario)}</small>

        {(user.uid === c.id_usuario || user.isAdmin) && (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleEliminarComentario(c.id_comentario, c.id_usuario)}
          >
            Eliminar
          </button>
        )}
      </div>

      <div className="comentario-body">{c.contenido}</div>

      {user && (
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => setRespuestaA(c.id_comentario)}
        >
          Responder
        </button>
      )}

      {respuestaA === c.id_comentario && (
        <div className={`crear-respuesta fade-in`}>
          <textarea
            value={textoRespuesta}
            onChange={(e) => setTextoRespuesta(e.target.value)}
            placeholder="Escribe una respuesta..."
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleResponderComentario(c.id_comentario)}
          >
            Enviar respuesta
          </button>
          <button className="btn btn-sm btn-light" onClick={() => setRespuestaA(null)}>
            Cancelar
          </button>
        </div>
      )}

      {c.respuestas?.map(r => renderComentario(r, nivel + 1))}
    </div>
  );

  return (
    <div className="post-detail-container">

      {/* Post */}
      <div className="post-detail-card">
        <h1 className="post-detail-title">{post.titulo}</h1>

        <div className="post-detail-meta">
          <div className="post-detail-author">
            <div className="author-avatar-large">{getInitials(post.nombre_completo)}</div>
            <div>
              <div style={{ color: '#ffffff', fontWeight: 600 }}>{post.nombre_completo}</div>
              <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Usuario</div>
            </div>
          </div>
          <div className="post-detail-time">
            <span>🕒</span>
            <span>{formatFechaRelativa(post.fecha_creacion)}</span>
          </div>
        </div>

        <div className="post-detail-content">
          <p>{post.contenido}</p>
        </div>

        {(user?.uid === post.id_usuario || user?.isAdmin) && (
          <button className="btn btn-danger" onClick={eliminarPost}>
            Eliminar Post
          </button>
        )}
      </div>

      {/* Comentarios */}
      <div className="comentarios-section">
        <h3>Comentarios</h3>

        {user && (
          <div className="crear-comentario">
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe tu comentario..."
            />
            <button onClick={handleCrearComentario} className="btn btn-primary">
              Comentar
            </button>
          </div>
        )}

        <div className="comentarios-list">
          {comentarios.map(c => renderComentario(c))}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
