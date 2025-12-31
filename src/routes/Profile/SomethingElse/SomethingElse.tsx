import { client } from '@/api/client';
import type { OsaaminenDto } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { formErrorMessage, LIMITS } from '@/constants';
import { useModal } from '@/hooks/useModal';
import EditMuuOsaaminenModal from '@/routes/Profile/SomethingElse/EditMuuOsaaminenModal';
import { getLocalizedText, sortByProperty } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, EmptyState, Tag, Textarea, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { z } from 'zod';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { ToolCard } from '../components/ToolCard';

const SomethingElse = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('profile.something-else.title');
  const { showModal } = useModal();
  const { lg } = useMediaQueries();
  const { muuOsaaminen, vapaateksti } = useLoaderData() as {
    muuOsaaminen: OsaaminenDto[];
    vapaateksti: components['schemas']['LokalisoituTeksti'];
  };

  const sortedData = React.useMemo(
    () => [...muuOsaaminen].sort(sortByProperty(`nimi.${language}`)),
    [muuOsaaminen, language],
  );

  const ref = React.useRef<HTMLTextAreaElement>(null);
  const {
    register,
    formState: { isDirty, errors },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm<components['schemas']['LokalisoituTeksti']>({
    defaultValues: vapaateksti,
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

      await client.PUT('/api/profiili/muu-osaaminen/vapaateksti', {
        body: fields,
      });

      reset(fields);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [fields, errors, isDirty, reset]);

  React.useEffect(() => {
    setValue(language, vapaateksti?.[language] ?? '');
    reset(getValues());
  }, [language, vapaateksti, getValues, reset, setValue]);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.overflow = 'hidden';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [fields]);

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="something-else-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <ProfileSectionTitle type="MUU_OSAAMINEN" title={title} />
      <p className="mb-5 text-body-lg">{t('profile.something-else.description')}</p>

      {muuOsaaminen.length === 0 && (
        <div className="mt-6 mb-7" data-testid="something-else-empty-state">
          <EmptyState text={t('profile.something-else.empty')} />
        </div>
      )}

      {muuOsaaminen.length > 0 && (
        <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray">
          {t('profile.something-else.my-other-comptetences')}
        </h2>
      )}
      <ul className="flex flex-wrap gap-3" data-testid="something-else-tags">
        {sortedData.map((val) => (
          <li key={val.uri}>
            <Tag
              label={getLocalizedText(val.nimi)}
              tooltip={getLocalizedText(val.kuvaus)}
              variant="presentation"
              sourceType="jotain-muuta"
            />
          </li>
        ))}
      </ul>
      <div className="flex pt-7 mb-8">
        <Button
          variant="accent"
          label={muuOsaaminen.length > 0 ? t('profile.competences.edit') : t('profile.competences.add')}
          onClick={() => {
            showModal(EditMuuOsaaminenModal, { data: muuOsaaminen });
          }}
          data-testid="something-else-edit"
        />
      </div>
      <Textarea
        label={t('profile.something-else.free-form-description-of-my-interests')}
        help={t('profile.something-else.free-form-interests-description-guidance')}
        maxLength={LIMITS.TEXTAREA}
        {...register(language)}
        ref={(e) => {
          register(language).ref(e);
          ref.current = e;
        }}
        data-testid="something-else-freeform"
      />
      {lg ? null : <ToolCard testId="something-else-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default SomethingElse;
