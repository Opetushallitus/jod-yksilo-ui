import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { ModalHeader } from '@/components/ModalHeader';
import { LIMITS, OSAAMINEN_COLOR_MAP } from '@/constants';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicatesByKey } from '@/utils';
import { animateElementToTarget, animateHideElement } from '@/utils/animations';
import { Button, cx, EmptyState, InputField, Modal, Tag, useMediaQueries } from '@jod/design-system';
import { JodAiGradient, JodSend } from '@jod/design-system/icons';
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

// eslint-disable-next-line sonarjs/cognitive-complexity
export const VirtualAssistant = ({ type, className }: { type: 'competences' | 'interests'; className?: string }) => {
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
  const [selected, setSelected] = React.useState<
    {
      uri: string;
      nimi: Record<string, string>;
      kuvaus: Record<string, string>;
    }[]
  >([]);
  const isSelectedEmpty = React.useMemo(() => selected.length === 0, [selected]);

  const [id, setId] = React.useState<string | undefined>(undefined);
  const [value, setValue] = React.useState('');
  const [selectedVisible, setSelectedVisible] = React.useState(false);

  const titleId = React.useId();
  const conversationTabButtonId = React.useId();
  const conversationTabPanelId = React.useId();
  const selectedTabButtonId = React.useId();
  const selectedTabPanelId = React.useId();
  const selectedTabButtonRef = React.useRef<HTMLButtonElement>(null);
  const selectedLabelId = React.useId();
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
      const osaamisetData = await osaamiset.find(data?.ehdotukset ?? []);
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
            ? t('tool.my-own-data.virtual-assistant.error')
            : removeTags(['reference_information', 'user_interests'], data?.vastaus),
          kiinnostukset: error ? undefined : data?.ehdotukset?.map((k) => osaamisetMap[k]),
        },
      }));
    } else {
      const { data, error } = await client.POST('/api/keskustelut', {
        body: {
          tila: type === 'competences' ? 'OSAAMINEN' : 'KIINNOSTUKSET',
          viesti: {
            [language]: value,
          },
        },
        signal: controller.signal,
      });

      // Fetch osaamiset for the returned kiinnostukset
      const osaamisetData = await osaamiset.find(data?.ehdotukset ?? []);
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
            ? t('tool.my-own-data.virtual-assistant.error')
            : removeTags(['reference_information', 'user_interests'], data?.vastaus),
          kiinnostukset: error ? undefined : data?.ehdotukset?.map((k) => osaamisetMap[k]),
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
    setSelected([]);
    setTagsPendingRemoval([]);
    setSelectedVisible(false);
  };

  const removeTags = (tagNames: string[], value?: string) => {
    const pattern = tagNames.map((tag) => `<\\s*${tag}\\b[^>]*>[\\s\\S]*?<\\/\\s*${tag}\\s*>`).join('|');
    const regex = new RegExp(pattern, 'gi');
    return value?.replace(regex, '');
  };

  const [isOpen, setIsOpen] = React.useState(false);

  const headerText =
    type === 'competences'
      ? t('tool.my-own-data.competences.virtual-assistant.title')
      : t('tool.my-own-data.interests.virtual-assistant.title');
  const topSlot = React.useMemo(() => <ModalHeader text={headerText} />, [headerText]);

  return (
    <div className={className}>
      <Button
        label={
          type === 'competences'
            ? t('tool.my-own-data.competences.virtual-assistant.open')
            : t('tool.my-own-data.interests.virtual-assistant.open')
        }
        variant="gray"
        size="sm"
        icon={<JodAiGradient />}
        iconSide="right"
        onClick={() => setIsOpen(true)}
        data-testid="open-va"
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
                  setSelectedVisible(false);
                  setSelected((prevState) => {
                    return prevState.filter((k) => !tagsPendingRemoval.includes(k.uri));
                  });
                  setTagsPendingRemoval([]);
                }}
                aria-selected={selectedVisible ? 'false' : 'true'}
                aria-controls={conversationTabPanelId}
                className={cx(
                  'flex-1 bg-white rounded-t-md p-3 text-[16px] leading-[110%] font-bold tracking-[0.16px] truncate cursor-pointer hover:underline',
                  selectedVisible ? 'text-primary-gray bg-bg-gray-2' : 'text-accent bg-white',
                )}
              >
                {t('tool.my-own-data.virtual-assistant.conversation')}
              </button>
              <button
                id={selectedTabButtonId}
                ref={selectedTabButtonRef}
                type="button"
                role="tab"
                onClick={() => {
                  setSelectedVisible(true);
                }}
                aria-selected={selectedVisible ? 'true' : 'false'}
                aria-controls={selectedTabPanelId}
                className={cx(
                  'flex-1 rounded-t-md p-3 text-[16px] leading-[110%] font-bold tracking-[0.16px] truncate cursor-pointer hover:underline',
                  selectedVisible ? 'text-accent bg-white' : 'text-primary-gray bg-bg-gray-2',
                )}
              >
                {type === 'competences'
                  ? t('tool.my-own-data.competences.virtual-assistant.selected-tab')
                  : t('tool.my-own-data.interests.virtual-assistant.selected-tab')}
                {!isSelectedEmpty && ` (${selected.length})`}
              </button>
            </div>
            <div
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={conversationTabButtonId}
              className={cx(
                'flex flex-col flex-1 min-h-0 py-2 bg-white rounded-b-md mb-4',
                selectedVisible && 'hidden',
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
                    message={
                      type === 'competences'
                        ? t('tool.my-own-data.competences.virtual-assistant.description')
                        : t('tool.my-own-data.interests.virtual-assistant.description')
                    }
                    isUser={false}
                  />
                  <MessageBubble
                    message={
                      type === 'competences'
                        ? t('tool.my-own-data.competences.virtual-assistant.start')
                        : t('tool.my-own-data.interests.virtual-assistant.start')
                    }
                    isUser={false}
                  />
                  {Object.entries(history).map(([key, row]) => (
                    <Fragment key={key}>
                      <MessageBubble message={row.message} isUser={true} />
                      <MessageBubble
                        message={row.answer ? row.answer : t('tool.my-own-data.virtual-assistant.loading')}
                        isUser={false}
                      />
                      {row.kiinnostukset && row.kiinnostukset.length > 0 && (
                        <div className="flex flex-col gap-4">
                          <div className={'sm:text-heading-4 sm:font-arial text-heading-4-mobile font-bold'}>
                            <span>{type === 'competences' ? t('proposed-competences') : t('proposed-interests')}</span>
                            <div className="font-arial text-body-sm text-secondary-gray">
                              {t(`osaamissuosittelija.interest.add`)}
                            </div>
                          </div>
                          <div className="max-h-[228px] overflow-y-auto">
                            <ul className="flex flex-wrap gap-3">
                              {row.kiinnostukset
                                .filter((k) => !selected.some((val) => val.uri === k.uri))
                                .map((k) => (
                                  <li key={k.uri} className="max-w-full">
                                    <Tag
                                      label={k.nimi[language] ?? k.uri}
                                      sourceType={OSAAMINEN_COLOR_MAP['KIINNOSTUS']}
                                      onClick={(e) => {
                                        animateElementToTarget(e.currentTarget, selectedTabButtonRef.current!);
                                        // eslint-disable-next-line sonarjs/no-nested-functions
                                        setSelected((prevState) => [k, ...prevState]);
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
              id={selectedTabPanelId}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={selectedTabButtonId}
              className={cx(
                'flex flex-col flex-1 min-h-0 overflow-y-auto bg-white p-4 sm:h-[484px] h-[378px] rounded-b-md',
                !selectedVisible && 'hidden',
              )}
              data-testid="va-selected"
            >
              <h2 tabIndex={-1} id={selectedLabelId} className="text-heading-4-mobile sm:text-heading-4">
                {type === 'competences'
                  ? t('tool.my-own-data.competences.virtual-assistant.selected')
                  : t('tool.my-own-data.interests.virtual-assistant.selected')}
              </h2>
              {isSelectedEmpty && (
                <div className="mt-4">
                  <EmptyState
                    text={
                      type === 'competences'
                        ? t('osaamissuosittelija.competence.none-selected')
                        : t('osaamissuosittelija.interest.none-selected')
                    }
                    testId="empty-state"
                  />
                </div>
              )}
              {!isSelectedEmpty && (
                <>
                  <span className="text-help text-secondary-gray">{t('osaamissuosittelija.interest.remove')}</span>

                  <div aria-labelledby={selectedLabelId} className="min-h-[144px] overflow-y-auto mt-4">
                    <ul className="flex flex-wrap gap-3">
                      {selected.map((k) => (
                        <li key={k.uri} className="max-w-full">
                          <Tag
                            label={k.nimi[language] ?? k.uri}
                            sourceType={OSAAMINEN_COLOR_MAP['KIINNOSTUS']}
                            variant="added"
                            onClick={(e) => {
                              setTagsPendingRemoval((prev) => [...prev, k.uri]);
                              animateHideElement(e.currentTarget, () => {
                                // eslint-disable-next-line sonarjs/no-nested-functions
                                setSelected((prevState) => {
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

            <div className={cx('flex gap-4 items-center mb-1', selectedVisible && 'hidden')}>
              <InputField
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={LIMITS.TEXT_INPUT}
                hideLabel
                placeholder={t('tool.my-own-data.virtual-assistant.respond-to-chat')}
                className="p-4! text-[16px]! leading-[18px]!"
                testId="va-input"
                widthVariant="full"
              />
              <button
                type="button"
                disabled={isSendDisabled}
                onClick={updateHistory}
                aria-label={t('tool.my-own-data.virtual-assistant.send')}
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
                const newOsaamisetOrKiinnostukset = selected.map((k) => ({
                  id: k.uri,
                  nimi: k.nimi,
                  kuvaus: k.kuvaus,
                  tyyppi: 'KARTOITETTU' as const,
                }));

                if (type === 'competences') {
                  const allOsaamiset = [...toolStore.osaamiset, ...newOsaamisetOrKiinnostukset];
                  toolStore.setOsaamiset([...removeDuplicatesByKey(allOsaamiset, (o) => o.id)]);
                  toast.success(
                    t('tool.my-own-data.competences.virtual-assistant.x-added', {
                      count: selected.length,
                    }),
                  );
                } else {
                  const allKiinnostukset = [...toolStore.kiinnostukset, ...newOsaamisetOrKiinnostukset];
                  toolStore.setKiinnostukset([...removeDuplicatesByKey(allKiinnostukset, (k) => k.id)]);
                  toast.success(
                    t('tool.my-own-data.interests.virtual-assistant.x-added', {
                      count: selected.length,
                    }),
                  );
                }

                clearState();
                setIsOpen(false);
              }}
              label={t('save')}
              variant="accent"
              disabled={isSelectedEmpty}
              size={sm ? 'lg' : 'sm'}
            />
          </div>
        }
      />
    </div>
  );
};
