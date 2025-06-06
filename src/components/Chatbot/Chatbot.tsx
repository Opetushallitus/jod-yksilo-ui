/* eslint-disable sonarjs/todo-tag */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadAiAgentFloat } from './loadAiAgentFloat';

// TODO: Use environment and language specific agent IDs
const agents: Record<'fi' | 'sv' | 'en', string> = {
  fi: '2c134474-326f-4456-9139-8e585a569a9a',
  sv: 'd41ea75b-628f-4420-9e4a-7431ffabb047',
  en: '37f50124-4dec-4cab-8bc6-f8d2ea5bfe21',
};

export const Chatbot = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  React.useEffect(() => {
    loadAiAgentFloat();
  }, []);

  return (
    <>
      {/* @ts-ignore */}
      <ai-agent-float
        key={language} // Force re-render on language change
        agent={agents[language as 'fi' | 'sv' | 'en']}
        server="https://okm-ps32.aiagent.fi/services/sva"
        agentname={t('chatbot.agent-name')}
        primary="#20c997"
        primarycontrast="#eeedeb"
        paper="#eeedeb"
        banner="https://aiw-dev.aiagent.fi/integrations/assets/twoday-wordmark-RGB_WHITE-Df4N7RQF.png"
        agenticon="https://aiw-dev.aiagent.fi/integrations/assets/twoday-logomark-RGB-WHITE-C2C4UZdK.png"
        header={t('chatbot.header')}
        errormessage={t('chatbot.error-message')}
        error="#ED1C24"
        text="#000000"
        multilineinput="true"
        openwindowtext={t('chatbot.open-window-text')}
        greeting={t('chatbot.greeting')}
        textinputplaceholder={t('chatbot.text-input-placeholder')}
        textinputhelper={t('chatbot.text-input-helper')}
        fontfamily="sans-serif"
        openchaticon="https://aiw-dev.aiagent.fi/integrations/assets/twoday-logomark-RGB-WHITE-C2C4UZdK.png"
        feedbacktype="Basic"
        width="30em"
        dense="false"
        enablescroll="true"
        zindex="1"
      />
    </>
  );
};
