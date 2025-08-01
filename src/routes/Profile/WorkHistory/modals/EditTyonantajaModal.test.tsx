/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from '@/api/client';
import { ModalProvider } from '@/hooks/useModal';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EditTyonantajaModal from './EditTyonantajaModal';

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
    GET: vi.fn(),
    PUT: vi.fn(),
    DELETE: vi.fn(),
  },
}));

const doRender = (isOpen = true, tyopaikkaId: string) => {
  return render(
    <ModalProvider>
      <EditTyonantajaModal isOpen={isOpen} tyopaikkaId={tyopaikkaId} />
    </ModalProvider>,
  );
};

describe('EditTyonantajaModal', () => {
  const tyopaikkaId = '123';
  const mockTyopaikka = {
    id: tyopaikkaId,
    nimi: { fi: 'Test Oy' },
  };

  const mockGet = vi.mocked(client.GET);
  const mockPut = vi.mocked(client.PUT);
  const mockDelete = vi.mocked(client.DELETE);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with fetched data', async () => {
    mockGet.mockResolvedValueOnce({ data: mockTyopaikka } as any);
    await act(async () => {
      doRender(true, tyopaikkaId);
    });
    await waitFor(() => {
      expect(screen.getByText('work-history.edit-workplace')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'work-history.employer' })).toHaveValue('Test Oy');
    });
  });

  it('shows validation error when input is empty', async () => {
    userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: mockTyopaikka } as any);
    await act(async () => {
      doRender(true, tyopaikkaId);
    });

    const input = await screen.findByRole('textbox', { name: 'work-history.employer' });
    await userEvent.clear(input);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText('error.form.required')).toBeInTheDocument();
    });
  });

  it('calls PUT and closes modal on save', async () => {
    userEvent.setup();
    mockPut.mockClear();
    mockGet.mockResolvedValueOnce({ data: mockTyopaikka } as any);
    mockPut.mockResolvedValueOnce({ data: {} });

    await act(async () => {
      doRender(true, tyopaikkaId);
    });

    const input = await screen.findByRole('textbox', { name: 'work-history.employer' });
    const saveButton = screen.getByRole('button', { name: 'save' });
    await userEvent.clear(input);
    await userEvent.type(input, 'New Oy');
    await userEvent.tab();

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/api/profiili/tyopaikat/{id}', {
        params: { path: { id: tyopaikkaId } },
        body: { id: tyopaikkaId, nimi: { fi: 'New Oy' } },
      });
    });
  });

  it('shows delete dialog and calls DELETE on confirm', async () => {
    userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: mockTyopaikka } as any);
    mockDelete.mockResolvedValueOnce({ data: {} });

    await act(async () => {
      doRender(true, tyopaikkaId);
    });
    await userEvent.click(screen.getByRole('button', { name: 'work-history.delete-work-history' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'work-history.delete-work-history' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'work-history.delete-work-history' }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/api/profiili/tyopaikat/{id}', {
        params: { path: { id: tyopaikkaId } },
      });
    });
  });

  it('returns null while loading', async () => {
    mockGet.mockResolvedValueOnce({ data: undefined } as any);
    await act(async () => {
      const { container } = doRender(true, tyopaikkaId);
      expect(container.firstChild).toBeNull();
    });
  });
});
