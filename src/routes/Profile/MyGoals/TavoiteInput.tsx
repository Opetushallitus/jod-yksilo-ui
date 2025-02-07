import { client } from '@/api/client';
import { components } from '@/api/schema';
import { FormError } from '@/components';
import { formErrorMessage, LIMITS } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import { usePaamaaratStore } from '@/stores/usePaamaratStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface TavoiteInputProps {
  paamaara: components['schemas']['PaamaaraDto'];
}

/**
 * Input field for goal description
 */
const TavoiteInput = ({ paamaara }: TavoiteInputProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const saveText = loading ? t('save-in-progress') : t('saved');
  const tavoite = React.useMemo(() => paamaara.tavoite ?? {}, [paamaara]);
  const [debouncedValue, inputValue, setDebouncedValue] = useDebounceState(tavoite[language] || '', 1000);
  const updatePaamaara = usePaamaaratStore((state) => state.upsertPaamaara);

  const methods = useForm<{
    tavoite: components['schemas']['LokalisoituTeksti'];
  }>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        tavoite: z.record(z.string().max(LIMITS.TEXTAREA, formErrorMessage.max(LIMITS.TEXTAREA))),
      }),
    ),
    defaultValues: { tavoite },
  });

  const {
    register,
    formState: { errors },
    trigger,
    setValue,
  } = methods;

  const ref = React.useRef<HTMLTextAreaElement>(null);

  // For setting the text area height to fit the content
  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.overflow = 'hidden';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
    setValue(`tavoite.${language}`, inputValue);
    trigger(`tavoite.${language}`);
  }, [inputValue, language, setValue, trigger]);

  React.useEffect(() => {
    const save = async () => {
      if (Object.keys(errors).length > 0) {
        setSaved(false);
      } else if (paamaara.id && debouncedValue !== tavoite[language]) {
        const newPaamaara = {
          ...paamaara,
          tavoite: {
            ...paamaara.tavoite,
            [language]: debouncedValue,
          },
        };
        setLoading(true);
        await client.PUT('/api/profiili/paamaarat/{id}', {
          body: newPaamaara,
          params: { path: { id: paamaara.id } },
        });
        setLoading(false);
        setSaved(true);
        updatePaamaara(newPaamaara);
      }
    };
    save();
  }, [debouncedValue, errors, language, paamaara, tavoite, updatePaamaara]);

  const formId = React.useId();
  return (
    <div className="flex flex-col gap-2">
      <FormProvider {...methods}>
        <Form id={formId}>
          <Textarea
            {...register(`tavoite.${language}` as const)}
            label={t('profile.my-goals.goal-description')}
            placeholder={t('profile.my-goals.goal-description')}
            ref={ref}
            value={inputValue}
            maxLength={LIMITS.TEXTAREA}
            onChange={(event) => setDebouncedValue(event.target.value)}
          />
        </Form>
      </FormProvider>
      <div className="flex flex-row justify-between">
        <span>
          <FormError name={`tavoite.${language}`} errors={errors} />
        </span>
        {(saved || loading) && <div className="font-arial justify-self-end text-secondary-gray">{saveText}</div>}
      </div>
    </div>
  );
};

export default TavoiteInput;
