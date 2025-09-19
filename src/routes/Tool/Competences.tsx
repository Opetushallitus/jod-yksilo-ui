import { OsaamisSuosittelija } from '@/components';
import { useToolStore } from '@/stores/useToolStore';
import { useShallow } from 'zustand/shallow';

const Competences = () => {
  const { osaamiset, setOsaamiset } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      setOsaamiset: state.setOsaamiset,
    })),
  );

  return (
    <OsaamisSuosittelija onChange={setOsaamiset} value={osaamiset} tagHeadingClassName="bg-white" hideTextAreaLabel />
  );
};

export default Competences;
