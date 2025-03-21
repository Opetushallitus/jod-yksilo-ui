import { client } from '@/api/client';
import { components } from '@/api/schema';
import { create } from 'zustand';

type Paamaara = components['schemas']['PaamaaraDto'];

interface PaamaaratState {
  paamaarat: Paamaara[];
  setPaamaarat: (state: Paamaara[]) => void;
  upsertPaamaara: (paamaara: Paamaara) => void;
  deletePaamaara: (paamaaraId: string) => Promise<void>;
}

export const usePaamaaratStore = create<PaamaaratState>()((set, get) => ({
  paamaarat: [],

  setPaamaarat: (state) => set({ paamaarat: state }),
  upsertPaamaara: (paamaara) => {
    set((state) => ({
      ...state,
      paamaarat: state.paamaarat.find((pm) => pm.mahdollisuusId === paamaara.mahdollisuusId)
        ? [...state.paamaarat.map((pm) => (pm.mahdollisuusId === paamaara.mahdollisuusId ? paamaara : pm))]
        : [...state.paamaarat, paamaara],
    }));
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
