import { components } from '@/api/schema';
import { formErrorMessage, LIMITS } from '@/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@jod/design-system';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import z from 'zod';

interface FreeFormTextInputProps {
  text?: components['schemas']['LokalisoituTeksti'];
  testId?: string;
  placeholder?: string;
  onChange: (value: components['schemas']['LokalisoituTeksti']) => Promise<void>;
}

export const FreeFormTextInput = ({ text, onChange, testId, placeholder }: FreeFormTextInputProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const ref = React.useRef<HTMLTextAreaElement>(null);
  const {
    register,
    formState: { isDirty, errors },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm<components['schemas']['LokalisoituTeksti']>({
    defaultValues: text,
    resolver: zodResolver(
      z.object({}).catchall(z.string().max(LIMITS.TEXTAREA, formErrorMessage.max(LIMITS.TEXTAREA))),
    ),
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const fields = watch();

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isDirty || Object.keys(errors).length > 0) {
        return;
      }

      await onChange(fields);

      reset(fields);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [fields, errors, isDirty, reset, onChange]);

  React.useEffect(() => {
    setValue(language, text?.[language] ?? '');
    reset(getValues());
  }, [language, text, getValues, reset, setValue]);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.overflow = 'hidden';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [fields]);

  return (
    <div>
      <Textarea
        label={t('profile.free-form-input.label')}
        help={t('profile.free-form-input.help')}
        placeholder={placeholder}
        maxLength={LIMITS.TEXTAREA}
        {...register(language)}
        ref={(e) => {
          register(language).ref(e);
          ref.current = e;
        }}
        testId={testId}
      />
    </div>
  );
};
