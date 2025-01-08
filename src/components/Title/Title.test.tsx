import { render, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';

import { Title } from './Title';

test('document should have given title', async () => {
  render(<Title value="Given Title" />);
  await waitFor(() => {
    expect(document.title).toEqual('Given Title');
  });
});
