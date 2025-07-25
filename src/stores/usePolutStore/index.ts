import { components } from '@/api/schema';
import { mapOsaaminenToUri, VaiheForm } from '@/routes/Profile/Path/utils';
import { TypedMahdollisuus } from '@/routes/types';
import { create } from 'zustand';

type Osaaminen = components['schemas']['OsaaminenDto'];
interface PolkuState {
  ammattiryhmaNimet: Record<string, components['schemas']['LokalisoituTeksti']>;
  polku?: components['schemas']['PolunSuunnitelmaDto'];
  vaiheet: VaiheForm[];
  polutLoading: boolean;
  selectedOsaamiset: string[];
  ignoredOsaamiset: string[];
  disabledOsaamiset: string[];

  osaamisetFromProfile: Osaaminen[];
  osaamisetFromVaiheet: Osaaminen[];
  vaaditutOsaamiset: Osaaminen[];
  proposedOpportunity?: TypedMahdollisuus;

  setPolku: (state: components['schemas']['PolunSuunnitelmaDto']) => void;
  setVaiheet: (state: VaiheForm[]) => void;
  setPolutLoading: (state: boolean) => void;
  setSelectedOsaamiset: (state: string[]) => void;
  setIgnoredOsaamiset: (state: string[]) => void;
  setDisabledOsaamiset: (state: string[]) => void;
  setOsaamisetFromProfile: (state: Osaaminen[]) => void;
  setOsaamisetFromVaiheet: (state: Osaaminen[]) => void;
  setVaaditutOsaamiset: (state: Osaaminen[]) => void;
  setProposedOpportunity: (state: TypedMahdollisuus | undefined) => void;
  getMissingOsaamisetUris: () => string[];
  setAmmattiryhmaNimet: (state: Record<string, components['schemas']['LokalisoituTeksti']>) => void;
}

export const usePolutStore = create<PolkuState>()((set, get) => ({
  ammattiryhmaNimet: {},
  polku: undefined,
  vaiheet: [],
  polutLoading: false,
  ignoredOsaamiset: [],
  selectedOsaamiset: [],
  disabledOsaamiset: [],
  osaamisetFromProfile: [],
  osaamisetFromVaiheet: [],
  vaaditutOsaamiset: [],
  proposedOpportunity: undefined,
  setPolku: (state) => set({ polku: state }),
  setVaiheet: (state) => set({ vaiheet: state }),
  setPolutLoading: (state) => set({ polutLoading: state }),
  setSelectedOsaamiset: (state) => set({ selectedOsaamiset: state }),
  setIgnoredOsaamiset: (state) => set({ ignoredOsaamiset: state }),
  setDisabledOsaamiset: (state) => set({ disabledOsaamiset: state }),
  setOsaamisetFromProfile: (state) => set({ osaamisetFromProfile: state }),
  setOsaamisetFromVaiheet: (state) => set({ osaamisetFromVaiheet: state }),
  setVaaditutOsaamiset: (state) => set({ vaaditutOsaamiset: state }),
  setProposedOpportunity: (state) => set({ proposedOpportunity: state }),
  setAmmattiryhmaNimet: (state) => set({ ammattiryhmaNimet: state }),
  getMissingOsaamisetUris: () => {
    const existingOsaamiset = [
      ...get().osaamisetFromProfile.map(mapOsaaminenToUri),
      ...get().osaamisetFromVaiheet.map(mapOsaaminenToUri),
      ...get().selectedOsaamiset,
      ...get().disabledOsaamiset,
      ...get().ignoredOsaamiset,
    ];
    return get()
      .vaaditutOsaamiset.map(mapOsaaminenToUri)
      .filter((uri) => !existingOsaamiset.includes(uri));
  },
}));
