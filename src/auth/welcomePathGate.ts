let showed = false;

export const hasWelcomePathBeenShown = () => showed;

export const markWelcomePathShown = () => {
  showed = true;
};

/** Reset the welcome-path gate so the next login triggers the redirect again. */
export const resetWelcomePathGate = () => {
  showed = false;
};
