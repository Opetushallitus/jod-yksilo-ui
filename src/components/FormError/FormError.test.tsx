import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FieldErrors } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { FormError } from './FormError';

describe('FormError component', () => {
  it('renders error message when there is an error', () => {
    const errors: FieldErrors = {
      testField: {
        message: 'This is an error message',
        type: 'required',
      },
    };

    const { getByText } = render(<FormError name="testField" errors={errors} />);
    expect(getByText('This is an error message')).toBeInTheDocument();
  });

  it('does not render anything when there are no errors', () => {
    const errors: FieldErrors = {};

    const { container } = render(<FormError name="testField" errors={errors} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render anything when name is not provided', () => {
    const errors: FieldErrors = {
      testField: {
        message: 'This is an error message',
        type: 'required',
      },
    };

    const { container } = render(<FormError name="" errors={errors} />);
    expect(container).toBeEmptyDOMElement();
  });
});
