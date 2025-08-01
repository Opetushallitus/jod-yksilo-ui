/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-clear-text-protocols */
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/api/client';
import { ModalProvider } from '@/hooks/useModal';
import AddOrEditToimenkuvaModal from './AddOrEditToimenkuvaModal';

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
    PUT: vi.fn(),
  },
}));

const doRender = (isOpen = true, onClose: () => void, tyopaikkaId: string, toimenkuvaId?: string) => {
  return render(
    <ModalProvider>
      <AddOrEditToimenkuvaModal
        isOpen={isOpen}
        onClose={onClose}
        tyopaikkaId={tyopaikkaId}
        toimenkuvaId={toimenkuvaId}
      />
      ,
    </ModalProvider>,
  );
};

describe('AddOrEditToimenkuvaModal', async () => {
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
  const mockPut = vi.mocked(client.PUT);

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('Edit existing toimenkuva (toimenkuvaId is present)', () => {
    const tyopaikkaId = '123';
    const toimenkuvaId = '456';

    it('goes through the wizard with valid data and calls save', async () => {
      userEvent.setup();
      mockGet.mockClear();

      // Mock initial API calls, first for osaamiset, then for toimenkuva
      mockGet.mockResolvedValueOnce({
        data: [
          {
            id: 'osaaminenId',
            osaaminen: {
              uri: 'http://data.europa.eu/esco/skill/existing',
              nimi: {
                fi: 'existing',
              },
            },
          },
        ],
      } as any);
      mockGet.mockResolvedValueOnce({
        data: {
          id: toimenkuvaId,
          nimi: { fi: 'Existing Toimenkuva' },
          alkuPvm: '2020-01-01',
          loppuPvm: '2021-01-01',
          osaamiset: ['http://data.europa.eu/esco/skill/existing'],
        },
      } as any);

      await act(async () => {
        doRender(true, onClose, tyopaikkaId, toimenkuvaId);
      });

      await waitFor(() => {
        expect(mockGet.mock.calls).toHaveLength(2);
        expect(mockGet.mock.calls[0]).toEqual(expect.objectContaining(['/api/profiili/osaamiset']));

        expect(mockGet.mock.calls[1]).toEqual(
          expect.objectContaining([
            '/api/profiili/tyopaikat/{id}/toimenkuvat/{toimenkuvaId}',
            { params: { path: { id: tyopaikkaId, toimenkuvaId } } },
          ]),
        );
      });

      // Check that the inputs are populated with the existing toimenkuva data
      const toimenkuvaInput = screen.getByRole('textbox', { name: 'work-history.job-description' });
      const alkuPvmInput = screen.getByRole('textbox', { name: 'started' });
      const loppuPvm = screen.getByRole('textbox', { name: 'ended' });

      await waitFor(() => {
        expect(toimenkuvaInput).toHaveValue('Existing Toimenkuva');
        expect(alkuPvmInput).toHaveValue('1.1.2020');
        expect(loppuPvm).toHaveValue('1.1.2021');
      });

      // Change the values and proceed
      await userEvent.clear(toimenkuvaInput);
      await userEvent.type(toimenkuvaInput, 'Uusi toimenkuva');
      await userEvent.tab();

      await userEvent.clear(alkuPvmInput);
      await userEvent.type(alkuPvmInput, '01.01.2015');
      await userEvent.tab();

      await userEvent.clear(loppuPvm);
      await userEvent.type(loppuPvm, '01.01.2016');
      await userEvent.tab();

      const nextBtn = screen.getByRole('button', { name: 'next' });
      expect(nextBtn).toBeInTheDocument();

      await waitFor(() => {
        expect(nextBtn).toBeEnabled();
      });
      await userEvent.click(nextBtn);

      // Second step: Osaamiset
      // Check that the existing osaaminen is displayed and select a new one
      const title = await screen.findByText('profile.competences.edit');
      expect(title).toBeInTheDocument();

      mockPost.mockImplementationOnce(() => Promise.resolve({ data: mockEhdotukset }));
      mockGet.mockImplementationOnce(() =>
        Promise.resolve({
          data: mockOsaamiset,
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

      const existingTag = screen.getByRole('button', { name: 'existing' });
      await waitFor(() => {
        expect(existingTag).toBeInTheDocument();
      });
      const newTag = screen.getByRole('button', { name: 'testiosaaminen' });
      await waitFor(() => {
        expect(newTag).toBeInTheDocument();
      });
      await userEvent.click(newTag);

      // Check that saving works with edited fields and that new osaaminen is appended
      const saveButton = screen.getByRole('button', { name: 'save' });
      await waitFor(() => {
        expect(saveButton).toBeInTheDocument();
      });

      await userEvent.click(saveButton);
      await waitFor(() => {
        expect(mockPut).toHaveBeenCalledWith('/api/profiili/tyopaikat/{id}/toimenkuvat/{toimenkuvaId}', {
          params: {
            path: {
              id: '123',
              toimenkuvaId: '456',
            },
          },
          body: {
            nimi: {
              fi: 'Uusi toimenkuva',
            },
            id: '456',
            alkuPvm: '2015-01-01',
            loppuPvm: '2016-01-01',
            osaamiset: ['http://data.europa.eu/esco/skill/existing', 'http://data.europa.eu/esco/skill/test'],
          },
        });
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Add new toimenkuva (no "toimenkuvaId" present)', () => {
    it('calls onClose when cancel button is clicked', async () => {
      await act(async () => {
        doRender(true, onClose, '123');
      });
      const cancelBtn = screen.getByText('cancel');
      await userEvent.click(cancelBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it('goes through the wizard with valid data and calls save', async () => {
      userEvent.setup();
      await act(async () => {
        doRender(true, onClose, 'tyopaikkaId');
      });

      const nextBtn = screen.getByRole('button', { name: 'next' });
      expect(nextBtn).toBeInTheDocument();
      expect(nextBtn).toBeDisabled();

      // First step: Toimenkuva
      const toimenkuvaInput = screen.getByRole('textbox', { name: 'work-history.job-description' });
      await userEvent.type(toimenkuvaInput, 'Lorem ipsum toimenkuva');
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

      // Second step: Osaamiset
      const title = await screen.findByText('work-history.identify-competences');
      expect(title).toBeInTheDocument();

      mockPost.mockImplementationOnce(() => Promise.resolve({ data: mockEhdotukset }));
      mockGet.mockImplementationOnce(() =>
        Promise.resolve({
          data: mockOsaamiset,
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
      await waitFor(() => {
        expect(tag).toBeInTheDocument();
      });
      await userEvent.click(tag);

      const saveButton = screen.getByRole('button', { name: 'save' });

      await waitFor(() => {
        expect(saveButton).toBeInTheDocument();
      });

      mockPost.mockClear();
      await userEvent.click(saveButton);
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/api/profiili/tyopaikat/{id}/toimenkuvat', {
          params: {
            path: {
              id: 'tyopaikkaId',
            },
          },
          body: {
            nimi: {
              fi: 'Lorem ipsum toimenkuva',
            },
            alkuPvm: '2020-01-01',
            loppuPvm: '2021-01-01',
            osaamiset: ['http://data.europa.eu/esco/skill/test'],
          },
        });
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles form validation', async () => {
    userEvent.setup();
    await act(async () => {
      doRender(true, onClose, '123');
    });

    const nextBtn = screen.getByRole('button', { name: 'next' });
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();

    const toimenkuvaInput = screen.getByRole('textbox', { name: 'work-history.job-description' });
    const alkuPvmInput = screen.getByRole('textbox', { name: 'started' });
    const loppuPvmInput = screen.getByRole('textbox', { name: 'ended' });

    const inputs = [toimenkuvaInput, alkuPvmInput, loppuPvmInput];

    for (const input of inputs) {
      expect(input).toBeInTheDocument();
      await userEvent.type(input, ' ');
      await userEvent.tab();
    }

    await waitFor(() => {
      expect(nextBtn).toBeDisabled();
      // Toimenkuva and alkuPvm should show required error
      expect(screen.getAllByText('error.form.required')).toHaveLength(2);
    });
  });
});
