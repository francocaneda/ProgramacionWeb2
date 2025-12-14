import { Routes, Route } from "react-router-dom";
import Login from "./login/login";
import RegisUser from "./regis-user/regis-user";
import PasswordRecup from "./password-recup/password-recup";
import PasswordReset from './password-reset/password-reset';
import IndexForo from "./index-foro/index-foro";
import MainLayout from "./main-layout/main-layout";
import ProtectedRoute from "./components/ProtectedRoute"; 
import ForumCategories from "./category/category"; 
import CreatePost from './create-post/create-post';
import Profile from "./profile/profile";
import AdminPanel from "./admin/AdminPanel";


// 🚀 IMPORTAR POST LIST Y POST DETAIL
import PostList from "./post-list/post-list";
import PostDetail from "./post-detail/post-detail";

export default function AppRoutes() {
  return (
    <Routes>

      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<Login />} />
      <Route path="/registrarte" element={<RegisUser />} />
      <Route path="/password-recup" element={<PasswordRecup />} />
      <Route path="/password-reset" element={<PasswordReset />} />

      {/* RUTAS PROTEGIDAS */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>

          {/* HOME DEL FORO */}
          <Route path="/foro" element={<IndexForo />} />

          {/* PERFIL */}
          <Route path="/main-layout/profile" element={<Profile />} />

          {/* CATEGORÍAS */}
          <Route path="/main-layout/categorias" element={<ForumCategories />} />
          <Route path="/main-layout/categorias/:id" element={<ForumCategories />} />

          {/* LISTA DE POSTS POR CATEGORÍA */}
          <Route path="/main-layout/post-list/:id" element={<PostList />} />

          {/* DETALLE DE POST */}
          <Route path="/main-layout/post-detail/:id_post" element={<PostDetail />} />

          {/* CREAR POST */}
          <Route path="/main-layout/create-post" element={<CreatePost />} />

          {/* PANEL ADMIN */}
          <Route path="/main-layout/admin" element={<AdminPanel />} />


        </Route>
      </Route>

    </Routes>
  );
}
