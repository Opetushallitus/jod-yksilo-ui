import { useModal } from '@/hooks/useModal';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModalProvider } from './ModalProvider';

const TestModal = vi.fn(({ isOpen, onClose, label }) => {
  if (!isOpen) return null;
  return (
    <div data-testid="test-modal">
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
  });

  it('passes isOpen=true and onClose to modal', () => {
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
        isOpen: true,
        label: 'Test',
        onClose: expect.any(Function),
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

  it('renders only the top modal when multiple are stacked', () => {
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
    fireEvent.click(screen.getByText('Open Second'));
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.queryByText('First')).toBeNull();
    // Close top modal
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByText('First')).toBeInTheDocument();
  });
});
