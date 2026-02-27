import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Registro() {
  const [formData, setFormData] = useState({ empresa: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('clientes')
      .insert([{ 
        nombre_empresa: formData.empresa, 
        email: formData.email, 
        password: formData.password 
      }]);

    if (!error) {
      alert("¡Cuenta de PublY creada! Ahora inicia sesión.");
      navigate('/');
    } else {
      alert("Error al registrar: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <div className="w-full max-w-md p-8 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Únete a PublY</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Empieza a proyectar en minutos</p>

        <form onSubmit={handleRegistro} className="space-y-4">
          <input 
            type="text" placeholder="Nombre de tu Negocio" 
            className="w-full p-3 rounded-xl bg-[#0f172a] text-white border border-slate-600 focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, empresa: e.target.value})}
            required
          />
          <input 
            type="email" placeholder="Correo Electrónico" 
            className="w-full p-3 rounded-xl bg-[#0f172a] text-white border border-slate-600 focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input 
            type="password" placeholder="Crea una Contraseña" 
            className="w-full p-3 rounded-xl bg-[#0f172a] text-white border border-slate-600 focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all">
            Crear mi cuenta gratis
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-slate-400 hover:text-white text-sm">
            ¿Ya tienes cuenta? <span className="text-blue-400">Inicia sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}