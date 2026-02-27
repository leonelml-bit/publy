import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ConfigurarPlaylist() {
  const { id } = useParams(); // El ID de la playlist
  const [playlist, setPlaylist] = useState(null);
  const [biblioteca, setBiblioteca] = useState([]);
  const [items, setItems] = useState([]);
  const clienteId = localStorage.getItem('cliente_id');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    // 1. Nombre de la playlist
    const { data: pl } = await supabase.from('playlists').select('*').eq('id', id).single();
    setPlaylist(pl);

    // 2. Toda mi biblioteca
    const { data: bib } = await supabase.from('imagenes_biblioteca').select('*').eq('cliente_id', clienteId);
    setBiblioteca(bib || []);

    // 3. Items ya agregados a esta playlist
    const { data: it } = await supabase
      .from('playlist_items')
      .select('*, imagenes_biblioteca(*)')
      .eq('playlist_id', id)
      .order('orden', { ascending: true });
    setItems(it || []);
  };

  const agregarALista = async (img) => {
    const nuevoOrden = items.length + 1;
    await supabase.from('playlist_items').insert([
      { playlist_id: id, imagen_id: img.id, orden: nuevoOrden }
    ]);
    cargarDatos();
  };

  const eliminarDeLista = async (itemId) => {
    await supabase.from('playlist_items').delete().eq('id', itemId);
    cargarDatos();
  };
  const actualizarItem = async (itemId, cambios) => {
  const { error } = await supabase
    .from('playlist_items')
    .update(cambios)
    .eq('id', itemId);
  
  if (error) {
    console.error("Error actualizando:", error);
  } else {
    // Opcional: podrías recargar los datos, pero si usas el estado local es más rápido
    setItems(prevItems => 
      prevItems.map(item => item.id === itemId ? { ...item, ...cambios } : item)
    );
  }
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/dashboard/playlists" className="text-blue-600 font-medium">← Volver</Link>
        <h1 className="text-2xl font-bold">Editando: <span className="text-blue-600">{playlist?.nombre}</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LADO IZQUIERDO: BIBLIOTECA */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
          <h2 className="font-bold mb-4 text-slate-700">Tus Medios (Toca para añadir)</h2>
          <div className="grid grid-cols-2 gap-3">
            {biblioteca.map(img => (
              <div 
                key={img.id} 
                onClick={() => agregarALista(img)}
                className="cursor-pointer group relative rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition"
              >
                <img src={img.url_imagen} className="h-32 w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">+</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: ORDEN DE LA PLAYLIST */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-bold mb-4 text-slate-700">Secuencia de Reproducción</h2>
          <div className="space-y-3">
        // Dentro de tu .map de items en ConfigurarPlaylist.jsx
{items.map((item, index) => (
  <div key={item.id} className="p-4 bg-white border rounded-xl shadow-sm space-y-3">
    <div className="flex items-center gap-4">
      <img src={item.imagenes_biblioteca.url_imagen} className="w-20 h-14 object-cover rounded" />
      <div className="flex-1">
        <h3 className="font-bold">{item.imagenes_biblioteca.titulo}</h3>
        <input 
          type="number" 
          defaultValue={item.duracion_segundos}
          onChange={(e) => actualizarItem(item.id, { duracion_segundos: e.target.value })}
          className="w-16 p-1 border rounded text-xs"
        /> seg.
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-2 text-xs">
      <select 
        onChange={(e) => actualizarItem(item.id, { efecto_imagen: e.target.value })}
        className="p-2 bg-slate-50 border rounded"
        defaultValue={item.efecto_imagen}
      >
        <option value="zoom">Imagen: Zoom</option>
        <option value="fade">Imagen: Desvanecer</option>
      </select>
      
      <select 
        onChange={(e) => actualizarItem(item.id, { efecto_texto: e.target.value })}
        className="p-2 bg-slate-50 border rounded"
        defaultValue={item.efecto_texto}
      >
        <option value="entrada-abajo">Texto: ↑ Sube</option>
        <option value="entrada-arriba">Texto: ↓ Baja</option>
        <option value="entrada-derecha">Texto: ← Izquierda</option>
        <option value="entrada-izquierda">Texto: → Derecha</option>
        <option value="desvanecer">Texto: Desvanecer</option>
      </select>
    </div>
    {/* Dentro del map de items en la configuración, añade este campo: */}
<div className="flex flex-col gap-1">
  <label className="text-[10px] font-bold text-slate-400 uppercase">Color de Fondo</label>
  <div className="flex items-center gap-2">
    <input 
      type="color" 
      defaultValue={item.color_fondo}
      onChange={(e) => actualizarItem(item.id, { color_fondo: e.target.value })}
      className="w-full h-10 border-none rounded cursor-pointer"
    />
  </div>
</div>
  </div>
))}
            {items.length === 0 && (
              <p className="text-center text-slate-400 py-10">La lista está vacía. Añade algo desde la izquierda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}