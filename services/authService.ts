
import { User, Routine } from '../types';
import { getUsuariosPlanilha } from './pfcApi';

const CURRENT_USER_KEY = 'pfc_current_user';

// Administrador mestre (sempre disponível como fallback)
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  password: 'pfc',
  isAdmin: true,
  routines: ['checkin', 'escalacao', 'jogadas', 'partidas', 'resultados', 'scout_anual', 'dashboard', 'usuarios', 'ajuda']
};

/**
 * Realiza o login comparando com os usuários vindos da planilha + administrador mestre.
 */
export const login = async (username: string, password: string): Promise<User | null> => {
  try {
    // 1. Tenta buscar usuários da planilha
    let remoteUsers: User[] = [];
    try {
      remoteUsers = await getUsuariosPlanilha();
    } catch (e) {
      console.warn("Falha ao buscar usuários da planilha. Usando apenas admin local.");
    }
    
    // 2. Cria uma lista de busca que inclui os remotos e o admin local
    // Isso garante que 'admin/pfc' sempre funcione, mesmo que a aba 'usuario' esteja vazia.
    const allAvailableUsers = [...remoteUsers, DEFAULT_ADMIN];
    
    // 3. Procura o usuário (case insensitive para o nome)
    const user = allAvailableUsers.find(u => 
      u.username?.toString().toLowerCase() === username.toLowerCase() && 
      u.password?.toString() === password.toString()
    );

    if (user) {
      // Remove a senha antes de salvar no storage por segurança
      const { password: _, ...userWithoutPass } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPass));
      return userWithoutPass as User;
    }
  } catch (e) {
    console.error("Erro crítico no processo de login:", e);
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const hasPermission = (user: User | null, routine: Routine): boolean => {
  if (!user) return false;
  if (user.isAdmin) return true;
  return user.routines.includes(routine);
};
