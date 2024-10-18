import { client } from '@/api/client';
import { components } from '@/api/schema';
import { OsaaminenValue } from '@/components';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { ehdotusDataToRecord, EhdotusRecord } from '@/routes/Tool/utils';
import { paginate } from '@/utils';
import { create } from 'zustand';

const SUOSIKIT_PATH = '/api/profiili/suosikit';

type Mahdollisuus = components['schemas']['TyomahdollisuusDto'] | components['schemas']['KoulutusmahdollisuusDto'];

interface ToolState {
  mahdollisuudet: string[];
  osaamiset: OsaaminenValue[];
  kiinnostukset: OsaaminenValue[];
  suosikit: components['schemas']['SuosikkiDto'][];
  suosikitLoading: boolean;
  osaamisKiinnostusPainotus: number;
  rajoitePainotus: number;
  mahdollisuusEhdotukset: EhdotusRecord;
  tyomahdollisuudet: components['schemas']['TyomahdollisuusDto'][];
  koulutusmahdollisuudet: components['schemas']['KoulutusmahdollisuusDto'][];
  mixedMahdollisuudet: Mahdollisuus[];
  ehdotuksetLoading: boolean;
  mahdollisuudetLoading: boolean;
  ehdotuksetPageSize: number;
  ehdotuksetPageNr: number;
  ehdotuksetCount: Record<'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS', number>;
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
  fetchMahdollisuudetPage: (page?: number) => Promise<void>;
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
  mahdollisuusEhdotukset: {},
  tyomahdollisuudet: [],
  koulutusmahdollisuudet: [],
  mixedMahdollisuudet: [],
  ehdotuksetLoading: false,
  ehdotuksetPageSize: DEFAULT_PAGE_SIZE,
  mahdollisuudetLoading: false,
  ehdotuksetPageNr: 1,
  ehdotuksetCount: { TYOMAHDOLLISUUS: 0, KOULUTUSMAHDOLLISUUS: 0 },
  reset: () =>
    set({
      mahdollisuudet: [],
      osaamiset: [],
      kiinnostukset: [],
      mahdollisuusEhdotukset: {},
      tyomahdollisuudet: [],
      koulutusmahdollisuudet: [],
      mixedMahdollisuudet: [],
    }),
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
      const { data: mahdollisuusData } = await client.POST('/api/ehdotus/mahdollisuudet', {
        body: {
          osaamiset: osaamiset.map((item) => item.id),
          kiinnostukset: kiinnostukset.map((item) => item.id),
          osaamisPainotus: (100 - osaamisKiinnostusPainotus) / 100,
          kiinnostusPainotus: osaamisKiinnostusPainotus / 100,
          rajoitePainotus: rajoitePainotus / 100,
        },
      });

      const mahdollisuusEhdotukset = ehdotusDataToRecord(mahdollisuusData ?? []);

      set({
        mahdollisuusEhdotukset,
        ehdotuksetLoading: false,
        ehdotuksetCount: {
          TYOMAHDOLLISUUS: mahdollisuusData?.filter((m) => m.ehdotusMetadata?.tyyppi === 'TYOMAHDOLLISUUS').length ?? 0,
          KOULUTUSMAHDOLLISUUS:
            mahdollisuusData?.filter((m) => m.ehdotusMetadata?.tyyppi === 'KOULUTUSMAHDOLLISUUS').length ?? 0,
        },
      });
    } catch (error) {
      set({
        mahdollisuusEhdotukset: {},
        ehdotuksetLoading: false,
        ehdotuksetCount: {
          TYOMAHDOLLISUUS: 0,
          KOULUTUSMAHDOLLISUUS: 0,
        },
      });
    }
  },
  fetchMahdollisuudetPage: async (newPage = 1) => {
    const pageSize = useToolStore.getState().ehdotuksetPageSize;
    let ehdotukset = useToolStore.getState().mahdollisuusEhdotukset;

    if (Object.keys(ehdotukset).length === 0) {
      await useToolStore.getState().updateEhdotukset();
      ehdotukset = useToolStore.getState().mahdollisuusEhdotukset;
    }

    const ids = Object.keys(ehdotukset ?? []);
    set({ mahdollisuudetLoading: true });
    try {
      const { tyomahdollisuusResults, sortedTyomahdollisuusResults } = await fetchTyomahdollisuudet(
        ids,
        newPage,
        pageSize,
        ehdotukset,
      );
      const { koulutusmahdollisuusResults, sortedKoulutusMahdollisuudet } = await fetchKoulutusMahdollisuudet(
        ids,
        newPage,
        pageSize,
        ehdotukset,
      );

      const sortedMixedMahdollisuudet = [...[...koulutusmahdollisuusResults, ...tyomahdollisuusResults]].sort((a, b) =>
        ehdotukset ? (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0) : 0,
      );

      // All that has been returned are sorted by the scores
      set({
        tyomahdollisuudet: sortedTyomahdollisuusResults,
        koulutusmahdollisuudet: sortedKoulutusMahdollisuudet,
        ehdotuksetPageNr: newPage,
        mahdollisuudetLoading: false,
        mixedMahdollisuudet: sortedMixedMahdollisuudet,
      });
    } catch (error) {
      set({ mixedMahdollisuudet: [], koulutusmahdollisuudet: [], tyomahdollisuudet: [], mahdollisuudetLoading: false });
    }
  },

  updateEhdotuksetAndTyomahdollisuudet: async () => {
    await useToolStore.getState().updateEhdotukset();
    await useToolStore.getState().fetchMahdollisuudetPage(1);
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
async function fetchKoulutusMahdollisuudet(
  ids: string[],
  newPage: number,
  pageSize: number,
  ehdotukset: EhdotusRecord,
) {
  const { data: koulutusmahdollisuudet } = await client.GET('/api/koulutusmahdollisuudet', {
    params: {
      query: {
        id: paginate(ids, newPage, pageSize),
      },
    },
  });

  const koulutusmahdollisuusResults = koulutusmahdollisuudet?.sisalto ?? [];
  const sortedKoulutusMahdollisuudet = [...koulutusmahdollisuusResults].sort((a, b) =>
    ehdotukset ? (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0) : 0,
  );
  return { koulutusmahdollisuusResults, sortedKoulutusMahdollisuudet };
}

async function fetchTyomahdollisuudet(ids: string[], newPage: number, pageSize: number, ehdotukset: EhdotusRecord) {
  const { data: tyomahdollisuudet } = await client.GET('/api/tyomahdollisuudet', {
    params: {
      query: {
        id: paginate(ids, newPage, pageSize),
      },
    },
  });

  const tyomahdollisuusResults = tyomahdollisuudet?.sisalto ?? [];
  const sortedTyomahdollisuusResults = [...tyomahdollisuusResults].sort((a, b) =>
    ehdotukset ? (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0) : 0,
  );
  return { tyomahdollisuusResults, sortedTyomahdollisuusResults };
}
