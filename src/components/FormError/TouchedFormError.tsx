import { FormError } from '@/components/FormError/FormError';
import { getNestedProperty } from '@/utils';
import { FieldErrors, FieldValues } from 'react-hook-form';

interface TouchedErrorProps {
  /** Field path, supports dot notation for nested fields */
  fieldName: string;
  /** Errors property from React Hook Form formState */
  errors: FieldErrors;
  /** TouchedFields property from React Hook Form formState */
  touchedFields: FieldValues;
}

/**
 * A component that displays a form error only if the field has been touched.
 * Useful especially for the Datepicker fields where the error normally appears before any user interaction.
 */
export const TouchedFormError = ({ touchedFields, fieldName, errors }: TouchedErrorProps) =>
  getNestedProperty(touchedFields, fieldName) ? <FormError name={fieldName} errors={errors} /> : null;
