import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Player() {
  const [hora, setHora] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const { playlistId } = useParams();
  const [items, setItems] = useState([]);
  const [playlist, setPlaylist] = useState(null); // Esto debe actualizarse
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [cliente, setCliente] = useState(null);

  const goFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    setFullScreen(true);
  };

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => {
      setHora(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Carga de Datos
  useEffect(() => {
    const obtenerTodo = async () => {
      try {
        // 1. Traer la Playlist
        const { data: plData, error: plError } = await supabase
          .from('playlists')
          .select('*')
          .eq('id', playlistId)
          .single();

        if (plError) throw plError;
        setPlaylist(plData); // <--- IMPORTANTE: Guardamos la playlist en el estado

        // 2. Traer los Items
        const { data: itemsData, error: itemsError } = await supabase
          .from('playlist_items')
          .select('*, imagenes_biblioteca(*)')
          .eq('playlist_id', playlistId)
          .order('orden', { ascending: true });

        if (itemsError) throw itemsError;
        setItems(itemsData);

        // 3. Traer los datos del Cliente
        const { data: clienteData, error: clError } = await supabase
          .from('clientes')
          .select('nombre_empresa, logo_url')
          .eq('id', plData.cliente_id) 
          .maybeSingle();

        if (clError) throw clError;
        setCliente(clienteData);

      } catch (error) {
        console.error("Fallo total en carga:", error.message);
      }
    };

    if (playlistId) obtenerTodo();
  }, [playlistId]);

  // Carrusel
  useEffect(() => {
    if (items.length > 0) {
      const duracion = (items[currentIndex]?.duracion_segundos || 10) * 1000;
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, duracion);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, items]);

  // Pantalla de carga si no hay datos
  if (!playlist || items.length === 0) {
    return <div className="bg-black h-screen flex items-center justify-center text-white font-black tracking-widest animate-pulse">CARGANDO PUBLY...</div>;
  }

  const itemActual = items[currentIndex];
  const imgData = itemActual.imagenes_biblioteca;
  const colorFondo = itemActual.color_fondo || '#000000';

  return (
    <div 
      className="h-screen w-screen overflow-hidden relative flex items-center justify-center transition-colors duration-1000"
      style={{ backgroundColor: colorFondo }}
    >
      {/* CAPA DE FULLSCREEN OVERLAY */}
      {!fullScreen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <button 
            onClick={goFullScreen}
            className="bg-blue-600 text-white px-10 py-5 rounded-full text-2xl font-black shadow-2xl hover:scale-110 active:scale-95 transition"
          >
            PONER EN PANTALLA COMPLETA 📺
          </button>
        </div>
      )}

      {/* BARRA SUPERIOR (RELOJ + LOGO) */}
      <div className="absolute top-8 left-12 z-50 flex items-center gap-6 bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
        {cliente?.logo_url ? (
          <img 
            src={cliente.logo_url} 
            className="h-14 w-auto object-contain drop-shadow-lg" 
            alt="Logo" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="text-white font-black text-xl italic tracking-tighter">
            {cliente?.nombre_empresa || 'PublY'}
          </span>
        )}
      </div>

      <div className="absolute top-8 right-12 z-50 flex items-center gap-4 bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex flex-col items-end pr-6">
          <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
            {hora}
          </span>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
            En Vivo
          </span>
        </div>
</div>

      {/* CONTENEDOR DE LA IMAGEN (70%) */}
      <div className="relative w-[70%] h-[70%] shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden border-8 border-white/5">
        <img 
          key={`img-${currentIndex}`}
          src={imgData?.url_imagen} 
          className={`w-full h-full object-cover img-${itemActual.efecto_imagen}`} 
        />
      </div>

      {/* CAPA DE TEXTOS */}
      <div className="absolute inset-0 p-20 flex flex-col justify-between pointer-events-none">
        
        {/* TÍTULO ARRIBA */}
        <div key={`title-${currentIndex}`} className="txt-entrada-derecha text-center">
          <h1 className="text-7xl font-black text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] uppercase tracking-tighter italic">
            {imgData?.titulo}
          </h1>
        </div>

        {/* DESCRIPCIÓN Y PRECIO ABAJO */}
        <div key={`info-${currentIndex}`} className="txt-entrada-abajo flex flex-col items-center gap-6">
          {imgData?.descripcion && (
            <p className="text-3xl text-gray-100 font-medium bg-black/30 px-6 py-2 rounded-full backdrop-blur-sm shadow-lg">
              {imgData.descripcion}
            </p>
          )}
          
          {imgData?.precio && (
            <div className="bg-yellow-400 text-black text-7xl font-black px-10 py-4 rounded-2xl shadow-2xl transform -rotate-2 border-b-8 border-yellow-600">
              {imgData.precio}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}