
import React, { useState, useEffect } from 'react';
import { getUsuariosPlanilha, saveUsuarioPlanilha, deleteUsuarioPlanilha } from '../services/pfcApi';
import { User, Routine, ToastType } from '../types';
import { Users, UserPlus, Trash2, Shield, Check, X, ShieldAlert, Key, RefreshCw } from 'lucide-react';

interface UserManagementPageProps {
  onToast: (text: string, type: ToastType) => void;
}

const ROUTINES_LIST: { id: Routine; label: string }[] = [
  { id: 'checkin', label: 'Check-in Atletas' },
  { id: 'escalacao', label: 'Painel Escalação' },
  { id: 'jogadas', label: 'Lançar Jogadas' },
  { id: 'partidas', label: 'Lançar Partidas' },
  { id: 'resultados', label: 'Ver Resultados' },
  { id: 'dashboard', label: 'Dashboard Anual' },
  { id: 'usuarios', label: 'Gestão de Acessos' }
];

const UserManagementPage: React.FC<UserManagementPageProps> = ({ onToast }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    password: '',
    isAdmin: false,
    routines: []
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsuariosPlanilha();
      setUsers(data);
    } catch (e) {
      onToast('Erro ao carregar usuários da planilha.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = async () => {
    if (!newUser.username || !newUser.password) {
      onToast('Preencha usuário e senha.', ToastType.ERROR);
      return;
    }

    setLoading(true);
    try {
      const userToSave: User = {
        id: newUser.id || Math.random().toString(36).substr(2, 9),
        username: newUser.username,
        password: newUser.password,
        isAdmin: newUser.isAdmin || false,
        routines: newUser.isAdmin ? ROUTINES_LIST.map(r => r.id) : (newUser.routines || [])
      };

      await saveUsuarioPlanilha(userToSave);
      onToast('Usuário sincronizado com a planilha!', ToastType.SUCCESS);
      setIsAdding(false);
      setNewUser({ username: '', password: '', isAdmin: false, routines: [] });
      loadUsers();
    } catch (e) {
      onToast('Erro ao salvar na planilha.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'admin-001') {
      onToast('Impossível remover o Administrador padrão do sistema.', ToastType.ERROR);
      return;
    }
    
    setLoading(true);
    try {
      await deleteUsuarioPlanilha(id);
      onToast('Usuário removido da planilha.', ToastType.SUCCESS);
      loadUsers();
    } catch (e) {
      onToast('Erro ao deletar usuário.', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoutine = (routineId: Routine) => {
    setNewUser(prev => {
      const current = prev.routines || [];
      if (current.includes(routineId)) {
        return { ...prev, routines: current.filter(r => r !== routineId) };
      } else {
        return { ...prev, routines: [...current, routineId] };
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-[#0b2340] uppercase tracking-tighter">Gestão de Acessos</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest italic">Fonte: Planilha Google (aba usuario)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadUsers} className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-[#0b2340] transition-all">
            <RefreshCw className={`w-5 h-5 ${loading && !isAdding ? 'animate-spin' : ''}`} />
          </button>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="px-6 py-4 bg-[#0b2340] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-blue-900 transition-all"
            >
              <UserPlus className="w-4 h-4" /> Novo Usuário
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 space-y-8 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome de Usuário</label>
              <input 
                type="text"
                value={newUser.username}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#0b2340] outline-none font-bold"
                placeholder="EX: ORGANIZADOR_PFC"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Senha de Acesso</label>
              <input 
                type="password"
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#0b2340] outline-none font-bold"
                placeholder="******"
              />
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#0b2340] uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Rotinas e Permissões
                </h4>
                <button 
                  onClick={() => setNewUser(prev => ({ ...prev, isAdmin: !prev.isAdmin }))}
                  className={`px-4 py-1 rounded-full text-[9px] font-black uppercase transition-all ${newUser.isAdmin ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'}`}
                >
                  Modo Administrador {newUser.isAdmin ? 'ON' : 'OFF'}
                </button>
             </div>
            
            {!newUser.isAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in">
                {ROUTINES_LIST.map(routine => (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => toggleRoutine(routine.id)}
                    className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                      newUser.routines?.includes(routine.id)
                        ? 'border-[#0b2340] bg-blue-50 text-[#0b2340]'
                        : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-tight">{routine.label}</span>
                    {newUser.routines?.includes(routine.id) ? <Check className="w-4 h-4" /> : <X className="w-3 h-3 opacity-20" />}
                  </button>
                ))}
              </div>
            )}
            {newUser.isAdmin && (
               <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200 text-yellow-800 text-xs font-bold uppercase text-center">
                  O Administrador possui acesso automático a todas as rotinas do sistema.
               </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-5 bg-[#0b2340] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? 'SINCRONIZANDO...' : 'SALVAR NA PLANILHA'}
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="px-8 py-5 bg-gray-100 text-gray-400 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0b2340] text-white text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">Usuário</th>
              <th className="px-8 py-6">Nível</th>
              <th className="px-8 py-6">Rotinas Ativas</th>
              <th className="px-8 py-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 && !loading ? (
               <tr>
                 <td colSpan={4} className="p-20 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">Nenhum usuário cadastrado na planilha</td>
               </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#0b2340] font-black shadow-inner uppercase">
                        {user.username.charAt(0)}
                      </div>
                      <span className="font-black text-gray-900 uppercase">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {user.isAdmin ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[9px] font-black uppercase border border-yellow-200 flex items-center gap-1 w-fit">
                        <ShieldAlert className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase border border-blue-200 w-fit block">
                        Operador
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {user.routines.map(r => (
                        <span key={r} className="text-[8px] font-black bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100 uppercase">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {user.username.toLowerCase() !== 'admin' ? (
                      <button 
                        disabled={loading}
                        onClick={() => handleDelete(user.id)}
                        className="p-3 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <span title="Protegido pelo sistema" className="flex justify-center">
                        <Shield className="w-5 h-5 text-gray-200" />
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
