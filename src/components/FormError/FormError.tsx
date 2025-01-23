import { getNestedProperty } from '@/utils';
import { ErrorMessage } from '@hookform/error-message';
import { FieldErrors } from 'react-hook-form';

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
    <ErrorMessage name={name} errors={errors} render={({ message }) => <span className="text-alert">{message}</span>} />
  ) : null;
