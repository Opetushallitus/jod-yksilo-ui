import { client } from '@/api/client';
import { components } from '@/api/schema';
import { FormError, OpportunityCard } from '@/components';
import DeletePolkuButton from '@/components/DeletePolkuButton/DeletePolkuButton';
import { formErrorMessage, LIMITS } from '@/constants';
import { useDebounceState } from '@/hooks/useDebounceState';
import VaiheCard from '@/routes/Profile/Path/VaiheCard';
import VaiheModal from '@/routes/Profile/Path/modal/VaiheModal';
import { generateProfileLink, getTypeSlug } from '@/routes/Profile/utils';
import { usePolutStore } from '@/stores/usePolutStore';
import { getLocalizedText } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, InputField, PathProgress, PathProgressStep } from '@jod/design-system';
import React from 'react';
import { Controller, Form, FormProvider, FormSubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdClose, MdOutlineFlag } from 'react-icons/md';
import { useLoaderData, useNavigate, useParams, useRevalidator, useRouteLoaderData } from 'react-router';
import { z } from 'zod';
import { useShallow } from 'zustand/shallow';
import loader from './loader';
import { getDuration, mapOsaaminenToUri, type PolkuForm, type PolkuQueryParams, type VaiheForm } from './utils';

const Path = () => {
  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const mahdollisuus = loaderData?.mahdollisuus;
  const paamaara = loaderData?.paamaara;

  const {
    vaaditutOsaamiset,
    osaamisetFromProfile,
    osaamisetFromVaiheet,
    polku,
    vaiheet,
    setIgnoredOsaamiset,
    setSelectedOsaamiset,
  } = usePolutStore(
    useShallow((state) => ({
      vaaditutOsaamiset: state.vaaditutOsaamiset,
      osaamisetFromProfile: state.osaamisetFromProfile,
      osaamisetFromVaiheet: state.osaamisetFromVaiheet,
      polku: state.polku,
      vaiheet: state.vaiheet,
      setIgnoredOsaamiset: state.setIgnoredOsaamiset,
      setSelectedOsaamiset: state.setSelectedOsaamiset,
    })),
  );

  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { suunnitelmaId, paamaaraId } = useParams<PolkuQueryParams>();
  const revalidator = useRevalidator();
  const formId = React.useId();
  const [osaamisetFromVaiheetAndProfile, setOsaamisetFromVaiheetAndProfile] = React.useState<string[]>([]);
  const [percentage, setPercentage] = React.useState(0);
  const [vaiheIndex, setVaiheIndex] = React.useState<number>();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [allChecked, setAllChecked] = React.useState([...(polku?.osaamiset ?? []), ...osaamisetFromVaiheetAndProfile]);
  const [allDisabled, setAllDisabled] = React.useState(polku?.ignoredOsaamiset ?? []);
  const [disabledIgnores, setDisabledIgnores] = React.useState<string[]>([]);
  const yksiloRootData = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  const navigate = useNavigate();

  const methods = useForm<PolkuForm>({
    mode: 'onBlur',
    resolver: zodResolver(
      z.object({
        id: z.string(),
        nimi: z
          .object({})
          .catchall(
            z
              .string()
              .trim()
              .nonempty(formErrorMessage.required())
              .max(LIMITS.TEXT_INPUT, formErrorMessage.max(LIMITS.TEXT_INPUT)),
          ),
        osaamiset: z.array(z.object({ uri: z.string().optional() })),
        ignoredOsaamiset: z.array(z.object({ uri: z.string().optional() })),
      }),
    ),
    defaultValues: async () => {
      return Promise.resolve({
        id: polku?.id ?? '',
        nimi: polku?.nimi ?? {},
        osaamiset:
          polku?.osaamiset?.map((uri) => ({ uri })) ??
          osaamisetFromProfile.map((osaaminen) => ({ uri: osaaminen.uri })), // When creating a new polku, populate osaamiset from profile.
        ignoredOsaamiset: polku?.ignoredOsaamiset?.map((uri) => ({ uri })) ?? [],
      });
    },
  });

  const osaamisetArray = useFieldArray({ control: methods.control, name: 'osaamiset' });
  const ignoredOsaamisetArray = useFieldArray({ control: methods.control, name: 'ignoredOsaamiset' });

  const selectedOsaamisetValues = React.useMemo(
    () => osaamisetArray.fields.map((osaaminen) => osaaminen.uri).filter(Boolean) ?? [],
    [osaamisetArray.fields],
  ) as string[];
  const ignoredOsaamisetValues = React.useMemo(
    () => ignoredOsaamisetArray.fields.map((osaaminen) => osaaminen.uri).filter(Boolean) ?? [],
    [ignoredOsaamisetArray.fields],
  ) as string[];

  const [debouncedValue, , setDebouncedValue] = useDebounceState(methods.watch(), 1000);

  const getFirstStep = () => ({
    label: '',
    circleComponent: 1,
    content: (
      <div>
        <Button variant="accent" label={t('profile.paths.add-phase-yourself')} onClick={() => openModal(0)} />
      </div>
    ),
  });

  const getProgressStep = (vaihe: VaiheForm, index: number): PathProgressStep => ({
    label: getLocalizedText(vaihe.nimi),
    circleComponent: index + 1,
    isCompleted: vaihe.valmis,
    content: (
      <div className="flex flex-col gap-5">
        <VaiheCard
          vaihe={vaihe}
          totalSteps={vaaditutOsaamiset.length}
          setVaiheComplete={() => toggleVaiheCompleted(index)}
          openVaiheModal={() => openModal(index)}
        />
        {index === vaiheet.length - 1 && (
          <div>
            <Button
              variant="accent"
              label={t('profile.paths.add-phase-yourself')}
              onClick={() => openModal(index + 1)}
              disabled={percentage === 100}
            />
          </div>
        )}
      </div>
    ),
  });

  const getLastStep = () => ({
    label: '',
    circleComponent: <MdOutlineFlag size={24} />,
    isCompleted: vaiheet.length > 0 && vaiheet.every((vaihe) => vaihe.valmis),
    content: (
      <div className="text-heading-3">
        {vaiheet.length > 0
          ? `${t('profile.paths.total-duration')}: ${getTotalTime()}`
          : `${t('profile.paths.total-duration')}: ${t('profile.paths.add-phase-for-total-duration')}`}
      </div>
    ),
  });

  /*
    Checked osaamiset includes osaamiset that:
      - User has selected via checkboxes (selectedOsaamiset = data from API)
      - Come from vaiheet that are marked as valmis
      - Come from users profile
  */
  React.useEffect(() => {
    setAllChecked(
      Array.from(
        new Set([
          ...selectedOsaamisetValues,
          ...osaamisetFromVaiheet.map(mapOsaaminenToUri),
          // ...osaamisetFromProfile.map(mapOsaaminenToUri),
        ]),
      ),
    );
  }, [osaamisetFromVaiheet, selectedOsaamisetValues]);

  /*
    Disabled osaamiset includes osaamiset that:
      - Come from vaiheet that are marked as valmis
      - Come from users profile
      - Are ignored

    If user has selected osaaminen manually, it should not be disabled
  */
  React.useEffect(() => {
    setAllDisabled([...ignoredOsaamisetValues, ...osaamisetFromVaiheet.map(mapOsaaminenToUri)]);
  }, [ignoredOsaamisetValues, osaamisetFromVaiheet]);

  /*
    Disabled ignores (Älä huomioi) includes osaamiset that:
      - Come from vaiheet that are marked as valmis
      - Come from users profile
  */
  React.useEffect(() => {
    setDisabledIgnores([...osaamisetFromVaiheet.map(mapOsaaminenToUri)]);
  }, [osaamisetFromVaiheet]);

  const toggleVaiheCompleted = async (index: number) => {
    const vaihe = vaiheet[index];

    await client.PUT('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}/vaiheet/{vaiheId}', {
      params: {
        path: {
          vaiheId: vaihe.id!,
          id: paamaaraId!,
          suunnitelmaId: suunnitelmaId!,
        },
      },
      body: {
        ...vaihe,
        valmis: !vaihe.valmis,
        linkit: vaihe.linkit?.map((link) => link.url) ?? [],
        osaamiset: vaihe.osaamiset?.map((osaaminen) => osaaminen.uri) ?? [],
      },
    });
    await revalidator.revalidate();
  };

  React.useEffect(() => {
    setTimeout(() => methods.trigger('nimi'));
  }, [methods]);

  React.useEffect(() => {
    const max = vaaditutOsaamiset.length - ignoredOsaamisetValues.length;
    setPercentage(Math.round((allChecked.length / max) * 100));
  }, [allChecked.length, ignoredOsaamisetValues.length, vaaditutOsaamiset.length]);

  React.useEffect(() => {
    setOsaamisetFromVaiheetAndProfile([
      ...osaamisetFromVaiheet.map(mapOsaaminenToUri),
      ...osaamisetFromProfile.map(mapOsaaminenToUri),
    ]);
  }, [osaamisetFromProfile, osaamisetFromVaiheet, vaaditutOsaamiset]);
  const { mahdollisuusId } = paamaara ?? {};

  const save = async (data: PolkuForm) => {
    if (!paamaaraId || !suunnitelmaId) {
      return;
    }
    await client.PUT('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}', {
      params: { path: { id: paamaaraId, suunnitelmaId } },
      body: {
        id: data.id,
        nimi: data.nimi,
        ignoredOsaamiset: ignoredOsaamisetValues,
        osaamiset: selectedOsaamisetValues,
      },
    });
  };

  React.useEffect(() => {
    methods.handleSubmit(save)();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, methods]);

  if (!paamaara) {
    return null;
  }

  const getTotalTime = () => {
    const { startTime, endTime } = vaiheet.reduce(
      (acc, vaihe) => {
        const start = new Date(vaihe.alkuPvm);
        const end = new Date(vaihe.loppuPvm);
        return {
          startTime: acc.startTime ? Math.min(acc.startTime, start.getTime()) : start.getTime(),
          endTime: acc.endTime ? Math.max(acc.endTime, end.getTime()) : end.getTime(),
        };
      },
      { startTime: Number.MAX_SAFE_INTEGER, endTime: Number.MIN_SAFE_INTEGER },
    );
    const { months, years } = getDuration(startTime, endTime);
    return years === 0
      ? t('profile.paths.n-months', { count: months })
      : `${t('profile.paths.n-years', { count: years })} ${t('profile.paths.n-months', { count: months })}`;
  };

  const onIgnoreChange = async (osaaminenUri: string) => {
    const idx = ignoredOsaamisetArray.fields.findIndex((osaaminen) => osaaminen.uri === osaaminenUri);

    if (idx > -1) {
      ignoredOsaamisetArray.remove(idx);
    } else {
      ignoredOsaamisetArray.append({ uri: osaaminenUri });

      // When ignoring, remove from selected osaamiset if present
      const osaaminenIdx = osaamisetArray.fields.findIndex((osaaminen) => osaaminen.uri === osaaminenUri);
      if (osaaminenIdx > -1) {
        osaamisetArray.remove(osaaminenIdx);
      }
    }

    setDebouncedValue(methods.watch());
    setIgnoredOsaamiset(ignoredOsaamisetValues);
  };

  const onOsaaminenChange = async (osaaminenUri: string) => {
    const osaaminenIdx = osaamisetArray.fields.findIndex((osaaminen) => osaaminen.uri === osaaminenUri);
    if (osaaminenIdx > -1) {
      osaamisetArray.remove(osaaminenIdx);
    } else {
      osaamisetArray.append({ uri: osaaminenUri });
    }
    setDebouncedValue(methods.watch());
    setSelectedOsaamiset(selectedOsaamisetValues);
  };

  const openModal = (idx: number) => {
    setVaiheIndex(idx);
    setModalOpen(true);
  };

  const onCloseModal = async (isCancel: boolean) => {
    if (!isCancel) {
      await revalidator.revalidate();
    }
    setModalOpen(false);
    setVaiheIndex(undefined);
  };

  const onSubmit: FormSubmitHandler<PolkuForm> = async ({ data }: { data: PolkuForm }) => {
    const { errors } = methods.formState;
    const isValid = !errors || Object.keys(errors).length === 0;

    if (isValid) {
      await save(data);
    }
  };

  const closePolku = () => {
    const route = generateProfileLink(['slugs.profile.my-goals'], yksiloRootData, language, t);
    navigate(route.to);
  };

  return (
    <div>
      {modalOpen && typeof vaiheIndex === 'number' && (
        <VaiheModal
          isOpen={modalOpen}
          vaiheIndex={vaiheIndex}
          onClose={(isCancel) => void onCloseModal(isCancel ?? false)}
        />
      )}
      <FormProvider {...methods}>
        <Form className="flex flex-col gap-5" id={formId} onSubmit={onSubmit}>
          {/* Päämäärä */}
          <div className="bg-bg-gray pt-7 flex flex-col gap-5 w-full max-w-[1090px] mx-auto">
            <div className="flex flex-row items-center gap-3 justify-between">
              <h1 className="text-heading-1-mobile sm:text-heading-1">{t('profile.paths.title')}</h1>
              <button
                type="button"
                onClick={closePolku}
                className="cursor-pointer self-start"
                aria-label={t('profile.paths.back-to-goals')}
              >
                <MdClose size={24} />
              </button>
            </div>
            <p className="text-body-lg font-medium mb-5">{t('profile.paths.description')}</p>
            <div className="my-7 flex flex-col gap-3">
              <InputField
                label={t('profile.paths.plan-name')}
                {...methods.register(`nimi.${language}` as const)}
                onBlur={methods.handleSubmit(save)}
              />
              <FormError name={`nimi.${language}`} errors={methods.formState.errors} />
            </div>
            <div className="flex flex-col gap-5 mb-5">
              <span className="text-form-label">{t('profile.paths.goal')}</span>
              {paamaara ? (
                <div className="flex flex-col gap-5 mb-9">
                  <OpportunityCard
                    to={`/${language}/${getTypeSlug(paamaara.mahdollisuusTyyppi)}/${mahdollisuusId}`}
                    description={getLocalizedText(mahdollisuus?.tiivistelma)}
                    employmentOutlook={2}
                    industryName="TODO: Lorem ipsum dolor"
                    mostCommonEducationBackground="TODO: Lorem ipsum dolor"
                    name={getLocalizedText(mahdollisuus?.otsikko)}
                    trend="LASKEVA"
                    type={paamaara.mahdollisuusTyyppi}
                    hasRestrictions
                    hideFavorite
                  />
                  {getLocalizedText(paamaara.tavoite) ? (
                    <>
                      <div className="text-form-label">{t('profile.my-goals.goal-description')}</div>
                      <div>{getLocalizedText(paamaara.tavoite)}</div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          {/* Suunnitelma */}
          <div className="flex flex-col bg-bg-gray-2 p-9">
            <div className="w-full max-w-[1090px] mx-auto">
              <h2 className="text-heading-2 pb-7">{t('profile.paths.plan')}</h2>
              <div className="flex flex-col gap-5">
                <PathProgress
                  steps={
                    vaiheet.length === 0
                      ? [getFirstStep(), getLastStep()]
                      : [...vaiheet.map((vaihe, index) => getProgressStep(vaihe, index)), getLastStep()]
                  }
                />
              </div>
            </div>
          </div>
          {/* Osaamisen kehittyminen */}
          <div className="flex flex-col bg-bg-gray pt-8 w-full max-w-[1090px] mx-auto">
            <div className="flex flex-col w-full max-w-[1019px] mx-auto">
              <div className="flex flex-row items-center gap-3">
                <h2 className="text-heading-1">{t('profile.paths.skill-progress')}</h2>
                <div className="grow text-body-lg">
                  ({allChecked.length}/
                  {t('count-competences', { count: vaaditutOsaamiset.length - ignoredOsaamisetValues.length })})
                </div>
                <div className="text-heading-3">{percentage}%</div>
              </div>
              {/* Progress bar */}
              <div className="relative w-full h-6 mb-11">
                <div className="bg-bg-gray-2 w-full h-6 my-6 absolute" />
                <div className="transition-all bg-[#00A8B3] h-6 my-6 absolute" style={{ width: `${percentage}%` }} />
              </div>
            </div>
            {/* Osaamiset */}
            <div>
              <table className="w-full" border={0} cellPadding={0} cellSpacing={0}>
                <thead className="bg-white">
                  <tr className="text-body-md text-left align-middle">
                    <th scope="col" className="font-arial text-form-label p-4">
                      {t('competence')}
                    </th>
                    <th scope="col" className="font-arial text-form-label">
                      {t('profile.paths.your-competences')}
                    </th>
                    <th scope="col" className="font-arial text-form-label">
                      {t('profile.paths.ignore')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vaaditutOsaamiset.map((osaaminen, i) => {
                    const name = getLocalizedText(osaaminen.nimi);
                    const uri = osaaminen.uri;
                    return (
                      <tr key={osaaminen.uri} className={i % 2 !== 0 ? 'bg-white bg-opacity-60' : 'bg-bg-gray-2'}>
                        <td className="p-3 font-arial first-letter:capitalize text-body-md">{name}</td>
                        <td className="text-center">
                          <Controller
                            control={methods.control}
                            name={`osaamiset.${i}.uri`}
                            render={({ field }) => (
                              <Checkbox
                                {...field}
                                name={name}
                                value={osaaminen.uri}
                                variant="bordered"
                                disabled={allDisabled.includes(uri)}
                                checked={
                                  osaamisetArray.fields.some((osaaminen) => osaaminen.uri === uri) ||
                                  allDisabled.includes(uri)
                                }
                                label={
                                  osaamisetFromVaiheet.map((o) => o.uri).includes(uri)
                                    ? t('profile.paths.added-to-path')
                                    : t('profile.paths.has-competence')
                                }
                                ariaLabel={name}
                                onChange={() => onOsaaminenChange(uri)}
                              />
                            )}
                          />
                        </td>
                        <td>
                          <Controller
                            control={methods.control}
                            name={`ignoredOsaamiset.${i}.uri`}
                            render={({ field }) => (
                              <Checkbox
                                {...field}
                                value={uri}
                                variant="bordered"
                                checked={ignoredOsaamisetArray.fields.some((osaaminen) => osaaminen.uri === uri)}
                                disabled={disabledIgnores.includes(uri)}
                                ariaLabel={`${t('profile.paths.ignore')} ${name}`}
                                onChange={() => onIgnoreChange(uri)}
                              />
                            )}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <DeletePolkuButton
              paamaaraId={paamaaraId}
              suunnitelmaId={suunnitelmaId}
              onDelete={() => closePolku()}
              className="my-9"
            />
          </div>
        </Form>
      </FormProvider>
    </div>
  );
};

export default Path;
