import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VirtualAssistant } from './VirtualAssistant';

const mocks = vi.hoisted(() => ({
  postMock: vi.fn(),
  findMock: vi.fn(),
  setOsaamiset: vi.fn(),
  setKiinnostukset: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' as const },
  }),
  Trans: ({ i18nKey }: { i18nKey?: string }) => <>{i18nKey}</>,
}));

vi.mock('@/api/client', () => ({
  client: {
    POST: (...args: unknown[]) => mocks.postMock(...args) as Promise<{ data?: unknown; error?: unknown }>,
  },
}));

vi.mock('@/api/osaamiset', () => ({
  osaamiset: {
    find: (...args: unknown[]) => mocks.findMock(...args),
  },
}));

vi.mock('@/utils/animations', () => ({
  animateElementToTarget: vi.fn(),
  animateHideElement: vi.fn((_el: HTMLElement, onDone?: () => void) => {
    onDone?.();
  }),
}));

vi.mock('@/stores/useToolStore', () => ({
  useToolStore: () => ({
    osaamiset: [],
    kiinnostukset: [],
    setOsaamiset: mocks.setOsaamiset,
    setKiinnostukset: mocks.setKiinnostukset,
  }),
}));

vi.mock('react-hot-toast/headless', () => ({
  default: {
    success: mocks.toastSuccess,
  },
}));

const mockOsaaminen = (uri: string, fiName: string) => ({
  uri,
  nimi: { fi: fiName, en: fiName, sv: fiName },
  kuvaus: { fi: 'Kuvaus', en: 'Description', sv: 'Beskrivning' },
});

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
};

const keys = {
  competencesTitle: 'tool.my-own-data.competences.virtual-assistant.title',
  interestsTitle: 'tool.my-own-data.interests.virtual-assistant.title',
  competencesOpen: 'tool.my-own-data.competences.virtual-assistant.open',
  interestsOpen: 'tool.my-own-data.interests.virtual-assistant.open',
  competencesDescription: 'tool.my-own-data.competences.virtual-assistant.description',
  proposedCompetences: 'proposed-competences',
  proposedInterests: 'proposed-interests',
  error: 'tool.my-own-data.virtual-assistant.error',
  competencesSelectedTab: 'tool.my-own-data.competences.virtual-assistant.selected-tab',
  save: 'save',
  cancel: 'common:cancel',
  competencesXAdded: 'tool.my-own-data.competences.virtual-assistant.x-added',
  interestsXAdded: 'tool.my-own-data.interests.virtual-assistant.x-added',
} as const;

describe('VirtualAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findMock.mockImplementation(async (uris?: Iterable<string>) => {
      const list = uris ? [...uris] : [];
      return list.map((uri, i) => mockOsaaminen(uri, `Osaaminen ${i + 1}`));
    });
    mocks.postMock.mockImplementation(async (path: string) => {
      if (path === '/api/keskustelut') {
        return {
          data: {
            id: 'conversation-1',
            vastaus: 'Assistant reply',
            ehdotukset: ['https://example.esco/skill/1'],
          },
          error: undefined,
        };
      }
      if (path.startsWith('/api/keskustelut/')) {
        return {
          data: { vastaus: 'Follow-up reply', ehdotukset: [] },
          error: undefined,
        };
      }
      return { data: undefined, error: { message: 'not found' } };
    });
  });

  const openModal = async (variant: 'competences' | 'interests' = 'competences') => {
    const dialogName = variant === 'competences' ? keys.competencesTitle : keys.interestsTitle;
    render(<VirtualAssistant type={variant} />);
    fireEvent.click(screen.getByTestId('open-va'));
    expect(await screen.findByRole('dialog', { name: dialogName })).toBeInTheDocument();
  };

  it('renders open control with expected competences label', () => {
    render(<VirtualAssistant type="competences" />);
    expect(screen.getByTestId('open-va')).toHaveAccessibleName(keys.competencesOpen);
  });

  it('renders open control with expected interests label', () => {
    render(<VirtualAssistant type="interests" />);
    expect(screen.getByTestId('open-va')).toHaveAccessibleName(keys.interestsOpen);
  });

  it('opens modal and shows intro copy for competences', async () => {
    await openModal('competences');
    expect(screen.getByText(keys.competencesDescription)).toBeInTheDocument();
  });

  it('keeps send disabled until input has at least two non-whitespace characters', async () => {
    await openModal('competences');
    const input = screen.getByTestId('va-input');
    const send = screen.getByTestId('va-send');

    expect(send).toBeDisabled();
    fireEvent.change(input, { target: { value: 'a' } });
    expect(send).toBeDisabled();
    fireEvent.change(input, { target: { value: '  a ' } });
    expect(send).toBeDisabled();
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(send).not.toBeDisabled();
  });

  it('sends message on button click, shows transcript, and loads proposals for competences', async () => {
    await openModal('competences');
    const input = screen.getByTestId('va-input');
    fireEvent.change(input, { target: { value: 'Ensimmäinen viesti' } });
    fireEvent.click(screen.getByTestId('va-send'));

    await waitFor(() => {
      expect(screen.getByTestId('va-transcript')).toHaveTextContent('Ensimmäinen viesti');
    });
    await waitFor(() => {
      expect(screen.getByTestId('va-transcript')).toHaveTextContent('Assistant reply');
    });
    await waitFor(() => {
      expect(screen.getByText(keys.proposedCompetences)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Osaaminen 1' })).toBeInTheDocument();

    expect(mocks.postMock).toHaveBeenCalledWith(
      '/api/keskustelut',
      expect.objectContaining({
        body: expect.objectContaining({
          tila: 'OSAAMINEN',
          viesti: expect.objectContaining({ fi: 'Ensimmäinen viesti' }),
        }),
      }),
    );
    expect(mocks.findMock).toHaveBeenCalledWith(['https://example.esco/skill/1']);
  });

  it('uses KIINNOSTUKSET tila and shows proposed interests heading for interests variant', async () => {
    await openModal('interests');
    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Kiinnostun musiikista' } });
    fireEvent.click(screen.getByTestId('va-send'));

    await waitFor(() => {
      expect(mocks.postMock).toHaveBeenCalledWith(
        '/api/keskustelut',
        expect.objectContaining({
          body: expect.objectContaining({ tila: 'KIINNOSTUKSET' }),
        }),
      );
    });
    await waitFor(() => {
      expect(screen.getByText(keys.proposedInterests)).toBeInTheDocument();
    });
  });

  it('continues conversation with path including id after first reply', async () => {
    await openModal('competences');
    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Yksi' } });
    fireEvent.click(screen.getByTestId('va-send'));
    await waitFor(() => expect(screen.getByTestId('va-transcript')).toHaveTextContent('Assistant reply'));

    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Kaksi' } });
    fireEvent.click(screen.getByTestId('va-send'));

    await waitFor(() => {
      expect(mocks.postMock).toHaveBeenCalledWith(
        '/api/keskustelut/{id}',
        expect.objectContaining({
          params: { path: { id: 'conversation-1' } },
          body: expect.objectContaining({ fi: 'Kaksi' }),
        }),
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('va-transcript')).toHaveTextContent('Follow-up reply');
    });
  });

  it('strips reference_information tags from first conversation reply', async () => {
    mocks.postMock.mockImplementationOnce(async (path: string) => {
      if (path === '/api/keskustelut') {
        return {
          data: {
            id: 'conversation-1',
            vastaus: 'Näkyvä teksti<reference_information>Piilotettu</reference_information> ja loppu',
            ehdotukset: [],
          },
          error: undefined,
        };
      }
      return { data: undefined, error: {} };
    });

    await openModal('competences');
    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Kysymys' } });
    fireEvent.click(screen.getByTestId('va-send'));

    await waitFor(() => {
      expect(screen.getByTestId('va-transcript')).toHaveTextContent('Näkyvä teksti ja loppu');
    });
    expect(screen.getByTestId('va-transcript')).not.toHaveTextContent('Piilotettu');
  });

  it('shows error translation when API returns error', async () => {
    mocks.postMock.mockResolvedValueOnce({ data: undefined, error: { status: 500 } });

    await openModal('interests');
    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Virhe' } });
    fireEvent.click(screen.getByTestId('va-send'));

    await waitFor(() => {
      expect(screen.getByTestId('va-transcript')).toHaveTextContent(keys.error);
    });
  });

  it('sends on Enter without Shift when send is enabled', async () => {
    await openModal('competences');
    const input = screen.getByTestId('va-input');
    fireEvent.change(input, { target: { value: 'Enter lähettää' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(screen.getByTestId('va-transcript')).toHaveTextContent('Enter lähettää');
    });
  });

  it('does not send on Shift+Enter', async () => {
    await openModal('competences');
    const input = screen.getByTestId('va-input');
    fireEvent.change(input, { target: { value: 'Rivi' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(mocks.postMock).not.toHaveBeenCalled();
  });

  it('adds proposal to selected tab and enables save', async () => {
    await openModal('competences');
    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Valinta' } });
    fireEvent.click(screen.getByTestId('va-send'));
    await waitFor(() => screen.getByRole('button', { name: 'Osaaminen 1' }));

    fireEvent.click(screen.getByRole('button', { name: 'Osaaminen 1' }));

    fireEvent.click(screen.getByRole('tab', { name: new RegExp(keys.competencesSelectedTab) }));
    const selectedPanel = screen.getByTestId('va-selected');
    await waitFor(() => {
      expect(within(selectedPanel).getByRole('button', { name: 'Osaaminen 1' })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: keys.save })).not.toBeDisabled();
  });

  it('save merges competences into store and shows toast', async () => {
    await openModal('competences');
    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Tallenna testi' } });
    fireEvent.click(screen.getByTestId('va-send'));
    await waitFor(() => screen.getByRole('button', { name: 'Osaaminen 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Osaaminen 1' }));

    fireEvent.click(screen.getByRole('button', { name: keys.save }));

    await waitFor(() => {
      expect(mocks.setOsaamiset).toHaveBeenCalled();
    });
    const setterArg = mocks.setOsaamiset.mock.calls[0][0];
    expect(Array.isArray(setterArg)).toBe(true);
    expect(setterArg[0]).toMatchObject({
      id: 'https://example.esco/skill/1',
      tyyppi: 'KARTOITETTU',
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(keys.competencesXAdded);
  });

  it('save merges interests into store for interests variant', async () => {
    await openModal('interests');
    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Tallenna kiinnostus' } });
    fireEvent.click(screen.getByTestId('va-send'));
    await waitFor(() => screen.getByRole('button', { name: 'Osaaminen 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Osaaminen 1' }));

    fireEvent.click(screen.getByRole('button', { name: keys.save }));

    await waitFor(() => {
      expect(mocks.setKiinnostukset).toHaveBeenCalled();
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(keys.interestsXAdded);
    expect(mocks.setOsaamiset).not.toHaveBeenCalled();
  });

  it('cancel closes modal and clears draft state on next open', async () => {
    await openModal('competences');
    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Luonnos' } });
    fireEvent.click(screen.getByRole('button', { name: keys.cancel }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: keys.competencesTitle })).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('open-va'));
    expect(await screen.findByRole('dialog', { name: keys.competencesTitle })).toBeInTheDocument();
    expect(screen.getByTestId('va-input')).toHaveValue('');
    expect(screen.getByTestId('va-transcript')).not.toHaveTextContent('Luonnos');
  });

  it('does not restore an aborted reply to history after cancel', async () => {
    const response = createDeferred<{ data?: unknown; error?: unknown }>();
    let signal: AbortSignal | undefined;
    mocks.postMock.mockImplementationOnce((_path: string, options?: { signal?: AbortSignal }) => {
      signal = options?.signal;
      return response.promise;
    });

    await openModal('competences');
    fireEvent.change(screen.getByTestId('va-input'), { target: { value: 'Kesken oleva kysymys' } });
    fireEvent.click(screen.getByTestId('va-send'));

    await waitFor(() => {
      expect(mocks.postMock).toHaveBeenCalledWith('/api/keskustelut', expect.any(Object));
    });
    expect(screen.getByTestId('va-transcript')).toHaveTextContent('Kesken oleva kysymys');

    fireEvent.click(screen.getByRole('button', { name: keys.cancel }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: keys.competencesTitle })).not.toBeInTheDocument();
    });
    expect(signal?.aborted).toBe(true);

    await act(async () => {
      response.resolve({
        data: {
          id: 'conversation-1',
          vastaus: 'Myöhässä tullut vastaus',
          ehdotukset: ['https://example.esco/skill/late'],
        },
        error: undefined,
      });
    });

    fireEvent.click(screen.getByTestId('open-va'));
    expect(await screen.findByRole('dialog', { name: keys.competencesTitle })).toBeInTheDocument();
    expect(screen.getByTestId('va-transcript')).not.toHaveTextContent('Kesken oleva kysymys');
    expect(screen.getByTestId('va-transcript')).not.toHaveTextContent('Myöhässä tullut vastaus');
  });

  it('shows empty state on selected tab until something is chosen', async () => {
    await openModal('competences');
    fireEvent.click(screen.getByRole('tab', { name: new RegExp(keys.competencesSelectedTab) }));
    expect(within(screen.getByTestId('va-selected')).getByTestId('empty-state')).toBeInTheDocument();
  });
});
