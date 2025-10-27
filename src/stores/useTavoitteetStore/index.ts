import { client } from '@/api/client';
import { components } from '@/api/schema';
import { TypedMahdollisuus } from '@/routes/types';
import { create } from 'zustand';

type Tavoite = components['schemas']['TavoiteDto'];

interface TavoitteetState {
  tavoitteet: Tavoite[];
  setTavoitteet: (state: Tavoite[]) => void;
  upsertTavoite: (tavoite: Tavoite) => void;
  deleteTavoite: (tavoiteId: string) => Promise<void>;
  mahdollisuusDetails: TypedMahdollisuus[];
  setMahdollisuusDetails: (state: TypedMahdollisuus[]) => void;
}

export const useTavoitteetStore = create<TavoitteetState>()((set, get) => ({
  tavoitteet: [],
  mahdollisuusDetails: [],

  setMahdollisuusDetails: (state) => set({ mahdollisuusDetails: state }),

  setTavoitteet: (state) => set({ tavoitteet: state }),
  upsertTavoite: (tavoite) => {
    set((state) => {
      const exists = state.tavoitteet.some((pm) => pm.mahdollisuusId === tavoite.mahdollisuusId);

      return {
        tavoitteet: exists
          ? state.tavoitteet.map((pm) => (pm.mahdollisuusId === tavoite.mahdollisuusId ? { ...tavoite } : pm))
          : [...state.tavoitteet, { ...tavoite }],
      };
    });
  },
  deleteTavoite: async (id: string) => {
    const { error } = await client.DELETE('/api/profiili/tavoitteet/{id}', {
      params: {
        path: { id },
      },
    });

    if (!error) {
      set({
        tavoitteet: get().tavoitteet.filter((pm) => pm.id !== id),
      });
    }
  },
}));
