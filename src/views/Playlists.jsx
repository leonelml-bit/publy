import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [nombreNueva, setNombreNueva] = useState('');
  const clienteId = localStorage.getItem('cliente_id');

  useEffect(() => { fetchPlaylists(); }, []);

  const fetchPlaylists = async () => {
    const { data } = await supabase
      .from('playlists')
      .select(`*, playlist_items (count)`)
      .eq('cliente_id', clienteId);
    setPlaylists(data || []);
  };

  const eliminarPlaylist = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta playlist? Todas sus configuraciones se perderán.")) {
      await supabase.from('playlists').delete().eq('id', id);
      fetchPlaylists();
    }
  };

  const crearPlaylist = async (e) => {
    e.preventDefault();
    await supabase.from('playlists').insert([{ nombre: nombreNueva, cliente_id: clienteId }]);
    setNombreNueva('');
    fetchPlaylists();
  };

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestor de Playlists</h1>
      </div>

      {/* Formulario de creación */}
      <form onSubmit={crearPlaylist} className="flex gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <input 
          type="text" placeholder="Nombre de la nueva lista (ej: Menú de Hoy)" 
          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={nombreNueva} onChange={(e) => setNombreNueva(e.target.value)}
          required
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200">
          Crear Lista
        </button>
      </form>

      {/* Grid de Playlists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {playlists.map((pl) => {
          const urlPlayer = `${window.location.origin}/player/${pl.id}`;
          
          return (
            <div key={pl.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              
              {/* Encabezado de la Tarjeta */}
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                    <span className="text-2xl">📺</span>
                  </div>
                  <button 
                    onClick={() => eliminarPlaylist(pl.id)}
                    className="text-slate-300 hover:text-red-500 p-2 transition"
                  >
                    ✕
                  </button>
                </div>
                
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{pl.nombre}</h3>
                <p className="text-sm text-slate-500 font-medium">
                  {pl.playlist_items[0]?.count || 0} imágenes en secuencia
                </p>

              {/* Botones de acción al final de la tarjeta */}
              <div className="p-6 pt-0 space-y-2">
                <Link 
                  to={`/dashboard/playlists/${pl.id}`} 
                  className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-bold rounded-xl transition"
                >
                  Configurar Contenido
                </Link>
                <a 
                  href={urlPlayer} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold rounded-xl transition shadow-lg shadow-blue-100"
                >
                  ▶ Lanzar Player
                </a>
              </div>
                {/* Sección del Link (Lo que va dentro) */}
                <div className="mt-6 p-4 bg-slate-900 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Enlace de Reproducción</p>
                  <div className="flex items-center gap-3">
                    <input 
                      readOnly 
                      value={urlPlayer} 
                      className="bg-transparent text-blue-400 text-xs truncate flex-1 font-mono outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(urlPlayer);
                        alert("¡Link copiado al portapapeles!");
                      }}
                      className="text-slate-400 hover:text-white transition text-xs font-bold"
                    >
                      COPIAR
                    </button>
                  </div>
                  
                  {/* QR Code dinámico */}
                  <div className="mt-4 flex justify-center bg-white p-2 rounded-xl">
                    <img 
  src={`https://quickchart.io/qr?text=${encodeURIComponent(urlPlayer)}&size=200`} 
  alt="QR"
  className="w-32 h-32"
/>
                  </div>
                  
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}