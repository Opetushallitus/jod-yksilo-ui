import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { MainLayout } from '@/components';
import { ESCO_OCCUPATION_PREFIX, formErrorMessage, LIMITS } from '@/constants';
import { useModal } from '@/hooks/useModal';
import EditKiinnostusModal from '@/routes/Profile/Interests/EditKiinnostusModal';
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

const Interests = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { showModal } = useModal();
  const { lg } = useMediaQueries();
  const { kiinnostukset, vapaateksti } = useLoaderData() as {
    kiinnostukset: components['schemas']['OsaaminenDto'][];
    vapaateksti: components['schemas']['LokalisoituTeksti'];
  };
  const title = t('profile.interests.title');

  const sortedData = React.useMemo(
    () => [...kiinnostukset].sort(sortByProperty(`nimi.${language}`)),
    [kiinnostukset, language],
  );

  const sortedSkills = sortedData.filter((value) => !value.uri.startsWith(ESCO_OCCUPATION_PREFIX));
  const sortedOccupations = sortedData.filter((value) => value.uri.startsWith(ESCO_OCCUPATION_PREFIX));

  const ref = React.useRef<HTMLTextAreaElement>(null);
  const {
    register,
    formState: { isDirty, errors },
    reset,
    setValue,
    getValues,
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

      await client.PUT('/api/profiili/kiinnostukset/vapaateksti', {
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

  const isSkillsEmpty = sortedSkills.length === 0;
  const isOccupationSkillsEmpty = sortedOccupations.length === 0;
  const isAllSkillsEmpty = isSkillsEmpty && isOccupationSkillsEmpty;

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="interests-go-to-tool" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <ProfileSectionTitle type="KIINNOSTUS" title={title} />
      <p className="mb-5 text-body-lg">{t('profile.interests.description')}</p>

      {isAllSkillsEmpty && (
        <div className="mt-6 mb-7">
          <EmptyState text={t('profile.interests.empty')} testId="interests-empty-state" />
        </div>
      )}
      {!isSkillsEmpty && (
        <>
          <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray">
            {t('profile.interests.skills-that-interest-me')}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {sortedSkills.map((val) => (
              <li key={val.uri}>
                <Tag
                  label={getLocalizedText(val.nimi)}
                  tooltip={getLocalizedText(val.kuvaus)}
                  variant="presentation"
                  sourceType="kiinnostus"
                />
              </li>
            ))}
          </ul>
        </>
      )}
      {!isOccupationSkillsEmpty && (
        <>
          <h2 className="mb-5 pb-3 text-heading-3 border-b border-border-gray mt-8">
            {t('profile.interests.occupations-that-interest-me')}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {sortedOccupations.map((val) => (
              <li key={val.uri}>
                <Tag
                  label={getLocalizedText(val.nimi)}
                  tooltip={getLocalizedText(val.kuvaus)}
                  variant="presentation"
                  sourceType="kiinnostus"
                />
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="flex pt-7 mb-8">
        <Button
          variant="accent"
          label={isAllSkillsEmpty ? t('profile.interests.add-interests') : t('profile.interests.edit-interests')}
          onClick={() => {
            showModal(EditKiinnostusModal, { data: kiinnostukset });
          }}
          testId="interests-edit-button"
        />
      </div>
      <Textarea
        label={t('profile.interests.free-form-description-of-my-interests')}
        help={t('profile.interests.free-form-interests-description-guidance')}
        maxLength={LIMITS.TEXTAREA}
        {...register(language)}
        ref={(e) => {
          register(language).ref(e);
          ref.current = e;
        }}
        testId="interests-freeform"
      />
      {lg ? null : <ToolCard testId="interests-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default Interests;
