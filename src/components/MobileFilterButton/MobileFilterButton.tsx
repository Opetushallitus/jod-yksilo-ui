import { RoundButton, useMediaQueries } from '@jod/design-system';
import { MdTune } from 'react-icons/md';

export const MobileFilterButton = ({ onClick, label }: { onClick: () => void; label: string }) => {
  const { sm } = useMediaQueries();

  return !sm ? (
    <RoundButton size="sm" bgColor="white" label={label} hideLabel onClick={onClick} icon={<MdTune size={24} />} />
  ) : (
    <></>
  );
};
