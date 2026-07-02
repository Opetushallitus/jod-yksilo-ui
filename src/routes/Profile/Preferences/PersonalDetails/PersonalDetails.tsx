import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import z from 'zod';

import { InputField, useMediaQueries } from '@jod/design-system';

import { client } from '@/api/client';
import { formErrorMessage } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { useSessionManagerStore } from '@/stores/useSessionManagerStore';

import { Divider, PersonalDetailsInfoBlock, ToggleAllow } from '../../components';
import type { PreferencesLoaderData } from '../loader';

const PersonalDetails = () => {
  const { yksiloData: data, kotikuntaLabel } = useLoaderData<PreferencesLoaderData>();
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const emailFieldId = React.useId();
  const [debouncedEmail, email, setEmail] = useDebounceState<string>(data?.email || '', 500);
  const [emailValid, setEmailValid] = React.useState<boolean | undefined>(undefined);
  const [lastSavedEmail, setLastSavedEmail] = React.useState<string>(data?.email || '');
  const [lupaLuovuttaaTiedotUlkopuoliselle, setLupaLuovuttaaTiedotUlkopuoliselle] = React.useState(
    data?.lupaLuovuttaaTiedotUlkopuoliselle ?? false,
  );
  const [lupaKayttaaTekoalynKoulutukseen, setLupaKayttaaTekoalynKoulutukseen] = React.useState(
    data?.lupaKayttaaTekoalynKoulutukseen ?? false,
  );
  const emailSchema = z.email(formErrorMessage.email()).nonoptional(formErrorMessage.required());
  // For tracking if user has interacted with the email field to prevent effect firing on mount
  const userInputRef = React.useRef(false);

  const firstName = useSessionManagerStore((s) => s.user?.etunimi);
  const lastName = useSessionManagerStore((s) => s.user?.sukunimi);
  const mpassid = React.useMemo(
    () => !(data?.syntymavuosi || data?.kotikunta || data?.sukupuoli),
    [data?.kotikunta, data?.syntymavuosi, data?.sukupuoli],
  );

  const guardedAction = useSessionGuardedAction();

  // Prepare payload for persisting data.
  const getPayload = React.useCallback(() => {
    return {
      ...data,
      email: lastSavedEmail,
      lupaLuovuttaaTiedotUlkopuoliselle,
      lupaKayttaaTekoalynKoulutukseen,
    };
  }, [data, lastSavedEmail, lupaLuovuttaaTiedotUlkopuoliselle, lupaKayttaaTekoalynKoulutukseen]);

  const persist = React.useCallback(
    async (body = getPayload()) => {
      await client.PUT('/api/profiili/yksilo/tiedot-ja-luvat', { body });
    },
    [getPayload],
  );

  // For checking email validity on blur to display form error message
  const checkEmail = React.useCallback(
    (email: string) => {
      setEmailValid(emailSchema.safeParse(email).success);
    },
    [emailSchema],
  );

  // Effect for validating email and saving data when debounced email changes
  React.useEffect(() => {
    if (!userInputRef.current) {
      return;
    }

    const emailIsValid = emailSchema.safeParse(debouncedEmail).success;

    if (emailIsValid) {
      // Keep track of last valid email so that rest of the data can be saved even if email is invalid
      setLastSavedEmail(debouncedEmail);
      setEmailValid(true);
      void persist({ ...getPayload(), email: debouncedEmail });
    }

    // This effect is for saving a valid debounced email only
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, [debouncedEmail]);

  const genderTranslation = React.useMemo(() => {
    if (data?.sukupuoli === 'MIES') {
      return t('personal-details.gender-male');
    } else if (data?.sukupuoli === 'NAINEN') {
      return t('personal-details.gender-female');
    } else {
      return '';
    }
  }, [data?.sukupuoli, t]);

  return (
    <>
      <section className="mb-8" data-testid="personal-details-section">
        <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2" data-testid="personal-details-title">
          {t('preferences.personal-details.title')}
        </h2>
        <div className="mb-5 font-arial text-body-md-mobile sm:text-body-md">
          {t('preferences.personal-details.description')}
        </div>

        <Divider className="mb-4" />
        {data?.syntymavuosi && (
          <>
            <PersonalDetailsInfoBlock
              label={t('personal-details.birthyear')}
              info={`${data.syntymavuosi}`}
              testId="birthyear"
            />
            <Divider className="my-4" />
          </>
        )}
        {data?.kotikunta && (
          <>
            <PersonalDetailsInfoBlock
              label={t('personal-details.home-city')}
              info={kotikuntaLabel}
              testId="home-city"
            />
            <Divider className="my-4" />
          </>
        )}
        {data?.sukupuoli && (
          <>
            <PersonalDetailsInfoBlock label={t('personal-details.gender')} info={genderTranslation} testId="gender" />
            <Divider className="my-4" />
          </>
        )}
        {mpassid && (
          <>
            <PersonalDetailsInfoBlock
              label={t('personal-details.name')}
              info={`${firstName} ${lastName}`}
              testId="name"
            />
            <Divider className="my-4" />
          </>
        )}
        <PersonalDetailsInfoBlock
          label={t('personal-details.email')}
          stack={!sm}
          htmlFor={emailFieldId}
          interactiveComponent={
            <InputField
              id={emailFieldId}
              hideLabel
              requiredText={t('common:required')}
              value={email}
              placeholder="matti.meikalainen@suomi.fi"
              errorMessage={emailValid === false ? formErrorMessage.email().message : undefined}
              onBlur={() => checkEmail(email)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                guardedAction(() => {
                  userInputRef.current = true;
                  setEmail(e.target.value);
                })();
              }}
            />
          }
          testId="email"
        />
      </section>

      <Divider className="mb-7" />

      <section className="mb-8" data-testid="data-disclosure-unanonymized-section">
        <h2 className="mb-3 text-heading-3-mobile sm:text-heading-3" data-testid="data-disclosure-unanonymized-title">
          {t('preferences.data-disclosure-unanonymized.title')}
        </h2>
        <p className="mb-5 font-arial text-body-md">{t('preferences.data-disclosure-unanonymized.description')}</p>
        <div
          className="flex items-center justify-between gap-4 border-b-2 border-[#CCC] py-4"
          data-testid="pref-share-third-parties"
        >
          <div className="flex-1 font-arial">
            <p className="text-form-label">
              {t('preferences.data-disclosure-unanonymized.permission-education-and-planning.title')}
            </p>
            <p className="text-help-mobile sm:text-help">
              {t('preferences.data-disclosure-unanonymized.permission-education-and-planning.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ToggleAllow
              checked={lupaLuovuttaaTiedotUlkopuoliselle}
              onChange={guardedAction(() => {
                const newValue = !lupaLuovuttaaTiedotUlkopuoliselle;
                setLupaLuovuttaaTiedotUlkopuoliselle(newValue);
                void persist({ ...getPayload(), lupaLuovuttaaTiedotUlkopuoliselle: newValue });
              })}
              testId="pref-share-third-parties-toggle"
            />
          </div>
        </div>
        <div
          className="flex items-center justify-between gap-4 border-b-2 border-[#CCC] py-4"
          data-testid="pref-ai-training"
        >
          <div className="flex-1 font-arial">
            <p className="text-form-label">
              {t('preferences.data-disclosure-unanonymized.permission-use-AI-education.title')}
            </p>
            <p className="text-help-mobile sm:text-help">
              {t('preferences.data-disclosure-unanonymized.permission-use-AI-education.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ToggleAllow
              checked={lupaKayttaaTekoalynKoulutukseen}
              onChange={guardedAction(() => {
                const newValue = !lupaKayttaaTekoalynKoulutukseen;
                setLupaKayttaaTekoalynKoulutukseen(newValue);
                void persist({ ...getPayload(), lupaKayttaaTekoalynKoulutukseen: newValue });
              })}
              testId="pref-ai-training-toggle"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default PersonalDetails;
