import { expect, test } from 'vitest';
import { render, waitFor } from '@testing-library/react';

import { Title } from './Title';
import { HelmetProvider } from 'react-helmet-async';

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
    expect(document.title).toEqual('Given Title - JOD');
  });
});
