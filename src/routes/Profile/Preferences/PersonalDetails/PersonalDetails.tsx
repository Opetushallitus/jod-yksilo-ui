import { client } from '@/api/client';
import { formErrorMessage } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import type { LanguageValue } from '@/i18n/config';
import { Combobox, InputField, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import z from 'zod';
import { Divider, PersonalDetailsInfoBlock, ToggleAllow } from '../../components';
import type { PreferencesLoaderData } from '../loader';

const PersonalDetails = () => {
  const { yksiloData: data, kotikuntaLabel } = useLoaderData<PreferencesLoaderData>();
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const [aidinkieli, setAidinkieli] = React.useState<LanguageValue>(data?.aidinkieli as LanguageValue);
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

  // Prepare payload for persisting data.
  const getPayload = React.useCallback(() => {
    return {
      ...data,
      aidinkieli: aidinkieli,
      email: lastSavedEmail,
      lupaLuovuttaaTiedotUlkopuoliselle,
      lupaKayttaaTekoalynKoulutukseen,
    };
  }, [aidinkieli, data, lastSavedEmail, lupaLuovuttaaTiedotUlkopuoliselle, lupaKayttaaTekoalynKoulutukseen]);

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
      persist({ ...getPayload(), email: debouncedEmail });
    }

    // This effect is for saving a valid debounced email only
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <section className="mb-8">
        <h3 className="text-heading-3-mobile sm:text-heading-3 mb-3">
          {t('preferences.data-disclosure-unanonymized.title')}
        </h3>
        <p className="font-arial text-body-md mb-5">{t('preferences.data-disclosure-unanonymized.description')}</p>
        <div
          className="flex items-center justify-between gap-4 py-4 border-b-2 border-[#CCC]"
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
              onChange={() => {
                const newValue = !lupaLuovuttaaTiedotUlkopuoliselle;
                setLupaLuovuttaaTiedotUlkopuoliselle(newValue);
                persist({ ...getPayload(), lupaLuovuttaaTiedotUlkopuoliselle: newValue });
              }}
            />
          </div>
        </div>
        <div
          className="flex items-center justify-between gap-4 py-4 border-b-2 border-[#CCC]"
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
              onChange={() => {
                const newValue = !lupaKayttaaTekoalynKoulutukseen;
                setLupaKayttaaTekoalynKoulutukseen(newValue);
                persist({ ...getPayload(), lupaKayttaaTekoalynKoulutukseen: newValue });
              }}
            />
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-heading-2-mobile sm:text-heading-2">{t('preferences.personal-details.title')}</h2>
        <div className="font-arial sm:text-body-md text-body-md-mobile mb-5">
          {t('preferences.personal-details.description')}
        </div>

        <Divider className="mb-4" />
        {data?.syntymavuosi && (
          <>
            <PersonalDetailsInfoBlock label={t('personal-details.birthyear')} info={`${data.syntymavuosi}`} />
            <Divider className="my-4" />
          </>
        )}
        {data?.kotikunta && (
          <>
            <PersonalDetailsInfoBlock label={t('personal-details.home-city')} info={kotikuntaLabel} />
            <Divider className="my-4" />
          </>
        )}
        {data?.sukupuoli && (
          <>
            <PersonalDetailsInfoBlock label={t('personal-details.gender')} info={genderTranslation} />
            <Divider className="my-4" />
          </>
        )}
        <PersonalDetailsInfoBlock
          label={t('personal-details.mother-tongue')}
          stack={!sm}
          interactiveComponent={
            <Combobox<LanguageValue, { label: string; value: LanguageValue }>
              className="w-full"
              label={t('personal-details.choose-mother-tongue')}
              hideLabel
              selected={aidinkieli}
              defaultValue={data?.aidinkieli as LanguageValue}
              options={[
                { label: 'Suomi', value: 'fi' },
                { label: 'Svenska', value: 'sv' },
                { label: 'English', value: 'en' },
              ]}
              onChange={(val) => {
                if (val) {
                  setAidinkieli(val);
                  persist({ ...getPayload(), aidinkieli: val });
                }
              }}
              placeholder={t('personal-details.choose-mother-tongue')}
            />
          }
        />
        <Divider className="my-4" />
        <PersonalDetailsInfoBlock
          label={t('personal-details.email')}
          stack={!sm}
          interactiveComponent={
            <InputField
              hideLabel
              value={email}
              placeholder="matti.meikalainen@suomi.fi"
              errorMessage={emailValid === false ? formErrorMessage.email().message : ''}
              onBlur={() => checkEmail(email)}
              onChange={(e) => {
                userInputRef.current = true;
                setEmail(e.target.value);
              }}
            />
          }
        />
      </section>
    </>
  );
};

export default PersonalDetails;
