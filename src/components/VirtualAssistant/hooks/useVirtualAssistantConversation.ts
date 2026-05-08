import React from 'react';
import { useTranslation } from 'react-i18next';

import { client } from '@/api/client';
import { type OsaaminenDto, osaamiset } from '@/api/osaamiset';

import { getVirtualAssistantConfig } from '../virtualAssistantConfig';
import type { VirtualAssistantMessageRow, VirtualAssistantVariant } from '../virtualAssistantTypes';

/** Strips pseudo-XML blocks like `<reference_information>...</reference_information>` from assistant text. */
export const virtualAssistantStripTags = (tagNames: string[], value?: string): string | undefined => {
  const pattern = tagNames.map((tag) => String.raw`<\s*${tag}\b[^>]*>[\s\S]*?<\/\s*${tag}\s*>`).join('|');
  const regex = new RegExp(pattern, 'gi');
  return value?.replace(regex, '');
};

const resolveOsaamisetByUri = async (uris: string[]): Promise<Record<string, OsaaminenDto>> => {
  const osaamisetData = await osaamiset.find(uris);
  return osaamisetData.reduce(
    (acc, osaaminen) => {
      acc[osaaminen.uri] = osaaminen;
      return acc;
    },
    {} as Record<string, OsaaminenDto>,
  );
};

const isAbortError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';

export const useVirtualAssistantConversation = (type: VirtualAssistantVariant, reduceMotion: boolean) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const config = getVirtualAssistantConfig(type, t);

  const [controller, setController] = React.useState(() => new AbortController());
  const [history, setHistory] = React.useState<Record<string, VirtualAssistantMessageRow>>({});
  const [id, setId] = React.useState<string | undefined>(undefined);
  const [value, setValue] = React.useState('');
  const isSendDisabled = React.useMemo(() => value.trim().length < 2, [value]);
  const messageContainerRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current?.scrollHeight,
      behavior: reduceMotion ? 'instant' : 'smooth',
    });
  }, [history, reduceMotion]);

  const sendMessage = React.useCallback(
    async (key: string, messageValue: string) => {
      const conversationId = id;
      const isFollowUp = conversationId !== undefined;
      let data: { vastaus: string; ehdotukset?: string[] } | undefined;
      let error: unknown;
      const signal = controller.signal;

      try {
        if (isFollowUp) {
          const response = await client.POST('/api/keskustelut/{id}', {
            params: { path: { id: conversationId } },
            body: { [language]: messageValue },
            signal,
          });
          data = response.data;
          error = response.error;
        } else {
          const response = await client.POST('/api/keskustelut', {
            body: {
              tila: config.mode,
              viesti: {
                [language]: messageValue,
              },
            },
            signal,
          });
          data = response.data;
          error = response.error;
          setId(response.data?.id);
        }

        if (signal.aborted) {
          return;
        }

        const stripTagNames = isFollowUp
          ? (['reference_information', 'user_interests', 'user_skills'] as const)
          : (['reference_information', 'user_interests'] as const);

        const osaamisetMap = await resolveOsaamisetByUri(data?.ehdotukset ?? []);

        if (signal.aborted) {
          return;
        }

        setHistory((prevState) => ({
          ...prevState,
          [key]: {
            ...prevState[key],
            answer: error
              ? t('tool.my-own-data.virtual-assistant.error')
              : virtualAssistantStripTags([...stripTagNames], data?.vastaus),
            ehdotukset: error ? undefined : data?.ehdotukset?.map((k) => osaamisetMap[k]),
          },
        }));
      } catch (error) {
        if (signal.aborted || isAbortError(error)) {
          return;
        }

        setHistory((prevState) => ({
          ...prevState,
          [key]: {
            ...prevState[key],
            answer: t('tool.my-own-data.virtual-assistant.error'),
          },
        }));
      }
    },
    [config.mode, controller, id, language, t],
  );

  const updateHistory = React.useCallback(() => {
    if (value === '') {
      return;
    }
    const key = crypto.randomUUID();
    setHistory((prevState) => ({ ...prevState, [key]: { message: value } }));
    void sendMessage(key, value);
    setValue('');
  }, [sendMessage, value]);

  const handleInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (value.trim().length < 2) {
        return;
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        updateHistory();
      }
    },
    [updateHistory, value],
  );

  const clearConversation = React.useCallback(() => {
    controller.abort();
    setController(new AbortController());
    setValue('');
    setId(undefined);
    setHistory({});
  }, [controller]);

  return {
    chat: {
      containerRef,
      history,
      messageContainerRef,
    },
    clearConversation,
    input: {
      handleInputKeyDown,
      isSendDisabled,
      setValue,
      updateHistory,
      value,
    },
  };
};
