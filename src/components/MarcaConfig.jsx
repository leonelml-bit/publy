import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function MarcaConfig() {
  const [logo, setLogo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const clienteId = localStorage.getItem('cliente_id');

  const manejarLogo = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setSubiendo(true);
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${clienteId}_${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // 1. Subir al Storage
    const { error: uploadError } = await supabase.storage
      .from('content')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw new Error("Error Storage: " + uploadError.message);

    // 2. Obtener URL Pública
    const { data: { publicUrl } } = supabase.storage
      .from('content')
      .getPublicUrl(filePath);

    // 3. ACTUALIZAR BASE DE DATOS
    const { data, error: dbError } = await supabase
      .from('clientes')
      .update({ logo_url: publicUrl }) // <--- Verifica que el nombre de columna sea este
      .eq('id', clienteId)
      .select(); // El select() ayuda a confirmar que se hizo el cambio

    if (dbError) throw new Error("Error BD: " + dbError.message);

    // 4. ACTUALIZAR ESTADO LOCAL (Para que se vea el cambio sin recargar)
    setLogo(publicUrl);
    alert("¡Imagen de marca guardada en la base de datos!");

  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    setSubiendo(false);
  }
};
  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 mb-6">
      <h2 className="text-white font-bold text-sm mb-4 uppercase tracking-widest text-slate-400">Identidad Visual</h2>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
          {logo ? (
            <img src={logo} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl">🏢</span>
          )}
        </div>
        
        <div className="flex-1">
          <label className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition inline-block">
            {subiendo ? "Subiendo..." : "Cambiar Logo"}
            <input type="file" className="hidden" onChange={manejarLogo} accept="image/*" disabled={subiendo} />
          </label>
          <p className="text-[10px] text-slate-500 mt-2">PNG transparente recomendado</p>
        </div>
      </div>
    </div>
  );
}