import { create } from 'zustand';
import type { Home } from '@conviviapp/shared';

interface HomeState {
  currentHome: Home | null;
  homes: Home[];

  setCurrentHome: (home: Home | null) => void;
  setHomes: (homes: Home[]) => void;
  addHome: (home: Home) => void;
  updateHome: (id: string, data: Partial<Home>) => void;
  removeHome: (id: string) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  currentHome: null,
  homes: [],

  setCurrentHome: (currentHome) => set({ currentHome }),

  setHomes: (homes) => set({ homes }),

  addHome: (home) =>
    set((state) => ({
      homes: [...state.homes, home],
    })),

  updateHome: (id, data) =>
    set((state) => ({
      homes: state.homes.map((h) => (h.id === id ? { ...h, ...data } : h)),
      currentHome:
        state.currentHome?.id === id
          ? { ...state.currentHome, ...data }
          : state.currentHome,
    })),

  removeHome: (id) =>
    set((state) => ({
      homes: state.homes.filter((h) => h.id !== id),
      currentHome: state.currentHome?.id === id ? null : state.currentHome,
    })),
}));
