import { client } from '@/api/client';
import { components } from '@/api/schema';
import { OsaaminenValue } from '@/components';
import { EhdotusData, ehdotusDataToRecord, EhdotusRecord } from '@/routes/Tool/utils';
import { create } from 'zustand';

interface ToolState {
  mahdollisuudet: string[];
  osaamiset: OsaaminenValue[];
  kiinnostukset: OsaaminenValue[];
  osaamisKiinnostusPainotus: number;
  rajoitePainotus: number;
  tyomahdollisuusEhdotukset: EhdotusRecord;
  tyomahdollisuudet: components['schemas']['TyomahdollisuusDto'][];
  reset: () => void;
  setMahdollisuudet: (state: string[]) => void;
  setOsaamiset: (state: OsaaminenValue[]) => void;
  setKiinnostukset: (state: OsaaminenValue[]) => void;

  setOsaamisKiinnostusPainotus: (state: number) => void;
  setRajoitePainotus: (state: number) => void;

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
  reset: () =>
    set({ mahdollisuudet: [], osaamiset: [], kiinnostukset: [], tyomahdollisuusEhdotukset: {}, tyomahdollisuudet: [] }),
  setMahdollisuudet: (state) => set({ mahdollisuudet: state }),
  setOsaamiset: (state) => set({ osaamiset: state }),
  setKiinnostukset: (state) => set({ kiinnostukset: state }),

  setOsaamisKiinnostusPainotus: (state: number) => set({ osaamisKiinnostusPainotus: state }),
  setRajoitePainotus: (state: number) => set({ rajoitePainotus: state }),

  updateEhdotuksetAndTyomahdollisuudet: async () => {
    const { osaamiset, kiinnostukset, osaamisKiinnostusPainotus, rajoitePainotus } = useToolStore.getState();
    const { data: tyomahdollisuudetData } = await client.POST('/api/ehdotus/tyomahdollisuudet', {
      body: {
        osaamiset: osaamiset.map((item) => item.id),
        kiinnostukset: kiinnostukset.map((item) => item.id),
        osaamisPainotus: (100 - osaamisKiinnostusPainotus) / 100,
        kiinnostusPainotus: osaamisKiinnostusPainotus / 100,
        rajoitePainotus: rajoitePainotus / 100,
      },
    });

    const ehdotukset = ehdotusDataToRecord((tyomahdollisuudetData ?? []) as EhdotusData[]);

    const ids = Object.keys(ehdotukset ?? []);
    ids
      .map((key) => {
        const pisteet = ehdotukset?.[key].pisteet ?? 0;
        return { key, pisteet };
      })
      .sort((a, b) => b.pisteet - a.pisteet)
      .forEach((id) => id.key);

    const { data } = await client.GET('/api/tyomahdollisuudet', {
      params: {
        query: {
          id: ids.slice(0, 30), // TODO: fetch by paging
        },
      },
    });
    // All that has been returned are sorted by the scores
    const results = data?.sisalto ?? [];
    const sortedResults = [...results].sort((a, b) =>
      ehdotukset ? (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0) : 0,
    );

    return set({
      tyomahdollisuusEhdotukset: ehdotukset,
      tyomahdollisuudet: sortedResults,
    });
  },
}));
