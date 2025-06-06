/* eslint-disable sonarjs/todo-tag */
let isLoaded = false;

export const loadAiAgentFloat = () => {
  if (isLoaded) {
    return;
  }

  const script = document.createElement('script');
  // TODO: Use environment specific script URL?
  script.src = 'https://okm-ps32.aiagent.fi/integrations/float/ai-agent-float.js';
  script.async = true;
  document.body.appendChild(script);

  isLoaded = true;
};
