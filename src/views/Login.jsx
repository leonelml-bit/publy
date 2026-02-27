import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (data) {
      localStorage.setItem('cliente_id', data.id);
      navigate('/dashboard');
    } else {
      alert("Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <div className="w-full max-w-md p-8 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white tracking-tighter italic">
            Publ<span className="text-blue-500 font-bold">Y</span>
          </h1>
          <p className="text-slate-400 mt-2">Publicidad inteligente para tus pantallas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-3 rounded-xl bg-[#0f172a] text-white border border-slate-600 focus:border-blue-500 outline-none transition"
              placeholder="tu@email.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">Contraseña</label>
            <input 
              type="password" 
              className="w-full p-3 rounded-xl bg-[#0f172a] text-white border border-slate-600 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-1">
            Entrar a mi Panel
          </button>
        </form>

        <div className="mt-8 flex flex-col space-y-3 text-center">
          <Link to="/registro" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            ¿No tienes cuenta? <span className="underline italic">Regístrate aquí</span>
          </Link>
          <a href="#" className="text-slate-500 hover:text-slate-400 text-xs">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
}