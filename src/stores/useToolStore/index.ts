import { client } from '@/api/client';
import { components } from '@/api/schema';
import { OsaaminenValue } from '@/components';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { EhdotusRecord, ehdotusDataToRecord } from '@/routes/Tool/utils';
import { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { paginate } from '@/utils';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const SUOSIKIT_PATH = '/api/profiili/suosikit';

interface ToolState {
  osaamiset: OsaaminenValue[];
  kiinnostukset: OsaaminenValue[];
  suosikit: components['schemas']['SuosikkiDto'][];
  suosikitLoading: boolean;
  osaamisKiinnostusPainotus: number;
  rajoitePainotus: number;
  mahdollisuusEhdotukset: EhdotusRecord;
  tyomahdollisuudet: components['schemas']['TyomahdollisuusDto'][];
  koulutusmahdollisuudet: components['schemas']['KoulutusmahdollisuusDto'][];
  mixedMahdollisuudet: TypedMahdollisuus[];
  ehdotuksetLoading: boolean;
  mahdollisuudetLoading: boolean;
  ehdotuksetPageSize: number;
  ehdotuksetPageNr: number;
  ehdotuksetCount: Record<MahdollisuusTyyppi, number>;
  reset: () => void;
  setOsaamiset: (state: OsaaminenValue[]) => void;
  setKiinnostukset: (state: OsaaminenValue[]) => void;
  setSuosikit: (state: components['schemas']['SuosikkiDto'][]) => void;
  updateSuosikit: () => Promise<void>;
  toggleSuosikki: (suosionKohdeId: string, tyyppi: MahdollisuusTyyppi) => Promise<void>;

  setOsaamisKiinnostusPainotus: (state: number) => void;
  setRajoitePainotus: (state: number) => void;

  updateEhdotukset: () => Promise<void>;
  fetchMahdollisuudetPage: (page?: number) => Promise<void>;
  updateEhdotuksetAndTyomahdollisuudet: () => Promise<void>;
}

export const useToolStore = create<ToolState>()(
  persist(
    (set) => ({
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
          osaamiset: [],
          kiinnostukset: [],
          mahdollisuusEhdotukset: {},
          tyomahdollisuudet: [],
          koulutusmahdollisuudet: [],
          mixedMahdollisuudet: [],
        }),
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
              TYOMAHDOLLISUUS:
                mahdollisuusData?.filter((m) => m.ehdotusMetadata?.tyyppi === 'TYOMAHDOLLISUUS').length ?? 0,
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
          const [tyomahdollisuusData, koulutusmahdollisuusData] = await Promise.all([
            fetchTyomahdollisuudet(ids, newPage, pageSize, ehdotukset),
            fetchKoulutusMahdollisuudet(ids, newPage, pageSize, ehdotukset),
          ]);

          const { tyomahdollisuusResults, sortedTyomahdollisuusResults } = tyomahdollisuusData;
          const { koulutusmahdollisuusResults, sortedKoulutusMahdollisuudet } = koulutusmahdollisuusData;

          const typedTyomahdollisuusResults = tyomahdollisuusResults.map((tm) => ({
            ...tm,
            mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
          }));

          const typedKoulutusmahdollisuusResults = koulutusmahdollisuusResults.map((km) => ({
            ...km,
            mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
          }));

          const sortedMixedMahdollisuudet = [
            ...[...typedKoulutusmahdollisuusResults, ...typedTyomahdollisuusResults],
          ].sort((a, b) =>
            ehdotukset ? (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0) : 0,
          ) as TypedMahdollisuus[];

          // All that has been returned are sorted by the scores
          set({
            tyomahdollisuudet: sortedTyomahdollisuusResults,
            koulutusmahdollisuudet: sortedKoulutusMahdollisuudet,
            ehdotuksetPageNr: newPage,
            mahdollisuudetLoading: false,
            mixedMahdollisuudet: sortedMixedMahdollisuudet,
          });
        } catch (error) {
          set({
            mixedMahdollisuudet: [],
            koulutusmahdollisuudet: [],
            tyomahdollisuudet: [],
            mahdollisuudetLoading: false,
          });
        }
      },

      updateEhdotuksetAndTyomahdollisuudet: async () => {
        await useToolStore.getState().updateEhdotukset();
        await useToolStore.getState().fetchMahdollisuudetPage(1);
      },

      toggleSuosikki: async (suosionKohdeId: string, tyyppi: MahdollisuusTyyppi) => {
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
                tyyppi,
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
    }),
    {
      name: 'tool-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

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
