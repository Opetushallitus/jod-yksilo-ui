/* eslint-disable sonarjs/no-clear-text-protocols */
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/api/client';
import WorkHistoryWizard from './WorkHistoryWizard';

vi.mock('@/hooks/useEscHandler', () => ({
  useEscHandler: vi.fn(),
}));
vi.mock('@jod/design-system', async (importOriginal) => {
  const original = await importOriginal<typeof import('@jod/design-system')>();
  return {
    ...original,
    useMediaQueries: () => ({ sm: true }),
  };
});
vi.mock('@/hooks/useModal', () => ({
  useModal: vi.fn(() => ({
    showDialog: vi.fn(),
  })),
}));
vi.mock('react-router', () => ({
  useRevalidator: () => ({ revalidate: vi.fn() }),
}));
vi.mock('@/utils', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/utils')>();
  return {
    ...original,
    getDatePickerTranslations: vi.fn(),
  };
});
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: (key: string, opts?: any) => {
      if (opts) {
        // simple interpolation if needed for substitute values
        return key.replace(/\{\{(\w+)\}\}/g, (_, k) => opts[k] || '');
      }
      return key;
    },
    i18n: {
      language: 'fi',
      changeLanguage: vi.fn(),
    },
  }),
}));
vi.mock('@/i18n/config', () => ({
  default: {
    t: (key: string) => key,
    options: {
      fallbackLng: 'fi',
    },
  },
}));

vi.mock('@/api/client', () => ({
  client: {
    POST: vi.fn(),
    GET: vi.fn(),
  },
}));

describe('WorkHistoryWizard', async () => {
  const onClose = vi.fn();
  const mockEhdotukset = [
    {
      osuvuus: 100,
      uri: 'http://data.europa.eu/esco/skill/test',
    },
  ];
  const mockOsaamiset = {
    maara: 1,
    sivuja: 1,
    sisalto: [
      {
        uri: 'http://data.europa.eu/esco/skill/test',
        nimi: {
          fi: 'testiosaaminen',
        },
        kuvaus: {
          fi: 'kuvaus',
        },
      },
    ],
  };

  const mockPost = vi.mocked(client.POST);
  const mockGet = vi.mocked(client.GET);

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('calls onClose when cancel button is clicked', async () => {
    await act(async () => {
      render(<WorkHistoryWizard isOpen={true} onClose={onClose} />);
    });
    const cancelBtn = screen.getByText('cancel');
    await userEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('goes through the wizard with valid data and calls save', async () => {
    userEvent.setup();
    await act(async () => {
      render(<WorkHistoryWizard isOpen={true} onClose={onClose} />);
    });

    const nextBtn = screen.getByRole('button', { name: 'next' });
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();

    // First step: Workplace
    // Fill in the form fields
    const tyonantajaInput = screen.getByRole('textbox', { name: 'work-history.employer' });
    await userEvent.type(tyonantajaInput, 'Lorem Oy');
    await userEvent.tab();

    const toimenkuvaInput = screen.getByRole('textbox', { name: 'work-history.job-description' });
    await userEvent.type(toimenkuvaInput, 'Lorem ipsum');
    await userEvent.tab();

    const alkuPvmInput = screen.getByRole('textbox', { name: 'started' });
    expect(alkuPvmInput).toBeInTheDocument();
    await userEvent.type(alkuPvmInput, '01.01.2020');
    await userEvent.tab();

    const loppuPvmInput = screen.getByRole('textbox', { name: 'ended' });
    await userEvent.type(loppuPvmInput, '01.01.2021');
    expect(loppuPvmInput).toBeInTheDocument();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    expect(alkuPvmInput).toHaveValue('1.1.2020');
    expect(loppuPvmInput).toHaveValue('1.1.2021');

    await waitFor(() => {
      expect(nextBtn).toBeEnabled();
    });
    await userEvent.click(nextBtn);

    // Second step: Competences
    // Select a competence from osaamissuosittelija
    const title = await screen.findByText('work-history.identify-competences');
    expect(title).toBeInTheDocument();

    mockPost.mockImplementationOnce(() => Promise.resolve({ data: mockEhdotukset }));
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
        data: mockOsaamiset,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any),
    );

    const suosittelijaInput = screen.getByRole('textbox', { name: 'osaamissuosittelija.competence.identify' });
    expect(suosittelijaInput).toBeInTheDocument();
    await userEvent.type(suosittelijaInput, 'test');
    await userEvent.tab();
    await userEvent.tab();

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
      expect(mockGet).toHaveBeenCalled();
    });

    const tag = screen.getByRole('button', { name: 'testiosaaminen' });
    expect(tag).toBeInTheDocument();
    await userEvent.click(tag);

    // Third step: Summary
    // Check that the summary displays the entered data
    await userEvent.click(nextBtn);

    const saveButton = screen.getByRole('button', { name: 'save' });
    await waitFor(() => {
      expect(saveButton).toBeInTheDocument();
      expect(screen.getByText('Lorem Oy')).toBeInTheDocument();
      expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();
    });

    // Click save and check that the POST request is made
    await userEvent.click(saveButton);
    expect(mockPost).toHaveBeenCalledWith('/api/profiili/tyopaikat', {
      body: {
        nimi: {
          fi: 'Lorem Oy',
        },
        toimenkuvat: [
          {
            nimi: {
              fi: 'Lorem ipsum',
            },
            alkuPvm: '2020-01-01',
            loppuPvm: '2021-01-01',
            osaamiset: ['http://data.europa.eu/esco/skill/test'],
          },
        ],
      },
    });
  });

  it('handles form validation', async () => {
    userEvent.setup();
    await act(async () => {
      render(<WorkHistoryWizard isOpen={true} onClose={onClose} />);
    });

    const nextBtn = screen.getByRole('button', { name: 'next' });
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();

    const tyonantajaInput = screen.getByRole('textbox', { name: 'work-history.employer' });
    const toimenkuvaInput = screen.getByRole('textbox', { name: 'work-history.job-description' });
    const alkuPvmInput = screen.getByRole('textbox', { name: 'started' });
    const loppuPvmInput = screen.getByRole('textbox', { name: 'ended' });

    const inputs = [tyonantajaInput, toimenkuvaInput, alkuPvmInput, loppuPvmInput];

    for (const input of inputs) {
      expect(input).toBeInTheDocument();
      await userEvent.type(input, ' ');
      await userEvent.tab();
    }

    await waitFor(() => {
      expect(nextBtn).toBeDisabled();
      // Työnantaja, toimenkuva and alkuPvm should show required error
      expect(screen.getAllByText('error.form.required')).toHaveLength(3);
    });
  });
});
