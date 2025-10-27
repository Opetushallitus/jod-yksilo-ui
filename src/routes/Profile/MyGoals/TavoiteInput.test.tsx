/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from '@/api/client';
import { components } from '@/api/schema';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import TavoiteInput from './TavoiteInput';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));
vi.mock('@/stores/useTavoitteetStore', () => ({
  useTavoitteetStore: vi.fn(),
}));
vi.mock('@/api/client', () => ({
  client: { PUT: vi.fn() },
}));

const mockUpsertTavoite = vi.fn();
const mockT = vi.fn().mockImplementation((key: string) => key);
const mockLanguage = 'fi';

function doRender(goal = { id: 1, tavoite: { fi: 'alkuarvo', sv: 'startvärde' } }) {
  const store = useTavoitteetStore as unknown as Mock;
  (useTranslation as unknown as Mock).mockReturnValue({
    t: mockT,
    i18n: { language: mockLanguage },
  });
  store.mockReturnValue(mockUpsertTavoite);

  return render(<TavoiteInput goal={goal as components['schemas']['TavoiteDto']} />);
}

describe('TavoiteInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (client.PUT as Mock).mockResolvedValue({});
  });

  it('renders textarea with initial value', async () => {
    const { getByLabelText } = doRender();
    await waitFor(() => {
      expect(getByLabelText('profile.my-goals.goal-description')).toHaveValue('alkuarvo');
    });
  });

  it('calls save on debounced input change', async () => {
    vi.useFakeTimers();
    const { getByLabelText } = doRender();
    const textarea = getByLabelText('profile.my-goals.goal-description');
    act(() => {
      fireEvent.change(textarea, { target: { value: 'uusi arvo' } });
      fireEvent.blur(textarea);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    vi.useRealTimers();

    await waitFor(() => {
      expect(client.PUT).toHaveBeenCalledWith(
        '/api/profiili/tavoitteet/{id}',
        expect.objectContaining({
          body: expect.objectContaining({
            tavoite: expect.objectContaining({ fi: 'uusi arvo' }),
          }),
          params: { path: { id: 1 } },
        }),
      );
      expect(mockUpsertTavoite).toHaveBeenCalled();
    });
  });

  it('does not save if language changes before debounce', async () => {
    vi.useFakeTimers();
    let language = 'fi';
    (useTranslation as unknown as Mock).mockReturnValue({
      t: mockT,
      i18n: {
        get language() {
          return language;
        },
      },
    });
    (useTavoitteetStore as unknown as Mock).mockReturnValue(mockUpsertTavoite);

    const { getByLabelText, rerender } = render(
      <TavoiteInput goal={{ id: 1, tavoite: { fi: 'alkuarvo', sv: '' } } as any} />,
    );
    const textarea = getByLabelText('profile.my-goals.goal-description');
    act(() => {
      fireEvent.change(textarea, { target: { value: 'muutos' } });
    });

    // Change language before debounce fires
    language = 'sv';
    rerender(<TavoiteInput goal={{ id: 1, tavoite: { fi: 'alkuarvo', sv: '' } } as any} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    vi.useRealTimers();

    expect(client.PUT).not.toHaveBeenCalled();
  });

  it('updates textarea value on language change', async () => {
    let language = 'fi';
    (useTranslation as unknown as Mock).mockReturnValue({
      t: mockT,
      i18n: {
        get language() {
          return language;
        },
      },
    });

    const tavoite = { id: 1, tavoite: { fi: 'suomi', sv: 'ruotsi' } };
    const { getByLabelText, rerender } = render(<TavoiteInput goal={tavoite as any} />);
    expect(getByLabelText('profile.my-goals.goal-description')).toHaveValue('suomi');
    language = 'sv';
    rerender(<TavoiteInput goal={tavoite as any} />);
    await waitFor(() => {
      expect(getByLabelText('profile.my-goals.goal-description')).toHaveValue('ruotsi');
    });
  });

  it('shows save-in-progress and saved texts', async () => {
    vi.useFakeTimers();
    const { getByLabelText, getByText } = doRender();
    (client.PUT as Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        // eslint-disable-next-line sonarjs/no-nested-functions
        setTimeout(() => {
          resolve({});
        }, 500);
      });
    });
    const textarea = getByLabelText('profile.my-goals.goal-description');
    act(() => {
      fireEvent.change(textarea, { target: { value: 'tallennetaan' } });
      fireEvent.blur(textarea);
    });

    // Advance debounce timer
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // "save-in-progress" should be visible after debounce, before API resolves
    expect(getByText('save-in-progress')).toBeInTheDocument();

    // Advance API call timer
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Flush any remaining timers (just in case)
    vi.runOnlyPendingTimers();

    // Now switch to real timers
    vi.useRealTimers();

    // Now "saved" should appear
    await waitFor(() => {
      expect(getByText('saved')).toBeInTheDocument();
    });
  });
});
