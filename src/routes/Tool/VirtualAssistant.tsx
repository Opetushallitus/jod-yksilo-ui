import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { LIMITS, OSAAMINEN_COLOR_MAP } from '@/constants';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicatesByKey } from '@/utils';
import { Button, ConfirmDialog, cx, EmptyState, InputField, Tag } from '@jod/design-system';
import { JodChatBot, JodSend } from '@jod/design-system/icons';
import React, { Fragment } from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';

export const VirtualAssistant = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const toolStore = useToolStore();
  const [history, setHistory] = React.useState<
    Record<
      string,
      {
        message?: string;
        answer?: string;
        kiinnostukset?: {
          uri: string;
          nimi: Record<string, string>;
          kuvaus: Record<string, string>;
        }[];
      }
    >
  >({});
  const [selectedKiinnostukset, setSelectedKiinnostukset] = React.useState<
    {
      uri: string;
      nimi: Record<string, string>;
      kuvaus: Record<string, string>;
    }[]
  >([]);
  const isSelectedKiinnostuksetEmpty = React.useMemo(() => selectedKiinnostukset.length === 0, [selectedKiinnostukset]);

  const [id, setId] = React.useState<string | undefined>(undefined);
  const [value, setValue] = React.useState('');
  const [selectedInterestsVisible, setSelectedInterestsVisible] = React.useState(false);

  const titleId = React.useId();
  const conversationTabButtonId = React.useId();
  const conversationTabPanelId = React.useId();
  const interestsTabButtonId = React.useId();
  const interestsTabPanelId = React.useId();
  const selectedKiinnostuksetLabelId = React.useId();

  const isSendDisabled = React.useMemo(() => value.trim().length < 2, [value]);

  // Scroll to bottom when history changes
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current?.scrollHeight, behavior: 'smooth' });
  }, [containerRef, history]);

  const sendMessage = async (key: string, value: string) => {
    if (id) {
      const { data, error } = await client.POST('/api/keskustelut/{id}', {
        params: {
          path: {
            id,
          },
        },
        body: { [language]: value },
      });

      // Fetch osaamiset for the returned kiinnostukset
      const osaamisetData = await osaamiset.find(data?.kiinnostukset?.map((k) => k.esco_uri!) ?? []);
      const osaamisetMap = osaamisetData.reduce(
        (acc, osaaminen) => {
          acc[osaaminen.uri] = osaaminen;
          return acc;
        },
        {} as Record<
          string,
          {
            uri: string;
            nimi: Record<string, string>;
            kuvaus: Record<string, string>;
          }
        >,
      );

      setHistory((prevState) => ({
        ...prevState,
        [key]: {
          ...prevState[key],
          answer: error ? t('tool.my-own-data.interests.virtual-assistant.error') : data?.vastaus,
          kiinnostukset: error ? undefined : data?.kiinnostukset?.map((k) => osaamisetMap[k.esco_uri!]),
        },
      }));
    } else {
      const { data, error } = await client.POST('/api/keskustelut', { body: { [language]: value } });

      // Fetch osaamiset for the returned kiinnostukset
      const osaamisetData = await osaamiset.find(data?.kiinnostukset?.map((k) => k.esco_uri!) ?? []);
      const osaamisetMap = osaamisetData.reduce(
        (acc, osaaminen) => {
          acc[osaaminen.uri] = osaaminen;
          return acc;
        },
        {} as Record<
          string,
          {
            uri: string;
            nimi: Record<string, string>;
            kuvaus: Record<string, string>;
          }
        >,
      );

      setId(data?.id);
      setHistory((prevState) => ({
        ...prevState,
        [key]: {
          ...prevState[key],
          answer: error ? t('tool.my-own-data.interests.virtual-assistant.error') : data?.vastaus,
          kiinnostukset: error ? undefined : data?.kiinnostukset?.map((k) => osaamisetMap[k.esco_uri!]),
        },
      }));
    }
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSendDisabled) {
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      updateHistory();
    }
  };

  // Clear virtual assistant state
  const clearState = () => {
    setHistory({});
    setSelectedKiinnostukset([]);
  };

  return (
    <ConfirmDialog
      title={<span id={titleId}>{t('tool.my-own-data.interests.virtual-assistant.title')}</span>}
      description={
        <>
          <div role="tablist" aria-labelledby={titleId} className="flex flex-row gap-1 min-h-9">
            <button
              id={conversationTabButtonId}
              type="button"
              role="tab"
              onClick={() => {
                setSelectedInterestsVisible(false);
              }}
              aria-selected={selectedInterestsVisible ? 'false' : 'true'}
              aria-controls={conversationTabPanelId}
              className={cx(
                'flex-1 bg-white rounded-t-md p-3 text-[16px] leading-[110%] font-bold tracking-[0.16px] truncate cursor-pointer hover:underline',
                !selectedInterestsVisible ? 'text-accent bg-white' : 'text-primary-gray bg-bg-gray-2',
              )}
            >
              {t('tool.my-own-data.interests.virtual-assistant.conversation')}
            </button>
            <button
              id={interestsTabButtonId}
              type="button"
              role="tab"
              onClick={() => {
                setSelectedInterestsVisible(true);
              }}
              aria-selected={selectedInterestsVisible ? 'true' : 'false'}
              aria-controls={interestsTabPanelId}
              className={cx(
                'flex-1 rounded-t-md p-3 text-[16px] leading-[110%] font-bold tracking-[0.16px] truncate cursor-pointer hover:underline',
                selectedInterestsVisible ? 'text-accent bg-white' : 'text-primary-gray bg-bg-gray-2',
              )}
            >
              {t('tool.my-own-data.interests.virtual-assistant.intrests')}
              {!isSelectedKiinnostuksetEmpty && ` (${selectedKiinnostukset.length})`}
            </button>
          </div>

          <div className={cx(selectedInterestsVisible && 'hidden')}>
            <div
              id={conversationTabPanelId}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={conversationTabButtonId}
              className={'flex bg-white rounded-b-md mb-4'}
              data-testid="va-transcript"
            >
              <div
                ref={containerRef}
                className="flex flex-col gap-5 px-4 py-3 my-2 sm:h-[406px] h-[300px] overflow-y-auto"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-row justify-start">
                    <div className="flex flex-row gap-5">
                      <div className="flex flex-none items-center justify-center h-8 w-8 rounded-full bg-bg-gray-2">
                        <JodChatBot className="text-black" />
                      </div>
                      <div className="text-body-sm-mobile sm:text-body-sm whitespace-pre-wrap">
                        {t('tool.my-own-data.interests.virtual-assistant.description')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-row justify-start">
                    <div className="flex flex-row gap-5">
                      <div className="flex flex-none items-center justify-center h-8 w-8 rounded-full bg-bg-gray-2">
                        <JodChatBot className="text-black" />
                      </div>
                      <div className="text-body-sm-mobile sm:text-body-sm whitespace-pre-wrap">
                        {t('tool.my-own-data.interests.virtual-assistant.start')}
                      </div>
                    </div>
                  </div>
                </div>

                {Object.entries(history).map(([key, row]) => (
                  <Fragment key={key}>
                    <div className="flex flex-row justify-end">
                      <div className="text-body-sm-mobile sm:text-body-sm whitespace-pre-wrap rounded px-5 py-4 bg-bg-gray-2">
                        {row.message}
                      </div>
                    </div>
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-row justify-start">
                        <div className="flex flex-row gap-5">
                          <div className="flex flex-none items-center justify-center h-8 w-8 rounded-full bg-bg-gray-2">
                            <JodChatBot className="text-black" />
                          </div>
                          <div className="flex flex-col gap-4">
                            <div className="text-body-sm-mobile sm:text-body-sm whitespace-pre-wrap">
                              {row.answer ? row.answer : t('tool.my-own-data.interests.virtual-assistant.loading')}
                            </div>
                            {row.kiinnostukset && row.kiinnostukset.length > 0 && (
                              <div className="flex flex-col gap-3">
                                <ul className="flex flex-wrap gap-3">
                                  {row.kiinnostukset
                                    .filter((k) => !selectedKiinnostukset.find((val) => val.uri === k.uri))
                                    .map((k) => (
                                      <li key={k.uri}>
                                        <Tag
                                          label={k.nimi[language] ?? k.uri}
                                          sourceType={OSAAMINEN_COLOR_MAP['KIINNOSTUS']}
                                          onClick={() => {
                                            // eslint-disable-next-line sonarjs/no-nested-functions
                                            setSelectedKiinnostukset((prevState) => [...prevState, k]);
                                          }}
                                          variant="selectable"
                                        />
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <InputField
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={LIMITS.TEXT_INPUT}
                hideLabel
                placeholder={t('tool.my-own-data.interests.virtual-assistant.respond-to-chat')}
                testId="va-input"
              />
              <button
                type="button"
                disabled={isSendDisabled}
                onClick={updateHistory}
                aria-label={t('tool.my-own-data.interests.virtual-assistant.send')}
                data-testid="va-send"
                className="text-secondary-gray size-7 cursor-pointer disabled:cursor-not-allowed"
              >
                <JodSend aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            id={interestsTabPanelId}
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={interestsTabButtonId}
            className={cx(
              'flex flex-col bg-white p-4 sm:h-[484px] h-[378px] rounded-b-md',
              !selectedInterestsVisible && 'hidden',
            )}
            data-testid="va-selected-interests"
          >
            <h2 tabIndex={-1} id={selectedKiinnostuksetLabelId} className="text-heading-4-mobile sm:text-heading-4">
              {t('tool.my-own-data.interests.virtual-assistant.selected-interests')}
            </h2>
            <div className="mt-4">
              {isSelectedKiinnostuksetEmpty && (
                <EmptyState text={t('osaamissuosittelija.interest.none-selected')} testId="interests-empty-state" />
              )}
            </div>
            {!isSelectedKiinnostuksetEmpty && (
              <>
                <span className="text-help text-secondary-gray">{t('osaamissuosittelija.interest.remove')}</span>

                <div aria-labelledby={selectedKiinnostuksetLabelId} className="min-h-[144px] overflow-y-auto mt-4">
                  <ul className="flex flex-wrap gap-3">
                    {selectedKiinnostukset.map((k) => (
                      <li key={k.uri}>
                        <Tag
                          label={k.nimi[language] ?? k.uri}
                          sourceType={OSAAMINEN_COLOR_MAP['KIINNOSTUS']}
                          variant="added"
                          onClick={() => {
                            setSelectedKiinnostukset((prevState) => {
                              // eslint-disable-next-line sonarjs/no-nested-functions
                              return prevState.filter((selectedValue) => selectedValue.kuvaus !== k.kuvaus);
                            });
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </>
      }
      // eslint-disable-next-line react/no-unstable-nested-components
      footer={(hideDialog) => (
        <div className="flex flex-row justify-between gap-5">
          <Button
            onClick={() => {
              clearState();
              hideDialog();
            }}
            label={t('cancel')}
          />
          <Button
            onClick={() => {
              const newKiinnostukset = selectedKiinnostukset.map((k) => ({
                id: k.uri,
                nimi: k.nimi,
                kuvaus: k.kuvaus,
                tyyppi: 'KARTOITETTU' as const,
              }));

              const allKiinnostukset = [...toolStore.kiinnostukset, ...newKiinnostukset];
              toolStore.setKiinnostukset([...removeDuplicatesByKey(allKiinnostukset, (k) => k.id)]);

              toast.success(
                t('tool.my-own-data.interests.virtual-assistant.x-interests-added', {
                  count: selectedKiinnostukset.length,
                }),
              );

              clearState();
              hideDialog();
            }}
            label={t('save')}
            disabled={isSelectedKiinnostuksetEmpty}
          />
        </div>
      )}
    >
      {(showDialog) => (
        <Button
          data-testid="interests-open-virtual-assistant"
          label={t('tool.my-own-data.interests.conversational-virtual-assistant')}
          variant="gray"
          size="sm"
          className="w-fit"
          icon={<JodChatBot />}
          iconSide="right"
          onClick={() => {
            showDialog();
          }}
        />
      )}
    </ConfirmDialog>
  );
};
