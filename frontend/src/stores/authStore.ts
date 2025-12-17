import { create } from 'zustand';
import type { User, TeamMembership } from '@/types/user.types';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  currentTeam: TeamMembership | null;
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setCurrentTeam: (teamId: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  currentTeam: null,

  setUser: (user) => {
    setStorageItem('USER', user);
    set({ user, isAuthenticated: true });
    
    // Auto-select first team if available
    if (user.teams && user.teams.length > 0) {
      const currentTeamId = getStorageItem<string>('CURRENT_TEAM_ID');
      const team = currentTeamId 
        ? user.teams.find(t => t.teamId === currentTeamId) 
        : user.teams[0];
      
      if (team) {
        get().setCurrentTeam(team.teamId);
      }
    }
  },

  setToken: (token) => {
    setStorageItem('TOKEN', token);
    set({ token });
  },

  setCurrentTeam: (teamId) => {
    const { user } = get();
    if (!user || !user.teams) return;

    const team = user.teams.find(t => t.teamId === teamId);
    if (team) {
      setStorageItem('CURRENT_TEAM_ID', teamId);
      set({ currentTeam: team });
    }
  },

  logout: () => {
    removeStorageItem('TOKEN');
    removeStorageItem('USER');
    removeStorageItem('CURRENT_TEAM_ID');
    set({ user: null, token: null, isAuthenticated: false, currentTeam: null });
  },

  initAuth: () => {
    console.log('🔄 Initializing auth...');
    const token = getStorageItem<string>('TOKEN');
    const user = getStorageItem<User>('USER');
    console.log('📦 Token from storage:', token ? 'exists' : 'null');
    console.log('👤 User from storage:', user ? user.name : 'null');

    if (token && user) {
      set({ token, user, isAuthenticated: true, isInitialized: true });
      console.log('✅ Auth restored successfully');
      
      // Restore current team
      if (user.teams && user.teams.length > 0) {
        const currentTeamId = getStorageItem<string>('CURRENT_TEAM_ID');
        const team = currentTeamId 
          ? user.teams.find(t => t.teamId === currentTeamId) 
          : user.teams[0];
        
        if (team) {
          set({ currentTeam: team });
          console.log('🏆 Current team set:', team.teamName);
        }
      }
    } else {
      console.log('❌ No auth data found in storage');
      set({ isInitialized: true });
    }
  },
}));
