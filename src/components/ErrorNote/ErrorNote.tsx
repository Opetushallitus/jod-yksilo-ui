import { ErrorNoteData } from '@/hooks/useErrorNote';
import { Note } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface ErrorNoteProps {
  error: ErrorNoteData;
  onCloseClick: () => void;
}

export const ErrorNote = ({ error, onCloseClick }: ErrorNoteProps) => {
  const { t } = useTranslation();
  const { title, description } = error;

  return title && description ? (
    <Note title={t(title)} description={t(description)} variant="error" onCloseClick={onCloseClick} />
  ) : null;
};