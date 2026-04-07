import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useArrowKeyControls } from './index';

const TestButtonList = ({ initialItems }: { initialItems: string[] }) => {
  const [items, setItems] = React.useState(initialItems);
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const { ref, handleKeyDown, setLastClickedIndex } = useArrowKeyControls(items);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <ul ref={ref} onKeyDown={handleKeyDown} data-testid="list">
      {items.map((item, i) => (
        <li key={item}>
          <button
            data-testid={`item-${item}`}
            onClick={() => {
              removeItem(i);
              setLastClickedIndex(i);
            }}
          >
            {item}
          </button>
        </li>
      ))}
    </ul>
  );
};

const TestDivList = ({ initialItems }: { initialItems: string[] }) => {
  const [items] = React.useState(initialItems);
  const { ref, handleKeyDown } = useArrowKeyControls(items);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <ul ref={ref} onKeyDown={handleKeyDown} data-testid="list">
      {items.map((item) => (
        <li key={item}>
          <div data-testid={`item-${item}`}>{item}</div>
        </li>
      ))}
    </ul>
  );
};

describe('useArrowKeyControls', () => {
  let items: string[];

  beforeEach(() => {
    items = ['A', 'B', 'C', 'D'];
  });

  it('initializes roving tabindex on mount', () => {
    render(<TestButtonList initialItems={items} />);
    const btn0 = screen.getByTestId('item-A');
    const btn1 = screen.getByTestId('item-B');
    expect(btn0).toHaveAttribute('tabindex', '0');
    expect(btn1).toHaveAttribute('tabindex', '-1');
  });

  it('arrow key navigation works and wraps with button list', () => {
    render(<TestButtonList initialItems={items} />);
    const list = screen.getByTestId('list');
    const btn0 = screen.getByTestId('item-A');
    const btn1 = screen.getByTestId('item-B');
    const btn2 = screen.getByTestId('item-C');
    const btn3 = screen.getByTestId('item-D');
    btn0.focus();

    // ArrowRight to index 1
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(btn1).toHaveAttribute('tabindex', '0');

    // ArrowRight to index 2
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(btn1).toHaveAttribute('tabindex', '-1');
    expect(btn2).toHaveAttribute('tabindex', '0');

    // ArrowRight to index 3
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(btn1).toHaveAttribute('tabindex', '-1');
    expect(btn2).toHaveAttribute('tabindex', '-1');
    expect(btn3).toHaveAttribute('tabindex', '0');

    // ArrowRight wraps to index 0
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(btn0).toHaveAttribute('tabindex', '0');
    expect(btn1).toHaveAttribute('tabindex', '-1');
    expect(btn2).toHaveAttribute('tabindex', '-1');
    expect(btn3).toHaveAttribute('tabindex', '-1');
    // ArrowLeft wraps to last
    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(btn3).toHaveAttribute('tabindex', '0');
  });

  it('arrow key navigation works and wraps with div list', () => {
    render(<TestDivList initialItems={items} />);
    const list = screen.getByTestId('list');
    const btn0 = screen.getByTestId('item-A');
    const btn1 = screen.getByTestId('item-B');
    const btn2 = screen.getByTestId('item-C');
    const btn3 = screen.getByTestId('item-D');
    btn0.focus();

    // ArrowRight to index 1
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(btn1).toHaveAttribute('tabindex', '0');

    // ArrowRight to index 2
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(btn1).toHaveAttribute('tabindex', '-1');
    expect(btn2).toHaveAttribute('tabindex', '0');

    // ArrowRight to index 3
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(btn1).toHaveAttribute('tabindex', '-1');
    expect(btn2).toHaveAttribute('tabindex', '-1');
    expect(btn3).toHaveAttribute('tabindex', '0');

    // ArrowRight wraps to index 0
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(btn0).toHaveAttribute('tabindex', '0');
    expect(btn1).toHaveAttribute('tabindex', '-1');
    expect(btn2).toHaveAttribute('tabindex', '-1');
    expect(btn3).toHaveAttribute('tabindex', '-1');
    // ArrowLeft wraps to last
    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(btn3).toHaveAttribute('tabindex', '0');
  });

  it('removing item focuses previous index', async () => {
    render(<TestButtonList initialItems={items} />);
    const btn1 = screen.getByTestId('item-B');
    btn1.focus();
    // ArrowRight to index 2
    fireEvent.keyDown(screen.getByTestId('list'), { key: 'ArrowRight' });
    const btn2 = screen.getByTestId('item-C');
    expect(btn1).toHaveAttribute('tabindex', '-1');
    expect(btn2).toHaveAttribute('tabindex', '0');
    // Remove index 2
    fireEvent.click(btn2);

    await waitFor(() => {
      // Now index 1 should be active
      expect(screen.getByTestId('item-B')).toHaveAttribute('tabindex', '0');
    });
  });

  it('removing first item focuses new index 0', async () => {
    render(<TestButtonList initialItems={items} />);
    const btn0 = screen.getByTestId('item-A');
    btn0.focus();
    fireEvent.click(btn0);
    // New first item should be focused
    await waitFor(() => {
      expect(screen.getByTestId('item-B')).toHaveAttribute('tabindex', '0');
    });
  });

  it('removing last item focuses new last', () => {
    render(<TestButtonList initialItems={items} />);
    // Move to last item
    const list = screen.getByTestId('list');
    const btn0 = screen.getByTestId('item-A');
    btn0.focus();

    for (let i = 0; i < 3; i++) {
      fireEvent.keyDown(list, { key: 'ArrowRight' });
    }
    const btn3 = screen.getByTestId('item-D');
    expect(btn3).toHaveAttribute('tabindex', '0');
    fireEvent.click(btn3);

    // New last item should be focused
    expect(screen.getByTestId('item-C')).toHaveAttribute('tabindex', '0');
  });
});
