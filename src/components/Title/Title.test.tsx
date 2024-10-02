import { render, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';

import { HelmetProvider } from 'react-helmet-async';
import { Title } from './Title';

const Wrapper = ({ children }: React.PropsWithChildren) => {
  return <HelmetProvider>{children}</HelmetProvider>;
};

test('document should have given title', async () => {
  render(
    <Wrapper>
      <Title value="Given Title" />
    </Wrapper>,
  );
  await waitFor(() => {
    expect(document.title).toEqual('Given Title');
  });
});
