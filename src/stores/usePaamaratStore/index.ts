import { components } from '@/api/schema';
import { create } from 'zustand';

type Paamaara = components['schemas']['PaamaaraDto'];

interface PaamaaratState {
  pitkanAikavalinTavoite: Paamaara[];
  lyhyenAikavalinTavoite: Paamaara[];
  muutTavoitteet: Paamaara[];
  paamaarat: Paamaara[];

  setPitkanAikavalinTavoite: (state: Paamaara[]) => void;
  setLyhyenAikavalinTavoite: (state: Paamaara[]) => void;
  setMuutTavoitteet: (state: Paamaara[]) => void;
  setPaamaarat: (state: Paamaara[]) => void;
  upsertPaamaara: (paamaara: Paamaara) => void;
  updateCategories: () => void;
}

export const usePaamaaratStore = create<PaamaaratState>()((set, get) => ({
  pitkanAikavalinTavoite: [],
  lyhyenAikavalinTavoite: [],
  muutTavoitteet: [],
  paamaarat: [],
  setPitkanAikavalinTavoite: (state) => set({ pitkanAikavalinTavoite: state }),
  setLyhyenAikavalinTavoite: (state) => set({ lyhyenAikavalinTavoite: state }),
  setMuutTavoitteet: (state) => set({ muutTavoitteet: state }),
  setPaamaarat: (state) => set({ paamaarat: state }),
  updateCategories: () => {
    const { paamaarat } = get();
    get().setPitkanAikavalinTavoite(paamaarat.filter((paamaara) => paamaara.tyyppi === 'PITKA'));
    get().setLyhyenAikavalinTavoite(paamaarat.filter((paamaara) => paamaara.tyyppi === 'LYHYT'));
    get().setMuutTavoitteet(paamaarat.filter((paamaara) => paamaara.tyyppi === 'MUU'));
  },
  upsertPaamaara: (paamaara) => {
    const { updateCategories } = get();
    set((state) => ({
      ...state,
      paamaarat: state.paamaarat.find((pm) => pm.mahdollisuusId === paamaara.mahdollisuusId)
        ? [...state.paamaarat.map((pm) => (pm.mahdollisuusId === paamaara.mahdollisuusId ? paamaara : pm))]
        : [...state.paamaarat, paamaara],
    }));
    updateCategories();
  },
}));
