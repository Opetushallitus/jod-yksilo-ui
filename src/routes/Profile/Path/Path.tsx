import { client } from '@/api/client';
import { components } from '@/api/schema';
import { FormError, MainLayout, OpportunityCard } from '@/components';
import { formErrorMessage, LIMITS } from '@/constants';
import VaiheCard from '@/routes/Profile/Path/VaiheCard';
import VaiheModal from '@/routes/Profile/Path/modal/VaiheModal';
import { mapOsaaminenToUri, type PolkuForm, type PolkuQueryParams, type VaiheForm } from '@/routes/Profile/Path/utils';
import { generateProfileLink, getTypeSlug } from '@/routes/Profile/utils';
import { usePolutStore } from '@/stores/usePolutStore';
import { getLocalizedText } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, ConfirmDialog, InputField, PathProgress, PathProgressStep } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdClose, MdOutlineFlag } from 'react-icons/md';
import { useLoaderData, useNavigate, useParams, useRevalidator, useRouteLoaderData } from 'react-router';
import { z } from 'zod';
import { useShallow } from 'zustand/shallow';
import loader from './loader';

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
    ignoredOsaamiset,
    selectedOsaamiset,
    setIgnoredOsaamiset,
    setSelectedOsaamiset,
  } = usePolutStore(
    useShallow((state) => ({
      vaaditutOsaamiset: state.vaaditutOsaamiset,
      osaamisetFromProfile: state.osaamisetFromProfile,
      osaamisetFromVaiheet: state.osaamisetFromVaiheet,
      polku: state.polku,
      vaiheet: state.vaiheet,
      ignoredOsaamiset: state.ignoredOsaamiset,
      selectedOsaamiset: state.selectedOsaamiset,
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
      }),
    ),
    defaultValues: async () => {
      if (polku) {
        return Promise.resolve({
          id: polku.id ?? '',
          nimi: polku.nimi ?? {},
        });
      } else {
        return Promise.resolve({ id: '', nimi: {}, vaiheet: [] });
      }
    },
  });

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
          ...selectedOsaamiset,
          ...osaamisetFromVaiheet.map(mapOsaaminenToUri),
          ...osaamisetFromProfile.map(mapOsaaminenToUri),
        ]),
      ),
    );
  }, [osaamisetFromProfile, osaamisetFromVaiheet, selectedOsaamiset]);

  /*
    Disabled osaamiset includes osaamiset that:
      - Come from vaiheet that are marked as valmis
      - Come from users profile
      - Are ignored

    If user has selected osaaminen manually, it should not be disabled
  */
  React.useEffect(() => {
    setAllDisabled([...ignoredOsaamiset, ...osaamisetFromVaiheetAndProfile]);
  }, [ignoredOsaamiset, osaamisetFromVaiheetAndProfile]);

  /*
    Disabled ignores (Älä huomioi) includes osaamiset that:
      - Come from vaiheet that are marked as valmis
      - Come from users profile
  */
  React.useEffect(() => {
    setDisabledIgnores([...osaamisetFromVaiheetAndProfile]);
  }, [osaamisetFromVaiheetAndProfile]);

  const toggleVaiheCompleted = async (index: number) => {
    await client.PUT('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}/vaiheet/{vaiheId}', {
      params: {
        path: {
          vaiheId: vaiheet[index].id!,
          id: paamaaraId!,
          suunnitelmaId: suunnitelmaId!,
        },
      },
      body: {
        ...vaiheet[index],
        valmis: !vaiheet[index].valmis,
        linkit: vaiheet[index].linkit?.map((link) => link.url) ?? [],
        osaamiset: vaiheet[index].osaamiset?.map((osaaminen) => osaaminen.uri) ?? [],
      },
    });
    await revalidator.revalidate();
  };

  React.useEffect(() => {
    const max = vaaditutOsaamiset.length - ignoredOsaamiset.length;
    setPercentage(Math.round((allChecked.length / max) * 100));
  }, [allChecked.length, vaaditutOsaamiset.length, selectedOsaamiset.length, ignoredOsaamiset.length]);

  React.useEffect(() => {
    setOsaamisetFromVaiheetAndProfile([
      ...osaamisetFromVaiheet.map(mapOsaaminenToUri),
      ...osaamisetFromProfile.map(mapOsaaminenToUri),
    ]);
  }, [osaamisetFromProfile, osaamisetFromVaiheet, vaaditutOsaamiset]);

  if (!paamaara) {
    return null;
  }

  const getTotalTime = () => {
    const totalMilliseconds = vaiheet
      .filter((vaihe) => !!vaihe.loppuPvm) // Don't count time from vaiheet without end time
      .reduce((acc, vaihe) => {
        const start = new Date(vaihe.alkuPvm);
        const end = new Date(vaihe.loppuPvm);
        return acc + (end.getTime() - start.getTime());
      }, 0);

    const yearMultiplier = 1000 * 60 * 60 * 24 * 365;
    const years = Math.floor(totalMilliseconds / yearMultiplier);
    const months = Math.floor((totalMilliseconds % yearMultiplier) / (1000 * 60 * 60 * 24 * 30));

    return years === 0
      ? t('profile.paths.n-months', { count: months })
      : `${t('profile.paths.n-years', { count: years })} ${t('profile.paths.n-months', { count: months })}`;
  };

  const onIgnoreOsaaminen = async (osaaminenUri: string) => {
    if (ignoredOsaamiset.includes(osaaminenUri)) {
      setIgnoredOsaamiset(ignoredOsaamiset.filter((uri) => uri !== osaaminenUri));
    } else {
      setSelectedOsaamiset(selectedOsaamiset.filter((uri) => uri !== osaaminenUri));
      setIgnoredOsaamiset([...ignoredOsaamiset, osaaminenUri]);
    }
    await save(methods.getValues());
  };

  const onOsaaminenChange = async (osaaminenUri: string) => {
    if (selectedOsaamiset.includes(osaaminenUri)) {
      setSelectedOsaamiset(selectedOsaamiset.filter((uri) => uri !== osaaminenUri));
    } else {
      setSelectedOsaamiset([...selectedOsaamiset, osaaminenUri]);
    }
    await save(methods.getValues());
  };

  const openModal = (idx?: number) => {
    setVaiheIndex(idx ?? 0);
    setModalOpen(true);
  };

  const onCloseModal = async (isCancel: boolean) => {
    if (!isCancel) {
      await revalidator.revalidate();
    }
    setModalOpen(false);
    setVaiheIndex(undefined);
  };

  const { mahdollisuusTyyppi, mahdollisuusId } = paamaara;

  const save = async (data: PolkuForm) => {
    const { errors } = methods.formState;
    const isValid = !errors || Object.keys(errors).length === 0;

    if (!paamaaraId || !suunnitelmaId || !isValid) {
      return;
    }
    await client.PUT('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}', {
      params: { path: { id: paamaaraId, suunnitelmaId } },
      body: {
        id: data.id,
        nimi: data.nimi,
        ignoredOsaamiset: usePolutStore.getState().ignoredOsaamiset,
        osaamiset: usePolutStore.getState().selectedOsaamiset,
      },
    });
  };

  const onSubmit: FormSubmitHandler<PolkuForm> = async ({ data }: { data: PolkuForm }) => {
    await save(data);
  };

  const deletePolku = async () => {
    if (paamaaraId && suunnitelmaId) {
      const { error } = await client.DELETE('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}', {
        params: { path: { id: paamaaraId, suunnitelmaId } },
      });

      if (!error) {
        const route = generateProfileLink(['slugs.profile.my-goals'], yksiloRootData, language, t);
        navigate(route.to);
      }
    }
  };

  const onClosePolku = () => {
    const route = generateProfileLink(['slugs.profile.my-goals'], yksiloRootData, language, t);
    navigate(route.to);
  };

  return (
    <MainLayout>
      {modalOpen && Number(vaiheIndex) >= 0 && (
        <VaiheModal
          isOpen={modalOpen}
          vaiheIndex={vaiheIndex ?? 0}
          onClose={(isCancel) => void onCloseModal(isCancel ?? false)}
        />
      )}
      <FormProvider {...methods}>
        <Form className="flex flex-col gap-5" id={formId} onSubmit={onSubmit}>
          {/* Päämäärä */}
          <div className="bg-bg-gray p-9 flex flex-col gap-5">
            <div className="flex flex-row items-center gap-3 justify-between">
              <h1 className="text-heading-1-mobile sm:text-heading-1">{t('profile.paths.title')}</h1>
              <MdClose size={24} className="cursor-pointer" onClick={onClosePolku} />
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
                    to={`/${language}/${getTypeSlug(mahdollisuusTyyppi)}/${mahdollisuusId}`}
                    description={getLocalizedText(mahdollisuus?.tiivistelma)}
                    employmentOutlook={2}
                    industryName="TODO: Lorem ipsum dolor"
                    mostCommonEducationBackground="TODO: Lorem ipsum dolor"
                    name={getLocalizedText(mahdollisuus?.otsikko)}
                    trend="LASKEVA"
                    type={mahdollisuusTyyppi}
                    menuId={'TODO remove menuID requirement if there is no menu'}
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
          {/* Osaamisen kehittyminen */}
          <div className="flex flex-col bg-bg-gray p-9">
            <div className="flex flex-row items-center gap-3">
              <h2 className="text-heading-1">{t('profile.paths.skill-progress')}</h2>
              <div className="grow text-body-lg">
                ({allChecked.length}/
                {t('count-competences', { count: vaaditutOsaamiset.length - ignoredOsaamiset.length })})
              </div>
              <div className="text-heading-3">{percentage}%</div>
            </div>
            {/* Progress bar */}
            <div className="relative w-full h-6 my-8">
              <div className="bg-bg-gray-2 w-full h-6 my-6 absolute"></div>
              <div className="transition-all bg-[#00A8B3] h-6 my-6 absolute" style={{ width: `${percentage}%` }}></div>
            </div>

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
                          <Checkbox
                            name={name}
                            value={osaaminen.uri}
                            variant="bordered"
                            disabled={allDisabled.includes(uri)}
                            checked={allChecked.includes(uri)}
                            label={t('profile.paths.has-competence')}
                            ariaLabel={name}
                            onChange={() => onOsaaminenChange(uri)}
                          />
                        </td>
                        <td>
                          <Checkbox
                            name={`${name}-ignore`}
                            value={uri}
                            variant="bordered"
                            checked={ignoredOsaamiset.includes(uri)}
                            disabled={disabledIgnores.includes(uri)}
                            ariaLabel={`${t('profile.paths.ignore')} ${name}`}
                            onChange={() => onIgnoreOsaaminen(uri)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Form>
      </FormProvider>
      <ConfirmDialog
        title={t('profile.paths.delete-path-title')}
        onConfirm={deletePolku}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="destructive"
        description={t('profile.paths.delete-path-description')}
      >
        {(showDialog: () => void) => (
          <Button label={t('profile.paths.delete-path')} variant="white-delete" onClick={showDialog} />
        )}
      </ConfirmDialog>
    </MainLayout>
  );
};

export default Path;
