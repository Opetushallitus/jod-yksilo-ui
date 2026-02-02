import { client } from '@/api/client';
import { components } from '@/api/schema';
import { CheckboxAccordion } from '@/components/CheckboxAccordion';
import { getLocalizedText } from '@/utils';
import { Checkbox, Spinner } from '@jod/design-system';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ShareLinkForm } from './types';

export const DataToShareStep = () => {
  const { t, i18n } = useTranslation();
  const [tyopaikat, setTyopaikat] = React.useState<components['schemas']['TyopaikkaDto'][]>([]);
  const [koulut, setKoulut] = React.useState<components['schemas']['KoulutusKokonaisuusDto'][]>([]);
  const [toiminnot, setToiminnot] = React.useState<components['schemas']['ToimintoDto'][]>([]);
  const [kiinnostukset, setKiinnostukset] = React.useState<components['schemas']['KiinnostuksetDto']>();
  const [muuOsaaminen, setMuuOsaaminen] = React.useState<components['schemas']['MuuOsaaminenDto']>();
  const [suosikit, setSuosikit] = React.useState<components['schemas']['SuosikkiDto'][]>([]);
  const [tavoitteet, setTavoitteet] = React.useState<components['schemas']['TavoiteDto'][]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { control, setValue, getValues, trigger, watch } = useFormContext<ShareLinkForm>();

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        client.GET('/api/profiili/tyopaikat').then((res) => setTyopaikat(res.data ?? [])),
        client.GET('/api/profiili/koulutuskokonaisuudet').then((res) => setKoulut(res.data ?? [])),
        client.GET('/api/profiili/vapaa-ajan-toiminnot').then((res) => setToiminnot(res.data ?? [])),
        client.GET('/api/profiili/suosikit').then((res) => setSuosikit(res.data ?? [])),
        client.GET('/api/profiili/kiinnostukset/osaamiset').then((res) => setKiinnostukset(res.data)),
        client.GET('/api/profiili/muu-osaaminen').then((res) => setMuuOsaaminen(res.data)),
        client.GET('/api/profiili/tavoitteet').then((res) => setTavoitteet(res?.data ?? [])),
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const availableSuosikkiTypes = React.useMemo(() => Array.from(new Set(suosikit.map((s) => s.tyyppi))), [suosikit]);

  const hasMuuOsaaminen = React.useMemo(
    () =>
      (Array.isArray(muuOsaaminen?.muuOsaaminen) && muuOsaaminen?.muuOsaaminen?.length > 0) ||
      muuOsaaminen?.vapaateksti !== undefined,
    [muuOsaaminen],
  );
  const muuOsaaminenJaettu = watch('muuOsaaminenJaettu');

  const hasKiinnostukset = React.useMemo(() => {
    return (
      (Array.isArray(kiinnostukset?.kiinnostukset) && kiinnostukset?.kiinnostukset?.length > 0) ||
      kiinnostukset?.vapaateksti !== undefined
    );
  }, [kiinnostukset]);
  const kiinnostuksetJaettu = watch('kiinnostuksetJaettu');

  const {
    fields: jaetutTyopaikatFields,
    append: appendTyopaikat,
    remove: removeTyopaikat,
  } = useFieldArray({
    control,
    name: 'jaetutTyopaikat',
  });
  const {
    fields: jaetutKoulutuksetFields,
    append: appendKoulutukset,
    remove: removeKoulutukset,
  } = useFieldArray({
    control,
    name: 'jaetutKoulutukset',
  });
  const {
    fields: jaetutToiminnotFields,
    append: appendToiminnot,
    remove: removeToiminnot,
  } = useFieldArray({
    control,
    name: 'jaetutToiminnot',
  });
  const {
    fields: jaetutSuosikitFields,
    append: appendSuosikit,
    remove: removeSuosikit,
  } = useFieldArray({
    control,
    name: 'jaetutSuosikit',
  });
  const {
    fields: jaetutTavoitteetFields,
    append: appendTavoitteet,
    remove: removeTavoitteet,
  } = useFieldArray({
    control,
    name: 'jaetutTavoitteet',
  });

  type ArrayFields = 'tyopaikat' | 'koulutukset' | 'toiminnot' | 'suosikit' | 'tavoitteet';

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const onChangeSingleSelection = (field: ArrayFields, id: string) => {
    switch (field) {
      case 'tyopaikat':
        {
          const existingIndex = jaetutTyopaikatFields.findIndex((item) => item.itemId === id);
          if (existingIndex > -1) {
            removeTyopaikat(existingIndex);
          } else {
            appendTyopaikat({ itemId: id });
          }
        }
        break;
      case 'koulutukset':
        {
          const existingIndex = jaetutKoulutuksetFields.findIndex((item) => item.itemId === id);
          if (existingIndex > -1) {
            removeKoulutukset(existingIndex);
          } else {
            appendKoulutukset({ itemId: id });
          }
        }
        break;
      case 'toiminnot':
        {
          const existingIndex = jaetutToiminnotFields.findIndex((item) => item.itemId === id);
          if (existingIndex > -1) {
            removeToiminnot(existingIndex);
          } else {
            appendToiminnot({ itemId: id });
          }
        }
        break;
      case 'tavoitteet':
        {
          const existingIndex = jaetutTavoitteetFields.findIndex((item) => item.itemId === id);
          if (existingIndex > -1) {
            removeTavoitteet(existingIndex);
          } else {
            appendTavoitteet({ itemId: id });
          }
        }
        break;
      case 'suosikit':
        {
          // For suosikit, the id is either TYOMAHDOLLISUUS or KOULUTUSMAHDOLLISUUS
          const existingIndex = jaetutSuosikitFields.findIndex((item) => item.itemId === id);
          if (existingIndex > -1) {
            removeSuosikit(existingIndex);
          } else {
            appendSuosikit({ itemId: id });
          }
        }
        break;
      default:
        break;
    }
  };

  const handleTopLevelChange = (
    /** Append function for specific form array */
    append: (value: { itemId: string }) => void,
    /** Remove function for specific form array */
    remove: (index: number) => void,
    /** Current form array values */
    formArray: { itemId: string }[],
    /** Ids of source data, for adding to form array */
    dataArray: { id: string }[],
  ) => {
    // If all are checked, uncheck all
    if (areAllChecked(formArray, dataArray)) {
      for (let i = formArray.length - 1; i >= 0; i--) {
        remove(i);
      }
    }
    // If some are checked, check all
    else if (areSomeChecked(formArray, dataArray)) {
      for (const item of dataArray) {
        if (!isChecked(formArray, item.id)) {
          append({ itemId: item.id });
        }
      }
    }
    // If none are checked, check all
    else {
      for (const item of dataArray) {
        append({ itemId: item.id });
      }
    }
  };

  const isChecked = (array: { itemId: string }[], id: string) => array.some((item) => item.itemId === id);
  const areAllChecked = (formArray: { itemId: string }[], dataArray: { id: string }[]) =>
    dataArray.length > 0 && dataArray.every((item) => isChecked(formArray, item.id));
  const areSomeChecked = (formArray: { itemId: string }[], dataArray: { id: string }[]) => {
    const checkedCount = dataArray.filter((item) => isChecked(formArray, item.id)).length;
    return checkedCount > 0 && checkedCount < dataArray.length;
  };
  const onChangeTopLevel = (field: keyof ShareLinkForm) => () => {
    if (field === 'jaetutTyopaikat') {
      handleTopLevelChange(
        appendTyopaikat,
        removeTyopaikat,
        jaetutTyopaikatFields,
        tyopaikat.map((tp) => ({ id: tp.id! })),
      );
    } else if (field === 'jaetutKoulutukset') {
      handleTopLevelChange(
        appendKoulutukset,
        removeKoulutukset,
        jaetutKoulutuksetFields,
        koulut.map((koulutus) => ({ id: koulutus.id! })),
      );
    } else if (field === 'jaetutToiminnot') {
      handleTopLevelChange(
        appendToiminnot,
        removeToiminnot,
        jaetutToiminnotFields,
        toiminnot.map((toiminto) => ({ id: toiminto.id! })),
      );
    } else if (field === 'jaetutSuosikit') {
      handleTopLevelChange(
        appendSuosikit,
        removeSuosikit,
        jaetutSuosikitFields,
        availableSuosikkiTypes.map((suosikki) => ({ id: suosikki })),
      );
    } else if (field === 'jaetutTavoitteet') {
      handleTopLevelChange(
        appendTavoitteet,
        removeTavoitteet,
        jaetutTavoitteetFields,
        tavoitteet.map((tavoite) => ({ id: tavoite.id! })),
      );
    }
  };

  const basicInfoFields: (keyof ShareLinkForm)[] = [
    'emailJaettu',
    'kotikuntaJaettu',
    'nimiJaettu',
    'syntymavuosiJaettu',
  ];

  const getBasicInfoValues = (): boolean[] => basicInfoFields.map((field) => (getValues(field) as boolean) ?? false);
  const areAllBasicInfoChecked = () => getBasicInfoValues().every(Boolean);
  const areSomeBasicInfoChecked = () => getBasicInfoValues().some(Boolean);
  const onChangeSingleBasicInfo = (field: keyof ShareLinkForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(field, event.target.checked, { shouldValidate: true });
  };

  const mapToIds = (data: { id?: string }) => ({ id: data.id! });

  return isLoading ? (
    <div className="flex justify-center items-center w-full h-[128px]">
      <Spinner size={48} color="accent" />
    </div>
  ) : (
    <>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        {t('preferences.share.modal.data-to-share.description')}
      </p>
      <div className="flex flex-col gap-4">
        <CheckboxAccordion
          initiallyOpen
          checked={areAllBasicInfoChecked()}
          indeterminate={areSomeBasicInfoChecked() && !areAllBasicInfoChecked()}
          label={t('preferences.share.modal.basic-info.title')}
          onChange={() => {
            if (areAllBasicInfoChecked()) {
              for (const field of basicInfoFields) {
                setValue(field, false);
              }
            } else {
              for (const field of basicInfoFields) {
                setValue(field, true);
              }
            }
            trigger(basicInfoFields);
          }}
        >
          <ul className="flex flex-col gap-5 mt-4">
            <li>
              <Checkbox
                name="nimiJaettu"
                label={t('preferences.share.modal.basic-info.name')}
                ariaLabel={t('preferences.share.modal.basic-info.name')}
                value="nimiJaettu"
                checked={getValues('nimiJaettu') || false}
                onChange={onChangeSingleBasicInfo('nimiJaettu')}
              />
            </li>
            <li>
              <Checkbox
                name="syntymavuosiJaettu"
                label={t('preferences.share.modal.basic-info.birthyear')}
                ariaLabel={t('preferences.share.modal.basic-info.birthyear')}
                value="syntymavuosiJaettu"
                checked={getValues('syntymavuosiJaettu') || false}
                onChange={onChangeSingleBasicInfo('syntymavuosiJaettu')}
              />
            </li>
            <li>
              <Checkbox
                name="emailJaettu"
                label={t('preferences.share.modal.basic-info.email')}
                ariaLabel={t('preferences.share.modal.basic-info.email')}
                value="emailJaettu"
                checked={getValues('emailJaettu') || false}
                onChange={onChangeSingleBasicInfo('emailJaettu')}
              />
            </li>
            <li>
              <Checkbox
                name="kotikuntaJaettu"
                label={t('preferences.share.modal.basic-info.home-city')}
                ariaLabel={t('preferences.share.modal.basic-info.home-city')}
                value="kotikuntaJaettu"
                checked={getValues('kotikuntaJaettu') || false}
                onChange={onChangeSingleBasicInfo('kotikuntaJaettu')}
              />
            </li>
          </ul>
        </CheckboxAccordion>

        <CheckboxAccordion
          initiallyOpen={false}
          label={t('preferences.share.modal.data-to-share.work')}
          checked={areAllChecked(jaetutTyopaikatFields, tyopaikat.map(mapToIds))}
          indeterminate={areSomeChecked(jaetutTyopaikatFields, tyopaikat.map(mapToIds))}
          onChange={onChangeTopLevel('jaetutTyopaikat')}
          disabled={tyopaikat.length === 0}
        >
          <ul className="flex flex-col gap-5 mt-4">
            {tyopaikat.map((tp) => (
              <li key={tp.id}>
                <Checkbox
                  name={`${tp.id}-checkbox`}
                  label={tp.nimi[i18n.language]}
                  ariaLabel={tp.nimi[i18n.language]}
                  value={tp.id!}
                  checked={isChecked(jaetutTyopaikatFields, tp.id!)}
                  onChange={() => onChangeSingleSelection('tyopaikat', tp.id!)}
                />
              </li>
            ))}
          </ul>
        </CheckboxAccordion>

        <CheckboxAccordion
          initiallyOpen={false}
          label={t('preferences.share.modal.data-to-share.education')}
          checked={areAllChecked(jaetutKoulutuksetFields, koulut.map(mapToIds))}
          indeterminate={areSomeChecked(jaetutKoulutuksetFields, koulut.map(mapToIds))}
          onChange={onChangeTopLevel('jaetutKoulutukset')}
          disabled={koulut.length === 0}
        >
          <ul className="flex flex-col gap-5 mt-4">
            {koulut.map((koulutus) => (
              <li key={koulutus.id}>
                <Checkbox
                  name={koulutus.nimi[i18n.language]}
                  label={koulutus.nimi[i18n.language]}
                  ariaLabel={koulutus.nimi[i18n.language]}
                  value={koulutus.id!}
                  checked={isChecked(jaetutKoulutuksetFields, koulutus.id!)}
                  onChange={() => onChangeSingleSelection('koulutukset', koulutus.id!)}
                />
              </li>
            ))}
          </ul>
        </CheckboxAccordion>

        <CheckboxAccordion
          initiallyOpen={false}
          label={t('preferences.share.modal.data-to-share.activities')}
          checked={areAllChecked(jaetutToiminnotFields, toiminnot.map(mapToIds))}
          indeterminate={areSomeChecked(jaetutToiminnotFields, toiminnot.map(mapToIds))}
          onChange={onChangeTopLevel('jaetutToiminnot')}
          disabled={toiminnot.length === 0}
        >
          <ul className="flex flex-col gap-5 mt-4">
            {toiminnot.map((toiminto) => (
              <li key={toiminto.id}>
                <Checkbox
                  name={toiminto.nimi[i18n.language]}
                  label={toiminto.nimi[i18n.language]}
                  ariaLabel={toiminto.nimi[i18n.language]}
                  value={toiminto.id!}
                  checked={isChecked(jaetutToiminnotFields, toiminto.id!)}
                  onChange={() => onChangeSingleSelection('toiminnot', toiminto.id!)}
                />
              </li>
            ))}
          </ul>
        </CheckboxAccordion>

        <Checkbox
          name="muuOsaaminenJaettu"
          label={t('preferences.share.modal.data-to-share.something-else')}
          ariaLabel={t('preferences.share.modal.data-to-share.something-else')}
          value="muuOsaaminenJaettu"
          checked={muuOsaaminenJaettu || false}
          onChange={(e) => setValue('muuOsaaminenJaettu', e.target.checked)}
          disabled={!hasMuuOsaaminen}
        />

        <Checkbox
          name="kiinnostuksetJaettu"
          label={t('preferences.share.modal.data-to-share.interests')}
          ariaLabel={t('preferences.share.modal.data-to-share.interests')}
          value="kiinnostuksetJaettu"
          checked={kiinnostuksetJaettu || false}
          onChange={(e) => setValue('kiinnostuksetJaettu', e.target.checked)}
          disabled={!hasKiinnostukset}
        />

        <CheckboxAccordion
          initiallyOpen={false}
          label={t('preferences.share.modal.data-to-share.favorites')}
          disabled={availableSuosikkiTypes.length === 0}
          checked={areAllChecked(
            jaetutSuosikitFields,
            availableSuosikkiTypes.map((suosikki) => ({ id: suosikki })),
          )}
          indeterminate={areSomeChecked(
            jaetutSuosikitFields,
            availableSuosikkiTypes.map((suosikki) => ({ id: suosikki })),
          )}
          onChange={onChangeTopLevel('jaetutSuosikit')}
        >
          <ul className="flex flex-col gap-5 mt-4">
            {availableSuosikkiTypes.map((suosikkiTyyppi) => {
              const label =
                suosikkiTyyppi === 'TYOMAHDOLLISUUS'
                  ? t('preferences.share.modal.data-to-share.favorite-job-opportunities')
                  : t('preferences.share.modal.data-to-share.favorite-education-opportunities');
              return (
                <li key={suosikkiTyyppi}>
                  <Checkbox
                    name={`${label}-checkbox`}
                    label={label}
                    ariaLabel={label}
                    value={label}
                    checked={isChecked(jaetutSuosikitFields, suosikkiTyyppi)}
                    onChange={() => onChangeSingleSelection('suosikit', suosikkiTyyppi)}
                  />
                </li>
              );
            })}
          </ul>
        </CheckboxAccordion>

        {/* Tavoitteet */}
        <CheckboxAccordion
          initiallyOpen={false}
          label={t('preferences.share.modal.data-to-share.goals')}
          checked={areAllChecked(jaetutTavoitteetFields, tavoitteet.map(mapToIds))}
          indeterminate={areSomeChecked(jaetutTavoitteetFields, tavoitteet.map(mapToIds))}
          onChange={onChangeTopLevel('jaetutTavoitteet')}
          disabled={tavoitteet.length === 0}
        >
          <ul>
            {tavoitteet.map((tavoite) => (
              <li key={tavoite.id}>
                <Checkbox
                  name={getLocalizedText(tavoite.tavoite)}
                  label={getLocalizedText(tavoite.tavoite) ?? tavoite.id!}
                  ariaLabel={getLocalizedText(tavoite.tavoite)}
                  value={tavoite.id!}
                  checked={isChecked(jaetutTavoitteetFields, tavoite.id!)}
                  onChange={() => onChangeSingleSelection('tavoitteet', tavoite.id!)}
                />
              </li>
            ))}
          </ul>
        </CheckboxAccordion>
      </div>
    </>
  );
};
