
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { Lock, User, LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { ToastType } from '../types';

interface LoginPageProps {
  onToast: (text: string, type: ToastType) => void;
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onToast, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await login(username, password);
      if (user) {
        onLogin();
        onToast(`Bem-vindo, ${user.username}!`, ToastType.SUCCESS);
        navigate('/');
      } else {
        onToast('Usuário ou senha incorretos.', ToastType.ERROR);
      }
    } catch (err) {
      onToast('Erro de conexão com a planilha.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b2340] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
        <img src="https://i.imgur.com/ExEJtwR.png" alt="" className="w-96 h-96 object-contain" />
      </div>

      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-10 space-y-8 animate-in zoom-in-95 duration-500 relative z-10">
        <div className="text-center space-y-2">
          <div className="bg-[#0b2340] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl mb-4">
            <img src="https://i.imgur.com/ExEJtwR.png" alt="PFC" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-[#0b2340] uppercase tracking-tighter">Acesso Restrito</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Sincronizado com Planilha Google</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                required
                disabled={loading}
                type="text"
                placeholder="USUÁRIO"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#0b2340] text-sm font-black uppercase transition-all disabled:opacity-50 text-black placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                required
                disabled={loading}
                type="password"
                placeholder="SENHA"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#0b2340] text-sm font-black uppercase transition-all disabled:opacity-50 text-black placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#0b2340] text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-blue-900 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
            {loading ? 'AUTENTICANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-700 font-black uppercase leading-relaxed">
            As credenciais são gerenciadas diretamente na aba "usuario" da planilha oficial do PFC.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
