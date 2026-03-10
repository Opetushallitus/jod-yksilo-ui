import { useModal } from '@/hooks/useModal';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModalProvider } from './ModalProvider';

const TestModal = vi.fn(({ open, onClose, label, animationMode }) => {
  if (!open) return null;
  return (
    <div data-testid="test-modal" data-animation-mode={animationMode}>
      <span>{label}</span>
      <button onClick={onClose}>Close</button>
    </div>
  );
});

describe('ModalProvider', () => {
  it('renders nothing when no modal is open', () => {
    render(
      <ModalProvider>
        <div>Child</div>
      </ModalProvider>,
    );
    expect(screen.queryByTestId('test-modal')).toBeNull();
  });

  it('renders modalToRender when showModal is called', () => {
    const Consumer = () => {
      const { showModal } = useModal();
      return <button onClick={() => showModal(TestModal, { label: 'Hello' })}>Open Modal</button>;
    };
    render(
      <ModalProvider>
        <Consumer />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Open Modal'));
    expect(screen.getByTestId('test-modal')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByTestId('test-modal')).toHaveAttribute('data-animation-mode', 'single');
  });

  it('passes open=true and onClose to modal', () => {
    const Consumer = () => {
      const { showModal } = useModal();
      return <button onClick={() => showModal(TestModal, { label: 'Test' })}>Open Modal</button>;
    };
    render(
      <ModalProvider>
        <Consumer />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Open Modal'));
    expect(TestModal).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        label: 'Test',
        onClose: expect.any(Function),
        animationMode: 'single',
      }),
      undefined,
    );
  });

  it('removes modal when onClose is called', () => {
    const Consumer = () => {
      const { showModal } = useModal();
      return <button onClick={() => showModal(TestModal, { label: 'Bye' })}>Open Modal</button>;
    };
    render(
      <ModalProvider>
        <Consumer />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Open Modal'));
    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('test-modal')).toBeNull();
  });

  it('renders stacked modals correctly', () => {
    const Consumer = () => {
      const { showModal } = useModal();
      return (
        <>
          <button onClick={() => showModal(TestModal, { label: 'First' })}>Open First</button>
          <button onClick={() => showModal(TestModal, { label: 'Second' })}>Open Second</button>
        </>
      );
    };
    render(
      <ModalProvider>
        <Consumer />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Open First'));
    const firstModal = screen.getByTestId('test-modal');
    expect(firstModal).toHaveAttribute('data-animation-mode', 'single');

    fireEvent.click(screen.getByText('Open Second'));
    const modals = screen.getAllByTestId('test-modal');
    expect(modals).toHaveLength(2);
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.queryByText('First')).toBeInTheDocument();
    // First modal should be in background, second should be foreground
    expect(modals[0]).toHaveAttribute('data-animation-mode', 'stacked-background');
    expect(modals[1]).toHaveAttribute('data-animation-mode', 'stacked-foreground');

    // Close top modal (get all close buttons and click the last one)
    const closeButtons = screen.getAllByText('Close');
    fireEvent.click(closeButtons[1]);
    const remainingModal = screen.getByTestId('test-modal');
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(remainingModal).toHaveAttribute('data-animation-mode', 'single');
  });
});
