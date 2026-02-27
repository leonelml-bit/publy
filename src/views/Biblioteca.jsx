import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Biblioteca() {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const clienteId = localStorage.getItem('cliente_id');
const [previewUrl, setPreviewUrl] = useState(null);
const [subiendo, setSubiendo] = useState(false);
const [progreso, setProgreso] = useState(0);
  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', precio: ''  });
  const [file, setFile] = useState(null);

  // Cargar imágenes al iniciar
  useEffect(() => {
    fetchImagenes();
  }, []);

  const fetchImagenes = async () => {
    const { data } = await supabase
      .from('imagenes_biblioteca')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });
    setImagenes(data || []);
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFile(file); // El estado que ya tenías para el archivo
    
    // Generar la URL temporal para la miniatura
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }
};

const limpiarSubida = () => {
  setFile(null);
  setPreviewUrl(null);
  // reset de otros campos...
};
  const handleSubidav = async (e) => {
    e.preventDefault();
    if (!file) return alert("Selecciona una imagen");
    setLoading(true);

    try {
      // 1. Subir a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${clienteId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

      // 3. Guardar en BD
      const { error: dbError } = await supabase
        .from('imagenes_biblioteca')
        .insert([{
          cliente_id: clienteId,
          url_imagen: publicUrl,
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          precio: formData.precio
        }]);

      if (dbError) throw dbError;

      alert("¡Imagen añadida a tu biblioteca!");
      setFormData({ titulo: '', descripcion: '', precio: ''  });
      fetchImagenes();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
const handleSubida = async (e) => {
  e.preventDefault();
  if (!file) return;

  setSubiendo(true);
  setProgreso(10); // Empezamos con un 10% para que se vea movimiento

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${clienteId}/${fileName}`;

    // SUBIDA A STORAGE
    const { error: uploadError } = await supabase.storage
      .from('content')
      .upload(filePath, file, {
        upsert: true,
        // Algunos navegadores soportan el progreso nativo de Supabase
      });

    if (uploadError) throw uploadError;

    setProgreso(50); // Subida completada, ahora procesando URL

    const { data: { publicUrl } } = supabase.storage
      .from('content')
      .getPublicUrl(filePath);

    // INSERT EN BASE DE DATOS
    const { error: dbError } = await supabase
      .from('imagenes_biblioteca')
      .insert([{
        cliente_id: clienteId,
        url_imagen: publicUrl,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        precio: formData.precio
      }]);

    if (dbError) throw dbError;

    setProgreso(100);
    await fetchImagenes();
    setTimeout(() => {
      resetearFormulario();
      setSubiendo(false);
      setProgreso(0);
      setPreviewUrl(null);
      // Aquí podrías cerrar el modal o limpiar el formulario
    }, 500);

  } catch (error) {
    alert("Error al subir: " + error.message);
    setSubiendo(false);
    setProgreso(0);
  }
};
const resetearFormulario = () => {
  setFormData({ titulo: '', descripcion: '', precio: '' }); // Limpia textos
  setFile(null);          // Borra el archivo
  setPreviewUrl(null);    // Quita la miniatura
  setProgreso(0);         // Reinicia barra
  setSubiendo(false);     // Desbloquea botón
  
  // Opcional: Si usas un input tipo file con ref, puedes resetearlo también
  document.getElementById('file-input').value = ""; 
};
const borrarImagen = async (img) => {
  const confirmar = confirm("¿Estás seguro de eliminar esta imagen? También se quitará de las playlists donde aparezca.");
  
  if (confirmar) {
    try {
      // 1. Extraer el nombre del archivo de la URL
      // La URL suele ser: .../storage/v1/object/public/content/cliente_id/nombre.jpg
      const urlParts = img.url_imagen.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${clienteId}/${fileName}`;

      // 2. Borrar del Storage
      const { error: storageError } = await supabase.storage
        .from('content')
        .remove([filePath]);

      if (storageError) console.error("Error al borrar archivo físico:", storageError);

      // 3. Borrar de la Base de Datos (La tabla)
      // Nota: Si configuraste "ON DELETE CASCADE" en la tabla playlist_items, se borrará de las listas automáticamente.
      const { error: dbError } = await supabase
        .from('imagenes_biblioteca')
        .delete()
        .eq('id', img.id);

      if (dbError) throw dbError;

      // 4. Refrescar la vista
      fetchImagenes();
      alert("Imagen eliminada con éxito");

    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  }
};
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Mi Biblioteca de Medios</h1>
      </div>

      {/* Formulario de Carga */}
      <form onSubmit={handleSubida} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
     <div className="flex flex-col items-center justify-center w-full">
  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition">
    <div className="flex flex-col items-center justify-center pt-5 pb-6">
      <span className="text-3xl mb-2">📸</span>
      <p className="text-sm text-slate-500">Haz clic para elegir una imagen</p>
    </div>
    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
  </label>

  {/* MINIATURA DE PRE-VISUALIZACIÓN */}
  {previewUrl && (
    <div className="mt-4 w-full animate-fadeIn">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Vista previa antes de subir:</p>
      <div className="relative group w-full h-40 rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
        
        {/* Botón para quitar la selección si se arrepiente */}
        <button 
          onClick={() => { setFile(null); setPreviewUrl(null); }}
          className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md"
        >
          ✕
        </button>
      </div>
    </div>
    
  )}
  {subiendo && (
  <div className="mt-6 w-full">
    <div className="flex justify-between mb-2">
      <span className="text-xs font-black text-blue-600 uppercase tracking-widest animate-pulse">
        Subiendo a la nube...
      </span>
      <span className="text-xs font-bold text-slate-400">{progreso}%</span>
    </div>
    
    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 shadow-inner">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
        style={{ width: `${progreso}%` }}
      />
    </div>
    
    <p className="text-[10px] text-slate-400 text-center mt-2 italic">
      No cierres esta ventana, estamos optimizando tu contenido.
    </p>
  </div>
)}
</div>

        <div className="space-y-3">
          <input type="text" placeholder="Título (ej: Gran Hamburguesa)" className="w-full p-3 border rounded-xl"
            value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} />
          <textarea placeholder="Descripción corta de la oferta..." className="w-full p-3 border rounded-xl h-24"
            value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />
          <input type="text" placeholder="Precio (ej: $9.99)" className="w-full p-3 border rounded-xl font-bold text-blue-600"
            value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} />
          <button
  type="submit"
  disabled={subiendo || !file}
  className={`w-full py-4 rounded-xl font-bold transition-all ${
    subiendo 
      ? 'bg-slate-400 cursor-not-allowed' 
      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
  }`}
>
  {subiendo ? `Guardando (${progreso}%)` : 'Publicar en Biblioteca'}
</button>
        </div>
      </form>

      {/* Galería de Medios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {imagenes.map((img) => (
          <div key={img.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 group relative">
          <button  onClick={(e) => { e.stopPropagation(); borrarImagen(img); }}
          className="absolute top-3 right-3 z-10 bg-red-500/90 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-opacity group-hover:opacity-100"
          title="Eliminar imagen"  >

    <span className="text-xs">🗑️</span>
  </button>
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        {img.url_imagen ? (
          <img 
            src={img.url_imagen} 
            alt={img.titulo} 
            className="w-full h-48 object-cover"
            onError={(e) => console.log("Error cargando esta URL:", img.url_imagen)}
          />
        ) : (
          <span className="text-red-500">URL no encontrada en el objeto</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-slate-800">{img.titulo}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">{img.descripcion}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-blue-600 font-bold">{img.precio}</span>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-400">{img.efecto_sugerido}</span>
        </div>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}