import { ErrorMessage } from '@hookform/error-message';
import { FieldErrors } from 'react-hook-form';

import { getNestedProperty } from '@/utils';

interface FormErrorProps {
  /** Field path, supports dot notation for nested fields */
  name: string;
  /** Errors property from React Hook Form formState */
  errors: FieldErrors;
}

/**
 * A wrapper for React Hook Forms "ErrorMessage" component.
 */
export const FormError = ({ name, errors }: FormErrorProps) =>
  name && getNestedProperty(errors, name) ? (
    <ErrorMessage
      name={name}
      errors={errors}
      render={({ message }) => (
        <span
          className="font-arial text-form-error text-alert-1"
          data-testid={`form-error-${name.replace(/\./g, '-')}`}
        >
          {message}
        </span>
      )}
    />
  ) : null;
