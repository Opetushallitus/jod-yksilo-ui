import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { ModalHeader } from '@/components/ModalHeader';
import { LIMITS, OSAAMINEN_COLOR_MAP } from '@/constants';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicatesByKey } from '@/utils';
import { animateElementToTarget, animateHideElement } from '@/utils/animations';
import { Button, cx, EmptyState, InputField, Modal, Tag, useMediaQueries } from '@jod/design-system';
import { JodChatBot, JodSend } from '@jod/design-system/icons';
import React, { Fragment } from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';

const MessageBubble = ({ message, isUser }: { message: string; isUser: boolean }) => {
  return (
    <div className={cx('flex relative', isUser ? 'justify-end' : 'justify-start')}>
      {isUser ? (
        <div
          className="absolute right-0 -bottom-3 w-0 h-0 border-8 border-l-0 border-t-transparent border-b-transparent border-secondary-1-light-3"
          aria-hidden
        />
      ) : (
        <div
          className="absolute left-0 -top-3 w-0 h-0 border-8 border-r-0 border-t-transparent border-b-transparent border-bg-gray"
          aria-hidden
        />
      )}
      <div
        className={cx(
          'max-w-full w-fit sm:max-w-[calc(100%-50px)] text-body-sm-mobile sm:text-body-sm whitespace-pre-wrap wrap-break-word rounded px-5 py-4',
          isUser ? 'bg-secondary-1-light-3' : 'bg-bg-gray',
        )}
      >
        {message}
      </div>
    </div>
  );
};

export const VirtualAssistant = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();
  const toolStore = useToolStore();
  const [controller, setController] = React.useState<AbortController>(new AbortController());
  const [history, setHistory] = React.useState<
    Record<
      string,
      {
        message: string;
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
  const interestsTabButtonRef = React.useRef<HTMLButtonElement>(null);
  const selectedKiinnostuksetLabelId = React.useId();
  const isSendDisabled = React.useMemo(() => value.trim().length < 2, [value]);
  const [tagsPendingRemoval, setTagsPendingRemoval] = React.useState<string[]>([]);

  // Scroll to bottom when history changes
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current?.scrollHeight, behavior: 'smooth' });
  }, [containerRef, history]);

  const sendMessage = async (key: string, value: string) => {
    if (id) {
      const { data, error } = await client.POST('/api/keskustelut/{id}', {
        params: {
          path: { id },
        },
        body: { [language]: value },
        signal: controller.signal,
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
          answer: error
            ? t('tool.my-own-data.interests.virtual-assistant.error')
            : removeTags(['reference_information', 'user_interests'], data?.vastaus),
          kiinnostukset: error ? undefined : data?.kiinnostukset?.map((k) => osaamisetMap[k.esco_uri!]),
        },
      }));
    } else {
      const { data, error } = await client.POST('/api/keskustelut', {
        body: { [language]: value },
        signal: controller.signal,
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

      setId(data?.id);
      setHistory((prevState) => ({
        ...prevState,
        [key]: {
          ...prevState[key],
          answer: error
            ? t('tool.my-own-data.interests.virtual-assistant.error')
            : removeTags(['reference_information', 'user_interests'], data?.vastaus),
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
    controller.abort();
    setController(new AbortController());
    setValue('');
    setId(undefined);
    setHistory({});
    setSelectedKiinnostukset([]);
    setTagsPendingRemoval([]);
    setSelectedInterestsVisible(false);
  };

  const removeTags = (tagNames: string[], value?: string) => {
    const pattern = tagNames.map((tag) => `<\\s*${tag}\\b[^>]*>[\\s\\S]*?<\\/\\s*${tag}\\s*>`).join('|');
    const regex = new RegExp(pattern, 'gi');
    return value?.replace(regex, '');
  };

  const [isOpen, setIsOpen] = React.useState(false);

  const headerText = t('tool.my-own-data.interests.virtual-assistant.title');
  const topSlot = React.useMemo(() => <ModalHeader text={headerText} />, [headerText]);

  return (
    <>
      <Button
        label={t('tool.my-own-data.interests.conversational-virtual-assistant')}
        variant="gray"
        size="sm"
        className="w-fit"
        icon={<JodChatBot />}
        iconSide="right"
        onClick={() => setIsOpen(true)}
        data-testid="interests-open-virtual-assistant"
      />
      <Modal
        name={headerText}
        open={isOpen}
        fullWidthContent
        className="sm:h-full!"
        topSlot={topSlot}
        content={
          <div className="flex flex-col h-full min-h-[45dvh]">
            <div role="tablist" aria-labelledby={titleId} className="flex flex-row gap-1 min-h-9">
              <button
                id={conversationTabButtonId}
                type="button"
                role="tab"
                onClick={() => {
                  // When switching to conversation tab, remove tags pending removal.
                  // Otherwise they would remain in selections if tab is switched before animation ends.
                  setSelectedInterestsVisible(false);
                  setSelectedKiinnostukset((prevState) => {
                    return prevState.filter((k) => !tagsPendingRemoval.includes(k.uri));
                  });
                  setTagsPendingRemoval([]);
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
                ref={interestsTabButtonRef}
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
            <div
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={conversationTabButtonId}
              className={cx(
                'flex flex-col flex-1 min-h-0 py-2 bg-white rounded-b-md mb-4',
                selectedInterestsVisible && 'hidden',
              )}
            >
              <div
                id={conversationTabPanelId}
                ref={containerRef}
                className="flex flex-col flex-1 overflow-y-auto"
                data-testid="va-transcript"
              >
                <div className="flex flex-col flex-1 gap-5 px-4 py-3 my-2">
                  <MessageBubble
                    message={t('tool.my-own-data.interests.virtual-assistant.description')}
                    isUser={false}
                  />
                  <MessageBubble message={t('tool.my-own-data.interests.virtual-assistant.start')} isUser={false} />
                  {Object.entries(history).map(([key, row]) => (
                    <Fragment key={key}>
                      <MessageBubble message={row.message} isUser={true} />
                      <MessageBubble
                        message={row.answer ? row.answer : t('tool.my-own-data.interests.virtual-assistant.loading')}
                        isUser={false}
                      />
                      {row.kiinnostukset && row.kiinnostukset.length > 0 && (
                        <div className="flex flex-col gap-4">
                          <div className={'sm:text-heading-4 sm:font-arial text-heading-4-mobile font-bold'}>
                            <span>{t('proposed-interests')}</span>
                            <div className="font-arial text-body-sm text-secondary-gray">
                              {t(`osaamissuosittelija.interest.add`)}
                            </div>
                          </div>
                          <div className="max-h-[228px] overflow-y-auto">
                            <ul className="flex flex-wrap gap-3">
                              {row.kiinnostukset
                                .filter((k) => !selectedKiinnostukset.find((val) => val.uri === k.uri))
                                .map((k) => (
                                  <li key={k.uri} className="max-w-full">
                                    <Tag
                                      label={k.nimi[language] ?? k.uri}
                                      sourceType={OSAAMINEN_COLOR_MAP['KIINNOSTUS']}
                                      onClick={(e) => {
                                        animateElementToTarget(e.currentTarget, interestsTabButtonRef.current!);
                                        // eslint-disable-next-line sonarjs/no-nested-functions
                                        setSelectedKiinnostukset((prevState) => [k, ...prevState]);
                                      }}
                                      variant="selectable"
                                    />
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div
              id={interestsTabPanelId}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={interestsTabButtonId}
              className={cx(
                'flex flex-col flex-1 min-h-0 overflow-y-auto bg-white p-4 sm:h-[484px] h-[378px] rounded-b-md',
                !selectedInterestsVisible && 'hidden',
              )}
              data-testid="va-selected-interests"
            >
              <h2 tabIndex={-1} id={selectedKiinnostuksetLabelId} className="text-heading-4-mobile sm:text-heading-4">
                {t('tool.my-own-data.interests.virtual-assistant.selected-interests')}
              </h2>
              {isSelectedKiinnostuksetEmpty && (
                <div className="mt-4">
                  <EmptyState text={t('osaamissuosittelija.interest.none-selected')} testId="interests-empty-state" />
                </div>
              )}
              {!isSelectedKiinnostuksetEmpty && (
                <>
                  <span className="text-help text-secondary-gray">{t('osaamissuosittelija.interest.remove')}</span>

                  <div aria-labelledby={selectedKiinnostuksetLabelId} className="min-h-[144px] overflow-y-auto mt-4">
                    <ul className="flex flex-wrap gap-3">
                      {selectedKiinnostukset.map((k) => (
                        <li key={k.uri} className="max-w-full">
                          <Tag
                            label={k.nimi[language] ?? k.uri}
                            sourceType={OSAAMINEN_COLOR_MAP['KIINNOSTUS']}
                            variant="added"
                            onClick={(e) => {
                              setTagsPendingRemoval((prev) => [...prev, k.uri]);
                              animateHideElement(e.currentTarget, () => {
                                // eslint-disable-next-line sonarjs/no-nested-functions
                                setSelectedKiinnostukset((prevState) => {
                                  return prevState.filter((selectedValue) => selectedValue.kuvaus !== k.kuvaus);
                                });
                                // eslint-disable-next-line sonarjs/no-nested-functions
                                setTagsPendingRemoval((prev) => prev.filter((uri) => uri !== k.uri));
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

            <div className={cx('flex gap-4 items-center mb-1', selectedInterestsVisible && 'hidden')}>
              <InputField
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={LIMITS.TEXT_INPUT}
                hideLabel
                placeholder={t('tool.my-own-data.interests.virtual-assistant.respond-to-chat')}
                className="p-4! text-[16px]! leading-[18px]!"
                testId="va-input"
                widthVariant="full"
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
        }
        footer={
          <div className="flex flex-row justify-end flex-1 gap-3">
            <Button
              onClick={() => {
                clearState();
                setIsOpen(false);
              }}
              label={t('common:cancel')}
              size={sm ? 'lg' : 'sm'}
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
                setIsOpen(false);
              }}
              label={t('save')}
              variant="accent"
              disabled={isSelectedKiinnostuksetEmpty}
              size={sm ? 'lg' : 'sm'}
            />
          </div>
        }
      />
    </>
  );
};
