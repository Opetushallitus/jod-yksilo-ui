import { client } from '@/api/client';
import { components } from '@/api/schema';
import { OsaaminenValue } from '@/components';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { EhdotusData, ehdotusDataToRecord, EhdotusRecord } from '@/routes/Tool/utils';
import { paginate, sortByProperty } from '@/utils';
import { create } from 'zustand';

const SUOSIKIT_PATH = '/api/profiili/suosikit';

interface ToolState {
  mahdollisuudet: string[];
  osaamiset: OsaaminenValue[];
  kiinnostukset: OsaaminenValue[];
  suosikit: components['schemas']['SuosikkiDto'][];
  suosikitLoading: boolean;
  osaamisKiinnostusPainotus: number;
  rajoitePainotus: number;
  tyomahdollisuusEhdotukset: EhdotusRecord;
  tyomahdollisuudet: components['schemas']['TyomahdollisuusDto'][];
  ehdotuksetLoading: boolean;
  tyomahdollisuudetLoading: boolean;
  ehdotuksetPageSize: number;
  ehdotuksetPageNr: number;
  ehdotuksetCount: number;
  reset: () => void;
  setMahdollisuudet: (state: string[]) => void;
  setOsaamiset: (state: OsaaminenValue[]) => void;
  setKiinnostukset: (state: OsaaminenValue[]) => void;
  setSuosikit: (state: components['schemas']['SuosikkiDto'][]) => void;
  updateSuosikit: () => Promise<void>;
  toggleSuosikki: (suosionKohdeId: string) => Promise<void>;

  setOsaamisKiinnostusPainotus: (state: number) => void;
  setRajoitePainotus: (state: number) => void;

  updateEhdotukset: () => Promise<void>;
  fetchTyomahdollisuudetPage: (page?: number) => Promise<void>;
  updateEhdotuksetAndTyomahdollisuudet: () => Promise<void>;
}

export const useToolStore = create<ToolState>()((set) => ({
  mahdollisuudet: [],
  osaamiset: [],
  kiinnostukset: [],
  suosikit: [],
  suosikitLoading: false,
  osaamisKiinnostusPainotus: 50,
  kiinnostusPainotus: 50,
  rajoitePainotus: 50,
  tyomahdollisuusEhdotukset: {},
  tyomahdollisuudet: [],
  ehdotuksetLoading: false,
  tyomahdollisuudetLoading: false,
  ehdotuksetPageSize: DEFAULT_PAGE_SIZE,
  ehdotuksetPageNr: 1,
  ehdotuksetCount: 0,
  reset: () =>
    set({ mahdollisuudet: [], osaamiset: [], kiinnostukset: [], tyomahdollisuusEhdotukset: {}, tyomahdollisuudet: [] }),
  setMahdollisuudet: (state) => set({ mahdollisuudet: state }),
  setOsaamiset: (state) => set({ osaamiset: state }),
  setKiinnostukset: (state) => set({ kiinnostukset: state }),
  setSuosikit: (state) => set({ suosikit: state }),

  setOsaamisKiinnostusPainotus: (state: number) => set({ osaamisKiinnostusPainotus: state }),
  setRajoitePainotus: (state: number) => set({ rajoitePainotus: state }),
  updateEhdotukset: async () => {
    const { osaamiset, kiinnostukset, osaamisKiinnostusPainotus, rajoitePainotus } = useToolStore.getState();

    set({ ehdotuksetLoading: true });
    try {
      const { data: tyomahdollisuudetData } = await client.POST('/api/ehdotus/tyomahdollisuudet', {
        body: {
          osaamiset: osaamiset.map((item) => item.id),
          kiinnostukset: kiinnostukset.map((item) => item.id),
          osaamisPainotus: (100 - osaamisKiinnostusPainotus) / 100,
          kiinnostusPainotus: osaamisKiinnostusPainotus / 100,
          rajoitePainotus: rajoitePainotus / 100,
        },
      });

      const tyomahdollisuusEhdotukset = ehdotusDataToRecord((tyomahdollisuudetData ?? []) as EhdotusData[]);
      set({
        tyomahdollisuusEhdotukset,
        ehdotuksetLoading: false,
        ehdotuksetCount: Object.keys(tyomahdollisuusEhdotukset).length,
      });
    } catch (error) {
      set({ tyomahdollisuusEhdotukset: {}, ehdotuksetLoading: false, ehdotuksetCount: 0 });
    }
  },
  fetchTyomahdollisuudetPage: async (newPage = 1) => {
    const pageSize = useToolStore.getState().ehdotuksetPageSize;
    let ehdotukset = useToolStore.getState().tyomahdollisuusEhdotukset;

    if (Object.keys(ehdotukset).length === 0) {
      await useToolStore.getState().updateEhdotukset();
      ehdotukset = useToolStore.getState().tyomahdollisuusEhdotukset;
    }

    const ids = Object.keys(ehdotukset ?? []);
    ids
      .map((key) => {
        const pisteet = ehdotukset?.[key].pisteet ?? 0;
        return { key, pisteet };
      })
      .sort(sortByProperty('pisteet'))
      .forEach((item) => item.key);

    set({ tyomahdollisuudetLoading: true });
    try {
      const { data } = await client.GET('/api/tyomahdollisuudet', {
        params: {
          query: {
            id: paginate(ids, newPage, pageSize),
          },
        },
      });

      const results = data?.sisalto ?? [];
      const sortedResults = [...results].sort((a, b) =>
        ehdotukset ? (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0) : 0,
      );
      // All that has been returned are sorted by the scores
      set({
        tyomahdollisuudet: sortedResults,
        ehdotuksetPageNr: newPage,
        tyomahdollisuudetLoading: false,
      });
    } catch (error) {
      set({ tyomahdollisuudet: [], tyomahdollisuudetLoading: false });
    }
  },

  updateEhdotuksetAndTyomahdollisuudet: async () => {
    await useToolStore.getState().updateEhdotukset();
    await useToolStore.getState().fetchTyomahdollisuudetPage(1);
  },
  toggleSuosikki: async (suosionKohdeId: string) => {
    const { suosikitLoading, suosikit, updateSuosikit } = useToolStore.getState();

    if (suosikitLoading) {
      return;
    }

    const favorite = suosikit.find((s) => s.suosionKohdeId === suosionKohdeId);
    set({ suosikitLoading: true });
    try {
      if (favorite?.id) {
        await client.DELETE(SUOSIKIT_PATH, {
          params: {
            query: { id: favorite.id },
          },
        });
      } else {
        await client.POST(SUOSIKIT_PATH, {
          body: {
            suosionKohdeId,
            tyyppi: 'TYOMAHDOLLISUUS',
          },
        });
      }
      await updateSuosikit();
    } catch (error) {
      // Error, do nothing
    }
    set({ suosikitLoading: false });
  },

  updateSuosikit: async () => {
    set({ suosikitLoading: true });
    try {
      const { data: suosikit = [] } = await client.GET(SUOSIKIT_PATH);
      set({ suosikit });
    } catch (error) {
      set({ suosikit: useToolStore.getState().suosikit ?? [] });
    }
    set({ suosikitLoading: false });
  },
}));
