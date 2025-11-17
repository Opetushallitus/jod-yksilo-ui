import { client } from '@/api/client';
import { getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService.ts';
import { components } from '@/api/schema';
import { TypedMahdollisuus } from '@/routes/types';
import { create } from 'zustand';

export type Tavoite = components['schemas']['TavoiteDto'];

interface TavoitteetState {
  tavoitteet: Tavoite[];
  setTavoitteet: (state: Tavoite[]) => void;
  upsertTavoite: (tavoite: Tavoite) => void;
  refreshTavoitteet: () => void;
  deleteTavoite: (tavoiteId: string) => Promise<void>;
  mahdollisuusDetails: TypedMahdollisuus[];
  setMahdollisuusDetails: (state: TypedMahdollisuus[]) => void;
}

export const useTavoitteetStore = create<TavoitteetState>()((set, get) => ({
  tavoitteet: [],
  mahdollisuusDetails: [],

  setMahdollisuusDetails: (state) => set({ mahdollisuusDetails: state }),
  refreshTavoitteet: async () => {
    const response = await client.GET('/api/profiili/tavoitteet');
    const tavoitteet = response.data ?? [];
    get().setTavoitteet(tavoitteet);
  },
  setTavoitteet: (state) => set({ tavoitteet: state }),
  upsertTavoite: async (tavoite) => {
    set((state) => {
      const exists = state.tavoitteet.some(
        (existingTavoite) => existingTavoite.mahdollisuusId === tavoite.mahdollisuusId,
      );

      return {
        tavoitteet: exists
          ? state.tavoitteet.map((pm) => (pm.mahdollisuusId === tavoite.mahdollisuusId ? { ...tavoite } : pm))
          : [...state.tavoitteet, { ...tavoite }],
      };
    });
    const mapToIds = (pm: Tavoite) => pm.mahdollisuusId;
    const tyomahdollisuudetDetails = await getTypedTyoMahdollisuusDetails(
      get()
        .tavoitteet.map(mapToIds)
        .filter((id): id is string => id != undefined),
    );
    get().setMahdollisuusDetails(tyomahdollisuudetDetails);
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
