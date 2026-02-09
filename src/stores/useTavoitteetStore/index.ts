import { client } from '@/api/client';
import { getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
import type { components } from '@/api/schema';
import type { TypedMahdollisuus } from '@/routes/types';
import { isDefined, sortByProperty } from '@/utils';
import { create } from 'zustand';

export type Tavoite = components['schemas']['TavoiteDto'];

interface TavoitteetState {
  tavoitteet: Tavoite[];
  mahdollisuusDetails: TypedMahdollisuus[];
  isLoading: boolean;
  setTavoitteet: (state: Tavoite[]) => void;
  upsertTavoite: (tavoite: Tavoite) => Promise<void>;
  refreshTavoitteet: () => Promise<void>;
  deleteTavoite: (tavoiteId: string) => Promise<void>;
  setMahdollisuusDetails: (state: TypedMahdollisuus[]) => void;
}

export const useTavoitteetStore = create<TavoitteetState>()((set, get) => ({
  tavoitteet: [],
  mahdollisuusDetails: [],
  isLoading: false,

  setMahdollisuusDetails: (state) => set({ mahdollisuusDetails: state }),
  refreshTavoitteet: async () => {
    try {
      set({ isLoading: true });
      const response = await client.GET('/api/profiili/tavoitteet');
      const tavoitteet = response.data ?? [];
      get().setTavoitteet(
        [...tavoitteet]
          .map((t) => ({
            ...t,
            suunnitelmat: t.suunnitelmat?.sort(sortByProperty('luotu')),
          }))
          .sort(sortByProperty('luotu')),
      );
    } finally {
      set({ isLoading: false });
    }
  },
  setTavoitteet: (state) => set({ tavoitteet: state }),
  upsertTavoite: async (tavoite) => {
    try {
      set({ isLoading: true });
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
        get().tavoitteet.map(mapToIds).filter(isDefined),
      );
      get().setMahdollisuusDetails(tyomahdollisuudetDetails);
    } finally {
      set({ isLoading: false });
    }
  },
  deleteTavoite: async (id: string) => {
    try {
      set({ isLoading: true });
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
    } finally {
      set({ isLoading: false });
    }
  },
}));
