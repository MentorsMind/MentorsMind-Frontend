export type ValidationRule = {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  validate?: (value: any) => boolean | string;
};

export type FieldError = {
  type: string;
  message: string;
};

export type FormFieldState = {
  value: any;
  error?: FieldError;
  touched: boolean;
  dirty: boolean;
};

export type FormState = {
  [key: string]: FormFieldState;
};

export type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

export type FormConfig = {
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  reValidateMode?: 'onChange' | 'onBlur';
};

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

export type FileUploadConfig = {
  maxSize?: number;
  maxFiles?: number;
  acceptedTypes?: string[];
};

export type WizardStep = {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  validate?: () => Promise<boolean>;
};
