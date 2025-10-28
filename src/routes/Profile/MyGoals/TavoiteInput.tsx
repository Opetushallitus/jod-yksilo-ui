import { client } from '@/api/client';
import { components } from '@/api/schema';
import { FormError } from '@/components';
import { formErrorMessage, LIMITS } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface TavoiteInputProps {
  goal: components['schemas']['TavoiteDto'];
}

/**
 * Input field for goal description
 */
const TavoiteInput = ({ goal }: TavoiteInputProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const saveText = loading ? t('save-in-progress') : t('saved');
  const tavoite = React.useMemo(() => goal.tavoite ?? {}, [goal]);
  const [debouncedValue, inputValue, setDebouncedValue] = useDebounceState(tavoite[language] || '', 1000);
  const updateTavoite = useTavoitteetStore((state) => state.upsertTavoite);

  const methods = useForm<{
    tavoite: components['schemas']['LokalisoituTeksti'];
  }>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        tavoite: z.object({}).catchall(z.string().max(LIMITS.TEXTAREA, formErrorMessage.max(LIMITS.TEXTAREA))),
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

  // Handle language change
  React.useEffect(() => {
    setDebouncedValue(tavoite[language] || '');
    setValue(`tavoite.${language}`, tavoite[language] || '');
    trigger(`tavoite.${language}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Handle text area input value changes
  const ref = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    // Set the text area height to fit the content
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.overflow = 'hidden';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
    // Set the RHF internal value and trigger form validation
    setValue(`tavoite.${language}`, inputValue);
    trigger(`tavoite.${language}`);
    // Only depend on inputValue, not language
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  // Track the language at the time of the last input edit
  const lastEditLanguage = React.useRef(language);

  // Update lastEditLanguage when user edits input
  React.useEffect(() => {
    lastEditLanguage.current = language;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  React.useEffect(() => {
    const save = async () => {
      // Only save if the language hasn't changed since last edit
      if (lastEditLanguage.current !== language) {
        return;
      }
      if (Object.keys(errors).length > 0) {
        setSaved(false);
      } else if (goal.id && debouncedValue !== tavoite[language]) {
        const newTavoite = {
          ...goal,
          tavoite: {
            ...goal.tavoite,
            [language]: debouncedValue,
          },
        };
        setLoading(true);
        await client.PUT('/api/profiili/tavoitteet/{id}', {
          body: newTavoite,
          params: { path: { id: goal.id } },
        });
        setLoading(false);
        setSaved(true);
        updateTavoite(newTavoite);
      }
    };
    save();
  }, [debouncedValue, errors, tavoite, goal, updateTavoite, language]);

  const formId = React.useId();
  return (
    <div className="flex flex-col gap-2">
      <FormProvider {...methods}>
        <Form id={formId}>
          <Textarea
            {...register(`tavoite.${language}` as const)}
            label={t('profile.my-goals.goal-description')}
            placeholder={t('profile.my-goals.goal-description-placeholder')}
            help={t('profile.my-goals.goal-description-help')}
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
