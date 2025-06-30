/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadAiAgentFloat } from './loadAiAgentFloat';

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
    <ai-agent-styles
      primary="#ee7c45"
      primarycontrast="#00464a"
      error="#de342b"
      fontfamily="Arial"
      paper="#ffffff"
      text="#1f1f1f"
    >
      <ai-agent-float-container
        key={language} // Force re-render on language change
        width="30em"
        enablescroll="true"
        zindex="1000"
        background="primary"
        backgroundpaper="true"
        language={language}
        agenticon={`${import.meta.env.BASE_URL}chatbot-icon.svg`}
        openwindowtext={t('chatbot.open-window-text')}
        openchatsize="large"
      >
        <div slot="header" className="flex flex-row items-center justify-between grow gap-3 p-5">
          <ai-agent-text>{t('chatbot.header')}</ai-agent-text>
          <ai-agent-icon-button
            icon="menu"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('ai-agent-view-switch-change-view', {
                  detail: { view: 1 },
                }),
              );
            }}
          />
        </div>
        <ai-agent-view-switch slot="content" initialview="0">
          <ai-agent-embed
            slot="view-0"
            agent={agents[language as 'fi' | 'sv' | 'en']}
            server="https://okm-ps32.aiagent.fi/services/sva"
            language={language}
            paper="#ffffff"
            primary="#ee7c45"
            primarycontrast="#00464a"
            text="#1f1f1f"
            error="#de342b"
            fontfamily="Arial"
            agentname={t('chatbot.agent-name')}
            dense="false"
            errormessage={t('chatbot.error-message')}
            feedbacktype="None"
            greeting={t('chatbot.greeting')}
            omitgreeting="false"
            multilineinput="true"
            textinputplaceholder={t('chatbot.text-input-placeholder')}
            textinputhelper={t('chatbot.text-input-helper')}
            width="21.5rem"
          />
          <div slot="view-1" className="flex flex-col items-center gap-5">
            <ai-agent-button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('ai-agent-reset-chat'));
                window.dispatchEvent(
                  new CustomEvent('ai-agent-view-switch-change-view', {
                    detail: { view: 0 },
                  }),
                );
              }}
            >
              {t('chatbot.erase-chat-history')}
            </ai-agent-button>
            <ai-agent-button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('ai-agent-save-chat'));
              }}
            >
              {t('chatbot.save-chat-as-csv')}
            </ai-agent-button>
            <ai-agent-button
              variant="outlined"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('ai-agent-view-switch-change-view', {
                    detail: { view: 0 },
                  }),
                );
              }}
            >
              {t('chatbot.close')}
            </ai-agent-button>
          </div>
        </ai-agent-view-switch>
      </ai-agent-float-container>
    </ai-agent-styles>
  );
};
