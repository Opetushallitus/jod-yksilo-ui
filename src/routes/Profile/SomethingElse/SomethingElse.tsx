import { client } from '@/api/client';
import type { OsaaminenDto } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { formErrorMessage, LIMITS } from '@/constants';
import { useModal } from '@/hooks/useModal';
import EditMuuOsaaminenModal from '@/routes/Profile/SomethingElse/EditMuuOsaaminenModal';
import { getLocalizedText, sortByProperty } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, EmptyState, Tag, Textarea } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';
import { z } from 'zod';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';

const SomethingElse = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('profile.something-else.title');
  const { showModal } = useModal();
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
    <MainLayout navChildren={<ProfileNavigationList />}>
      <title>{title}</title>
      <ProfileSectionTitle type="MUU_OSAAMINEN" title={title} />
      <p className="mb-5 text-body-lg">{t('profile.something-else.description')}</p>
      <div className="mb-8">
        <Link
          to={`/${language}/${t('slugs.tool.index')}/${t('slugs.tool.competences')}`}
          className="text-button-md hover:underline text-accent mt-4"
        >
          <div className="flex items-center gap-2">
            {t('profile.favorites.link-go-to-job-and-education-opportunities')}
            <JodArrowRight size={24} />
          </div>
        </Link>
      </div>
      {muuOsaaminen.length === 0 && (
        <div className="mt-6 mb-7">
          <EmptyState text={t('profile.something-else.empty')} />
        </div>
      )}

      {muuOsaaminen.length > 0 && (
        <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray">
          {t('profile.something-else.my-other-comptetences')}
        </h2>
      )}
      <div className="flex flex-wrap gap-3">
        {sortedData.map((val) => (
          <Tag
            label={getLocalizedText(val.nimi)}
            title={getLocalizedText(val.kuvaus)}
            key={val.uri}
            variant="presentation"
            sourceType="jotain-muuta"
          />
        ))}
      </div>
      <div className="flex pt-7 mb-8">
        <Button
          variant="white"
          label={muuOsaaminen.length > 0 ? t('profile.competences.edit') : t('profile.competences.add')}
          onClick={() => {
            showModal(EditMuuOsaaminenModal, { data: muuOsaaminen });
          }}
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
      />
    </MainLayout>
  );
};

export default SomethingElse;
