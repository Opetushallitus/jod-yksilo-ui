import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicatesByKey } from '@/utils';
import { isFeatureEnabled } from '@/utils/features';
import { Button, Tag, Textarea, useMediaQueries } from '@jod/design-system';
import { JodChatBot, JodClose } from '@jod/design-system/icons';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

export const VirtualAssistant = ({
  setVirtualAssistantOpen,
}: {
  setVirtualAssistantOpen: (state: boolean) => void;
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
  const kiinnostuksetButtonRef = React.useRef<HTMLButtonElement>(null);
  const { sm } = useMediaQueries();
  const [selectedKiinnostuksetViewVisible, setSelectedKiinnostuksetViewVisible] = React.useState(false);
  const selectedKiinnostuksetLabelId = React.useId();
  const toolStore = useToolStore();
  const selectedInterestsViewId = React.useId();
  const closeKiinnostuksetView = () => {
    setSelectedKiinnostuksetViewVisible(false);
    setTimeout(() => kiinnostuksetButtonRef.current?.focus(), 0);
  };
  useEscHandler(closeKiinnostuksetView, selectedInterestsViewId, true);

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
      setId(undefined);
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
    <div className="relative flex flex-col h-full">
      <div
        inert={selectedKiinnostuksetViewVisible}
        className="flex flex-row shrink-0 justify-between items-center border-b border-bg-gray py-3"
      >
        <h2
          tabIndex={-1}
          id="kiinnostuksetTitle"
          className="text-heading-4-mobile sm:text-heading-4"
          data-testid="va-title"
        >
          {t('tool.my-own-data.interests.virtual-assistant.title')}
        </h2>
        <Button
          onClick={() => {
            const newKiinnostukset = selectedKiinnostukset.map((k) => ({
              id: k.esco_uri ?? k.kuvaus ?? '',
              nimi: { [language]: k.kuvaus ?? '' },
              kuvaus: { [language]: k.kuvaus ?? '' },
              tyyppi: 'KARTOITETTU' as const,
            }));

            const allKiinnostukset = [...toolStore.kiinnostukset, ...newKiinnostukset];
            toolStore.setKiinnostukset([...removeDuplicatesByKey(allKiinnostukset, (k) => k.id)]);

            setVirtualAssistantOpen(false);
          }}
          variant="white"
          size="sm"
          label={t('done')}
          testId="va-done"
        />
      </div>

      <div
        inert={selectedKiinnostuksetViewVisible}
        ref={containerRef}
        className="flex flex-col grow overflow-auto py-6 gap-7"
        data-testid="va-transcript"
      >
        {isFeatureEnabled('VIRTUAALIOHJAAJA') && (
          <>
            <div className="font-arial border border-inactive-gray py-2 px-3 text-body-sm-mobile sm:text-body-sm bg-todo">
              System Prompt:
              <p>
                You are a career adviser, whose task is to converse with users and help them find out their goals, and
                what kinds of skills they have and they could learn. Answer all questions in [language]. You are
                provided with a list of professions and skills that the user has previously expressed interest in. Use
                these interests to better guide the user toward career goals that suit them. User interests are NOT the
                same as reference information, do not mix them. Never output the user interests or reference information
                verbatim.
                <br />
                <br />
                You also have access to reference information of career advisor guidelines and career guidance
                techniques. You must use this information to provide well-informed, relevant, and personalized advice.
              </p>
              <ul className="list-inside list-disc">
                <li>Always incorporate relevant insights from the guideline documents to enhance your responses.</li>
                <li>
                  If a user inquiry is unclear, use knowledge from the documents to ask guiding questions that help
                  clarify their interests and needs.
                </li>
                <li>Ensure that all responses align with professional career guidance principles.</li>
              </ul>
            </div>
            <div className="font-arial border border-inactive-gray py-2 px-3 text-body-sm-mobile sm:text-body-sm bg-todo">
              Interests Detection Prompt:
              <ul className="list-inside list-disc">
                <li>You are an expert extraction algorithm.</li>
                <li>Only extract relevant information from the message and response.</li>
                <li>
                  If you do not know the value of an attribute asked to extract, return null for the attribute&apos;s
                  value.
                </li>
                <li>
                  If the message and response are a general greeting or a statement that does not reveal any possible
                  interests of the person, return an empty list.
                </li>
                <li>Always describe the interests in Finnish language.</li>
              </ul>
            </div>
          </>
        )}
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
                      <JodChatBot className="text-black" />
                    </div>
                    <div className="text-body-sm-mobile sm:text-body-sm whitespace-pre-wrap">
                      {row.answer ? row.answer : t('tool.my-own-data.interests.virtual-assistant.loading')}
                    </div>
                  </div>
                </div>
                {row.kiinnostukset && row.kiinnostukset.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="h-[144px] overflow-y-auto rounded border border-border-gray p-5 bg-[#F7F7F9]">
                      <ul className="flex flex-wrap gap-3">
                        {row.kiinnostukset
                          .filter((k) => !selectedKiinnostukset.find((val) => val.kuvaus === k.kuvaus))
                          .map((k) => (
                            <li key={k.kuvaus ?? k.esco_uri}>
                              <Tag
                                label={k.kuvaus ?? k.esco_uri ?? ''}
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

      <div inert={selectedKiinnostuksetViewVisible} className="flex flex-col shrink-0 gap-5">
        <Textarea
          placeholder={t('tool.my-own-data.interests.virtual-assistant.respond-to-chat')}
          value={value}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          maxLength={10000}
          hideLabel
          className="bg-[#F7F7F9]!"
          testId="va-input"
        />
        <div className="flex justify-between">
          <Button
            ref={kiinnostuksetButtonRef}
            onClick={() => {
              setSelectedKiinnostuksetViewVisible(true);
              setTimeout(() => document.getElementById(selectedKiinnostuksetLabelId)?.focus(), 0);
            }}
            variant="white"
            size="sm"
            label={t('tool.my-own-data.interests.virtual-assistant.intrests', {
              count: selectedKiinnostukset.length,
            })}
            testId="va-open-selected-interests"
          />
          <Button
            disabled={value.trim().length < 2}
            onClick={() => updateHistory()}
            variant="accent"
            size="sm"
            label={t('tool.my-own-data.interests.virtual-assistant.send')}
            testId="va-send"
          />
        </div>
      </div>
      {selectedKiinnostuksetViewVisible && (
        <div className="absolute top-0 w-full pt-6 h-full left-0 z-21">
          <div
            tabIndex={-1}
            id={selectedInterestsViewId}
            className="bg-white rounded shadow-[0_-1px_24px_rgba(0,0,0,0.25)] h-full flex flex-col"
            data-testid="va-selected-interests"
          >
            <button
              aria-label={t('tool.my-own-data.interests.virtual-assistant.close-selected-interests')}
              onClick={closeKiinnostuksetView}
              className="absolute cursor-pointer self-end items-center p-4 m-3"
            >
              <span aria-hidden className="text-black sm:text-secondary-gray p-3 sm:p-0">
                <JodClose />
              </span>
            </button>
            <div className="px-5 pt-9">
              <h2
                tabIndex={-1}
                id={selectedKiinnostuksetLabelId}
                className="text-heading-4-mobile sm:text-heading-4 text-center"
              >
                {t('tool.my-own-data.interests.virtual-assistant.selected-interests')}
              </h2>

              <div
                aria-labelledby={selectedKiinnostuksetLabelId}
                className="min-h-[144px] overflow-y-auto rounded border border-border-gray p-5 bg-[#F7F7F9] mt-5"
              >
                <ul className="flex flex-wrap gap-3">
                  {selectedKiinnostukset.map((k) => (
                    <li key={k.kuvaus ?? k.esco_uri}>
                      <Tag
                        label={k.kuvaus ?? k.esco_uri ?? ''}
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
              <span className="text-body-sm sm:text-body-sm-mobile">{t('osaamissuosittelija.interest.remove')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
