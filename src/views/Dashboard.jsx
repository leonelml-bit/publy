import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Biblioteca from './Biblioteca';
import Playlists from './Playlists';
import ConfigurarPlaylist from './ConfigurarPlaylist';
import MarcaConfig from '../components/MarcaConfig';

export default function Dashboard() {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('cliente_id');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800 text-blue-400">
          PubliciTV
        </div>
        
<MarcaConfig />
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard/biblioteca" className="block p-3 hover:bg-gray-800 rounded transition">📁 Biblioteca</Link>
          <Link to="/dashboard/playlists" className="block p-3 hover:bg-gray-800 rounded transition">📺 Playlists</Link>
          <Link to="/dashboard/pantallas" className="block p-3 hover:bg-gray-800 rounded transition">📡 Pantallas</Link>
        </nav>
        <button onClick={cerrarSesion} className="p-4 bg-red-900 hover:bg-red-800 text-sm font-bold transition">
          Cerrar Sesión
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto p-8">
        <Routes>
            <Route path="playlists/:id" element={<ConfigurarPlaylist />} />
            <Route path="biblioteca" element={<Biblioteca />} />
            <Route path="playlists" element={<Playlists />} />
          <Route path="biblioteca" element={<h1 className="text-2xl font-bold">Mis Imágenes</h1>} />
          <Route path="playlists" element={<h1 className="text-2xl font-bold">Gestión de Playlists</h1>} />
          <Route path="pantallas" element={<h1 className="text-2xl font-bold">Estado de las TVs</h1>} />
          <Route path="/" element={<h1 className="text-2xl font-bold text-gray-400 text-center mt-20">Selecciona una opción del menú</h1>} />
        </Routes>
      </div>
    </div>
  );
}