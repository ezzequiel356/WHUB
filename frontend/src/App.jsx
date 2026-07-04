import { Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import Catalogo from './components/Catalogo.jsx';
import WarframePage from './components/warframe/WarframePage.jsx';
import Login from './components/Login.jsx';
import Perfil from './components/Perfil.jsx';
import PerfilAjeno from './components/PerfilAjeno.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/warframe/:nombre" element={<WarframePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Login />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/perfil/:username" element={<PerfilAjeno />} />
    </Routes>
  );
}

export default App;