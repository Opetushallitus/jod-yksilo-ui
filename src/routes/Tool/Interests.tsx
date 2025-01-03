import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import { components } from '@/api/schema';
import {
  HelpingToolLinkItem,
  HelpingToolProfileLinkItem,
  HelpingToolsContent,
  OsaamisSuosittelija,
} from '@/components';
import { OsaaminenLahdeTyyppi } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicates } from '@/utils';
import { Accordion, Button, ConfirmDialog, Tag, Textarea, useMediaQueries } from '@jod/design-system';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineInterests, MdOutlineQuiz, MdOutlineSmartToy, MdSend } from 'react-icons/md';
import { useOutletContext, useRouteLoaderData } from 'react-router';
import { generateProfileLink } from '../Profile/utils';
import { ToolLoaderData } from './loader';

const kiinnostuksetOsaamisetApiPath = '/api/profiili/kiinnostukset/osaamiset';

const VirtualAssistant = ({
  setVirtualAssistantOpen,
}: {
  setVirtualAssistantOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [history, setHistory] = React.useState<
    Record<
      string,
      {
        message?: string;
        answer?: string;
        kiinnostukset?: components['schemas']['Kiinnostus'][];
      }
    >
  >({});
  const [value, setValue] = React.useState('');
  const [id, setId] = React.useState<string>();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { sm } = useMediaQueries();

  const [selectedKiinnostukset, setSelectedKiinnostukset] = React.useState<components['schemas']['Kiinnostus'][]>([]);

  React.useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current?.scrollHeight, behavior: 'smooth' });
  }, [containerRef, history]);

  const sendMessage = async (key: string, value: string) => {
    const res = await (id
      ? client.POST('/api/keskustelut/{id}', {
          params: {
            path: {
              id,
            },
          },
          body: { [language]: value },
        })
      : client.POST('/api/keskustelut', { body: { [language]: value } }));

    const { data, error } = res;
    if (id === undefined) {
      setId(data?.id);
    }
    setHistory((prevState) => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        answer: error ? t('tool.my-own-data.interests.virtual-assistant.error') : data?.vastaus,
        kiinnostukset: error ? undefined : data?.kiinnostukset,
      },
    }));
  };

  const updateHistory = () => {
    if (value === '') {
      return;
    }
    const key = crypto.randomUUID();
    setHistory((prevState) => ({ ...prevState, [key]: { message: value } }));
    sendMessage(key, value);
    setValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      updateHistory();
    }
  };

  return (
    <>
      <div className="flex flex-row flex-shrink-0 justify-between items-center border-b border-bg-gray px-5 py-3">
        <h2 className="text-heading-4-mobile sm:text-heading-4">
          {t('tool.my-own-data.interests.virtual-assistant.title')}
        </h2>
        <Button
          onClick={() => setVirtualAssistantOpen(false)}
          variant="gray"
          size="sm"
          label={t('tool.my-own-data.interests.virtual-assistant.done')}
        />
      </div>

      <div ref={containerRef} className="flex flex-col flex-grow overflow-auto py-6 sm:py-7 px-5 sm:px-6 gap-7">
        {Object.keys(history).length ? (
          Object.entries(history).map(([key, row]) => (
            <Fragment key={key}>
              <div className="flex flex-row justify-end">
                <div className="text-body-sm-mobile sm:text-body-sm whitespace-pre-wrap rounded px-5 py-4 bg-bg-gray-2">
                  {row.message}
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex flex-row justify-start">
                  <div className="flex flex-row gap-5">
                    <div className="flex flex-none items-center justify-center h-8 w-8 rounded bg-bg-gray-2">
                      <MdOutlineSmartToy size={24} color="#000" />
                    </div>
                    <div className="text-body-sm-mobile sm:text-body-sm whitespace-pre-wrap">
                      {row.answer ? row.answer : t('tool.my-own-data.interests.virtual-assistant.loading')}
                    </div>
                  </div>
                </div>
                {row.kiinnostukset && row.kiinnostukset.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="h-[144px] overflow-y-auto rounded border border-border-gray p-5 bg-[#F7F7F9]">
                      <div className="flex flex-wrap gap-3">
                        {row.kiinnostukset
                          .filter((k) => !selectedKiinnostukset.find((val) => val.kuvaus === k.kuvaus))
                          .map((k) => (
                            <Tag
                              key={k.kuvaus ?? k.esco_uri}
                              label={k.kuvaus ?? k.esco_uri ?? ''}
                              sourceType={OSAAMINEN_COLOR_MAP['KIINNOSTUS']}
                              onClick={() => {
                                // eslint-disable-next-line sonarjs/no-nested-functions
                                setSelectedKiinnostukset((prevState) => [...prevState, k]);
                              }}
                              variant="selectable"
                            />
                          ))}
                      </div>
                    </div>
                    <div className={`${sm ? 'text-body-sm font-arial' : 'text-body-sm-mobile'}`}>
                      {t('tool.my-own-data.interests.virtual-assistant.add')}
                    </div>
                  </div>
                )}
              </div>
            </Fragment>
          ))
        ) : (
          <p className="text-body-md-mobile sm:text-body-md whitespace-pre-wrap">
            {t('tool.my-own-data.interests.virtual-assistant.description')}
          </p>
        )}
      </div>

      <div className="flex flex-col flex-shrink-0 gap-5 px-5 pb-5">
        <Textarea
          placeholder={t('tool.my-own-data.interests.virtual-assistant.respond-to-chat')}
          value={value}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          maxLength={10000}
          hideLabel
          className="!bg-[#F7F7F9]"
        />
        <div className="flex justify-between">
          <Button
            onClick={() => {
              alert(JSON.stringify(selectedKiinnostukset));
            }}
            variant="gray"
            size="sm"
            label={t('tool.my-own-data.interests.virtual-assistant.intrests', { count: selectedKiinnostukset.length })}
          />
          <Button
            disabled={value === ''}
            onClick={() => updateHistory()}
            variant="gray"
            size="sm"
            label={t('tool.my-own-data.interests.virtual-assistant.send')}
            iconSide="right"
            icon={<MdSend size={24} color="#fff" />}
          />
        </div>
      </div>
    </>
  );
};

const Interests = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { isDev } = useEnvironment();
  const toolStore = useToolStore();
  const { isLoggedIn } = useOutletContext<ToolLoaderData>();
  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  const [virtualAssistantOpen, setVirtualAssistantOpen] = React.useState(false);

  const interestsLink = React.useMemo(
    () => generateProfileLink(['slugs.profile.interests'], data, language, t),
    [data, language, t],
  );

  const importFromProfile = React.useCallback(async () => {
    const { data } = await client.GET(kiinnostuksetOsaamisetApiPath);
    const kiinnostukset = [
      ...(await osaamisetService.find(data)).map((k) => ({
        id: k.uri,
        nimi: k.nimi,
        kuvaus: k.kuvaus,
        tyyppi: 'KIINNOSTUS' as OsaaminenLahdeTyyppi,
      })),
      ...toolStore.kiinnostukset.filter((o) => o.tyyppi === 'KARTOITETTU'),
    ];
    toolStore.setKiinnostukset(removeDuplicates(kiinnostukset, 'id'));
  }, [toolStore]);

  const exportToProfile = React.useCallback(async () => {
    await client.PUT(kiinnostuksetOsaamisetApiPath, {
      body: [
        ...new Set([
          ...((await client.GET(kiinnostuksetOsaamisetApiPath)).data ?? []),
          ...toolStore.kiinnostukset.map((k) => k.id),
        ]),
      ],
    });
    const kiinnostukset = toolStore.kiinnostukset.map((k) => ({
      ...k,
      tyyppi: k.tyyppi === 'KARTOITETTU' ? 'KIINNOSTUS' : k.tyyppi,
    }));
    toolStore.setKiinnostukset(removeDuplicates(kiinnostukset, 'id'));
  }, [toolStore]);

  return virtualAssistantOpen ? (
    <VirtualAssistant setVirtualAssistantOpen={setVirtualAssistantOpen} />
  ) : (
    <div className="py-6 sm:py-7 px-5 sm:px-6">
      <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3 sm:mb-5">{t('tool.my-own-data.interests.title')}</h2>
      <p className="text-body-md-mobile sm:text-body-md whitespace-pre-wrap mb-6">
        {t('tool.my-own-data.interests.description')}
      </p>
      <div className="mb-6">
        <OsaamisSuosittelija
          onChange={toolStore.setKiinnostukset}
          value={toolStore.kiinnostukset}
          categorized
          mode="kiinnostukset"
          className="!bg-[#F7F7F9]"
        />
      </div>
      <div className="flex flex-wrap gap-5 mb-7">
        <Button
          label={t('tool.my-own-data.interests.import')}
          onClick={() => void importFromProfile()}
          disabled={!isLoggedIn}
        />
        <Button
          label={t('tool.my-own-data.interests.export')}
          onClick={() => void exportToProfile()}
          disabled={!isLoggedIn}
        />
        <ConfirmDialog
          title={t('tool.my-own-data.interests.delete-all.title')}
          onConfirm={() => toolStore.setKiinnostukset([])}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          variant="destructive"
          description={t('tool.my-own-data.interests.delete-all.description')}
        >
          {(showDialog: () => void) => (
            <Button
              variant="gray-delete"
              label={t('tool.my-own-data.interests.delete-all.title')}
              onClick={showDialog}
              disabled={toolStore.kiinnostukset.length === 0}
            />
          )}
        </ConfirmDialog>
      </div>
      <Accordion title={t('tool.tools.title')} lang={language}>
        <HelpingToolsContent text={t('tool.my-own-data.interests.help-text')}>
          <HelpingToolProfileLinkItem
            profileLink={interestsLink}
            icon={<MdOutlineInterests size={24} color="#006DB3" />}
            title={t('profile.interests.title')}
          />
          <HelpingToolLinkItem
            icon={<MdOutlineInterests size={24} color="#AD4298" />}
            title={t('tool.my-own-data.interests.conversational-virtual-assistant')}
            /* eslint-disable-next-line react/no-unstable-nested-components */
            component={({ children }) => (
              <button onClick={() => setVirtualAssistantOpen(true)} type="button">
                {children}
              </button>
            )}
          />
          {isDev && (
            <HelpingToolLinkItem
              icon={<MdOutlineQuiz size={24} color="#006DB3" />}
              title={t('tool.my-own-data.interests.riasec-test')}
              /* eslint-disable-next-line react/no-unstable-nested-components */
              component={({ children }) => <div className="bg-todo">{children}</div>}
            />
          )}
          {isDev && (
            <HelpingToolLinkItem
              icon={<MdOutlineInterests size={24} color="#AD4298" />}
              title={t('tool.my-own-data.interests.interest-barometer')}
              /* eslint-disable-next-line react/no-unstable-nested-components */
              component={({ children }) => <div className="bg-todo">{children}</div>}
            />
          )}
        </HelpingToolsContent>
      </Accordion>
    </div>
  );
};

export default Interests;
