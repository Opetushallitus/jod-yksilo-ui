import { client } from '@/api/client';
import { components } from '@/api/schema';
import { OsaaminenValue } from '@/components';
import { EhdotusData, ehdotusDataToRecord, EhdotusRecord } from '@/routes/Tool/utils';
import { sortByProperty } from '@/utils';
import { create } from 'zustand';

interface ToolState {
  mahdollisuudet: string[];
  osaamiset: OsaaminenValue[];
  kiinnostukset: OsaaminenValue[];
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
  osaamisKiinnostusPainotus: 50,
  kiinnostusPainotus: 50,
  rajoitePainotus: 50,
  tyomahdollisuusEhdotukset: {},
  tyomahdollisuudet: [],
  ehdotuksetLoading: false,
  tyomahdollisuudetLoading: false,
  ehdotuksetPageSize: 30,
  ehdotuksetPageNr: 1,
  ehdotuksetCount: 0,
  reset: () =>
    set({ mahdollisuudet: [], osaamiset: [], kiinnostukset: [], tyomahdollisuusEhdotukset: {}, tyomahdollisuudet: [] }),
  setMahdollisuudet: (state) => set({ mahdollisuudet: state }),
  setOsaamiset: (state) => set({ osaamiset: state }),
  setKiinnostukset: (state) => set({ kiinnostukset: state }),

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

    const pageNr = Math.max(newPage - 1, 0);
    const pageIndex = pageNr * pageSize;

    set({ tyomahdollisuudetLoading: true });
    try {
      const { data } = await client.GET('/api/tyomahdollisuudet', {
        params: {
          query: {
            id: ids.slice(Math.max(pageIndex, 0), Math.min(pageIndex + pageSize - 1, ids.length - 1)),
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
}));
