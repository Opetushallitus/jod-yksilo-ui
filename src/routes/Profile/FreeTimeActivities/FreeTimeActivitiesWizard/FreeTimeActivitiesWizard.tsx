import { SelectableTableRow } from '@/components';
import { Button, Modal } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface FreeTimeActivitiesWizardProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRow?: SelectableTableRow;
}

const FreeTimeActivitiesWizard = ({ isOpen, setIsOpen }: FreeTimeActivitiesWizardProps) => {
  const { t } = useTranslation();
  // TODO: form logic
  const isLoading = false;
  //

  return !isLoading ? (
    <Modal
      open={isOpen}
      content={
        <div>
          <h1>FreeTimeActivitiesWizard</h1>
        </div>
      }
      footer={<Button onClick={() => setIsOpen(false)} label={t('cancel')} variant="white" />}
    />
  ) : null;
};

export default FreeTimeActivitiesWizard;
