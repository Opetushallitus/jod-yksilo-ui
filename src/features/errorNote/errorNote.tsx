import { useAppSelector } from '@/state/hooks';
import { Note } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

export const ErrorNote = () => {
  const { t } = useTranslation();

  const title = useAppSelector((state) => state.root.errorNote.title);
  const description = useAppSelector((state) => state.root.errorNote.description);

  return <>{title && description ? <Note title={t(title)} description={t(description)} variant="error" /> : null}</>;
};
