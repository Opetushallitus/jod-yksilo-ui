import { components } from '@/api/schema';
import { FormError } from '@/components';
import { Button, InputField } from '@jod/design-system';
import { JodClose } from '@jod/design-system/icons';
import { t } from 'i18next';
import { useFieldArray, useFormContext } from 'react-hook-form';

interface LinksFormSectionProps {
  fieldName?: string;
  type: components['schemas']['PolunVaiheDto']['tyyppi'];
}
const LinksFormSection = ({ type, fieldName = 'linkit' }: LinksFormSectionProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const {
    fields: linkitFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control: control,
    name: fieldName,
  });

  return (
    <div className="flex flex-col gap-5">
      <span className="text-form-label">
        {t(`profile.paths.add-links-for-${type === 'KOULUTUS' ? 'education' : 'work'}`)}
      </span>
      {linkitFields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-5">
          <div className="flex flex-row gap-3 w-full items-center">
            <InputField hideLabel placeholder={t('link')} {...register(`linkit.${index}.url` as const)} />
            <button
              onClick={() => removeLink(index)}
              aria-label={t('profile.paths.remove-link')}
              className="cursor-pointer"
            >
              <JodClose />
            </button>
          </div>
          <FormError name={`linkit.${index}.url`} errors={errors} />
        </div>
      ))}
      <div>
        <Button
          variant="white"
          label={t('profile.paths.add-link')}
          onClick={() => {
            appendLink({ url: '' });
          }}
        />
      </div>
    </div>
  );
};

export default LinksFormSection;
