import { client } from '@/api/client';
import type { components } from '@/api/schema';
import type { TypedMahdollisuus } from '@/routes/types';
import { create } from 'zustand';

type Paamaara = components['schemas']['PaamaaraDto'];

interface PaamaaratState {
  paamaarat: Paamaara[];
  setPaamaarat: (state: Paamaara[]) => void;
  upsertPaamaara: (paamaara: Paamaara) => void;
  deletePaamaara: (paamaaraId: string) => Promise<void>;
  mahdollisuusDetails: TypedMahdollisuus[];
  setMahdollisuusDetails: (state: TypedMahdollisuus[]) => void;
}

export const usePaamaaratStore = create<PaamaaratState>()((set, get) => ({
  paamaarat: [],
  mahdollisuusDetails: [],
  setMahdollisuusDetails: (state) => set({ mahdollisuusDetails: state }),
  setPaamaarat: (state) => set({ paamaarat: state }),
  upsertPaamaara: (paamaara) => {
    set((state) => {
      const exists = state.paamaarat.some((pm) => pm.mahdollisuusId === paamaara.mahdollisuusId);

      return {
        paamaarat: exists
          ? state.paamaarat.map((pm) => (pm.mahdollisuusId === paamaara.mahdollisuusId ? { ...paamaara } : pm))
          : [...state.paamaarat, { ...paamaara }],
      };
    });
  },
  deletePaamaara: async (id: string) => {
    const { error } = await client.DELETE('/api/profiili/paamaarat/{id}', {
      params: {
        path: { id },
      },
    });

    if (!error) {
      set({
        paamaarat: get().paamaarat.filter((pm) => pm.id !== id),
      });
    }
  },
}));
