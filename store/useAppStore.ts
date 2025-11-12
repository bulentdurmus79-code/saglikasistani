
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FamilyGroup, Profile, Role, Task, AppSettings } from '../types';

interface AppState {
  familyGroup: FamilyGroup | null;
  currentUserId: string | null;
  settings: AppSettings;
  isSetupComplete: boolean;
  
  initialize: (group: FamilyGroup, userId: string) => void;
  setCurrentUserId: (userId: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  addProfile: (profile: Profile) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;

  importFamilyGroup: (group: FamilyGroup) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      familyGroup: null,
      currentUserId: null,
      isSetupComplete: false,
      settings: {
        theme: 'system',
        fontSize: 'base',
        hapticFeedback: true,
      },

      initialize: (group, userId) => set({ familyGroup: group, currentUserId: userId, isSetupComplete: true }),
      setCurrentUserId: (userId) => set({ currentUserId: userId }),
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      addProfile: (profile) => set((state) => {
        if (!state.familyGroup) return {};
        return {
          familyGroup: {
            ...state.familyGroup,
            profiles: [...state.familyGroup.profiles, profile],
          },
        };
      }),
      addTask: (task) => set((state) => {
        if (!state.familyGroup) return {};
        return {
          familyGroup: {
            ...state.familyGroup,
            tasks: [...state.familyGroup.tasks, task],
          },
        };
      }),
      updateTask: (taskId, updatedTask) => set((state) => {
        if (!state.familyGroup) return {};
        return {
          familyGroup: {
            ...state.familyGroup,
            tasks: state.familyGroup.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t),
          },
        };
      }),
      deleteTask: (taskId) => set((state) => {
        if (!state.familyGroup) return {};
        return {
          familyGroup: {
            ...state.familyGroup,
            tasks: state.familyGroup.tasks.filter(t => t.id !== taskId),
          },
        };
      }),
      importFamilyGroup: (group) => set({ familyGroup: group, isSetupComplete: false }), // Force user to pick their profile after import
      reset: () => set({ familyGroup: null, currentUserId: null, isSetupComplete: false }),
    }),
    {
      name: 'smart-health-assistant-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
