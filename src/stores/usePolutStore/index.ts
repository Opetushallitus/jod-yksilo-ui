import { components } from '@/api/schema';
import { VaiheForm } from '@/routes/Profile/Path/utils';
import { create } from 'zustand';

type Osaaminen = components['schemas']['OsaaminenDto'];
interface PolkuState {
  polku?: components['schemas']['PolunSuunnitelmaDto'];
  vaiheet: VaiheForm[];
  polutLoading: boolean;
  selectedOsaamiset: string[];
  ignoredOsaamiset: string[];
  disabledOsaamiset: string[];

  osaamisetFromProfile: Osaaminen[];
  osaamisetFromVaiheet: Osaaminen[];
  vaaditutOsaamiset: Osaaminen[];

  setPolku: (state: components['schemas']['PolunSuunnitelmaDto']) => void;
  setVaiheet: (state: VaiheForm[]) => void;
  setPolutLoading: (state: boolean) => void;
  setSelectedOsaamiset: (state: string[]) => void;
  setIgnoredOsaamiset: (state: string[]) => void;
  setDisabledOsaamiset: (state: string[]) => void;
  setOsaamisetFromProfile: (state: Osaaminen[]) => void;
  setOsaamisetFromVaiheet: (state: Osaaminen[]) => void;
  setVaaditutOsaamiset: (state: Osaaminen[]) => void;
}

export const usePolutStore = create<PolkuState>()((set) => ({
  polku: undefined,
  vaiheet: [],
  polutLoading: false,
  ignoredOsaamiset: [],
  selectedOsaamiset: [],
  disabledOsaamiset: [],
  osaamisetFromProfile: [],
  osaamisetFromVaiheet: [],
  vaaditutOsaamiset: [],
  setPolku: (state) => set({ polku: state }),
  setVaiheet: (state) => set({ vaiheet: state }),
  setPolutLoading: (state) => set({ polutLoading: state }),
  setSelectedOsaamiset: (state) => set({ selectedOsaamiset: state }),
  setIgnoredOsaamiset: (state) => set({ ignoredOsaamiset: state }),
  setDisabledOsaamiset: (state) => set({ disabledOsaamiset: state }),
  setOsaamisetFromProfile: (state) => set({ osaamisetFromProfile: state }),
  setOsaamisetFromVaiheet: (state) => set({ osaamisetFromVaiheet: state }),
  setVaaditutOsaamiset: (state) => set({ vaaditutOsaamiset: state }),
}));
