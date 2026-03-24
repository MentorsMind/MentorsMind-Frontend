# Forms Library Integration Guide

## Quick Start

### 1. Import Components

```tsx
import { 
  FormField, 
  TextInput, 
  Select, 
  Checkbox,
  RadioGroup,
  DatePicker,
  FileUpload,
  FormWizard 
} from './components/forms';
import { useForm } from './hooks/useForm';
import { emailPattern } from './utils/validation.utils';
```

### 2. Basic Form Example

```tsx
const MyForm = () => {
  const { register, handleSubmit, formState, submissionState } = useForm({
    mode: 'onBlur' // Validate on blur
  });

  const onSubmit = async (data) => {
    console.log('Form data:', data);
    // Submit to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField 
        label="Email" 
        name="email" 
        required
        error={formState.email?.error}
      >
        <TextInput
          {...register('email', {
            required: 'Email is required',
            pattern: emailPattern
          })}
          type="email"
          hasError={!!formState.email?.error}
        />
      </FormField>

      <button type="submit" disabled={submissionState === 'loading'}>
        Submit
      </button>
    </form>
  );
};
```

## Component Integration Patterns

### TextInput with Validation

```tsx
const emailField = register('email', {
  required: 'Email is required',
  pattern: emailPattern
});

<FormField label="Email" name="email" error={formState.email?.error}>
  <TextInput 
    {...emailField}
    type="email"
    placeholder="your@email.com"
    hasError={!!formState.email?.error}
  />
</FormField>
```

### Select Dropdown

```tsx
// For Select, you need to handle onChange manually
<FormField label="Country" name="country" error={formState.country?.error}>
  <Select
    name="country"
    value={formState.country?.value}
    onChange={(value) => {
      const event = { target: { value, name: 'country' } } as any;
      register('country', { required: 'Required' }).onChange(event);
    }}
    options={[
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' }
    ]}
    searchable
  />
</FormField>
```

### Checkbox

```tsx
const [accepted, setAccepted] = useState(false);

<Checkbox
  label="I accept the terms"
  checked={accepted}
  onChange={setAccepted}
/>
```

### Radio Group

```tsx
const [plan, setPlan] = useState('');

<RadioGroup
  name="plan"
  value={plan}
  onChange={setPlan}
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' }
  ]}
/>
```

### DatePicker

```tsx
const [date, setDate] = useState<Date>();

<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date()}
  placeholder="Select date"
/>
```

### FileUpload

```tsx
const [files, setFiles] = useState<File[]>([]);

<FileUpload
  multiple
  onChange={setFiles}
  config={{
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 3,
    acceptedTypes: ['image/*', 'application/pdf']
  }}
/>
```

### TextArea

```tsx
const bioField = register('bio', {
  maxLength: { value: 500, message: 'Max 500 characters' }
});

<FormField label="Bio" name="bio" error={formState.bio?.error}>
  <TextArea
    {...bioField}
    rows={5}
    maxLength={500}
    showCharCount
    hasError={!!formState.bio?.error}
  />
</FormField>
```

## Form Wizard

```tsx
const steps = [
  {
    id: 'step1',
    title: 'Personal Info',
    component: PersonalInfoStep,
    validate: async () => {
      // Return true if valid, false otherwise
      return true;
    }
  },
  {
    id: 'step2',
    title: 'Preferences',
    component: PreferencesStep
  }
];

<FormWizard
  steps={steps}
  onComplete={(data) => console.log('Complete:', data)}
  onCancel={() => console.log('Cancelled')}
/>
```

## Validation Modes

### onChange Mode
Validates as user types:
```tsx
const { register } = useForm({ mode: 'onChange' });
```

### onBlur Mode (Recommended)
Validates when field loses focus:
```tsx
const { register } = useForm({ mode: 'onBlur' });
```

### onSubmit Mode
Validates only on form submission:
```tsx
const { register } = useForm({ mode: 'onSubmit' });
```

## Custom Validation

```tsx
register('password', {
  required: 'Password is required',
  minLength: { value: 8, message: 'Min 8 characters' },
  validate: (value) => {
    if (!/[A-Z]/.test(value)) {
      return 'Must contain uppercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Must contain number';
    }
    return true;
  }
});
```

## Submission States

```tsx
const { submissionState } = useForm();

// submissionState can be: 'idle' | 'loading' | 'success' | 'error'

<button disabled={submissionState === 'loading'}>
  {submissionState === 'loading' ? 'Submitting...' : 'Submit'}
</button>

{submissionState === 'success' && (
  <div className="success-message">Form submitted!</div>
)}

{submissionState === 'error' && (
  <div className="error-message">Submission failed</div>
)}
```

## Manual Form Control

```tsx
const { setValue, setError, clearErrors, reset } = useForm();

// Set field value programmatically
setValue('email', 'test@example.com');

// Set custom error
setError('email', { 
  type: 'custom', 
  message: 'Email already exists' 
});

// Clear errors
clearErrors('email'); // Clear specific field
clearErrors(); // Clear all errors

// Reset entire form
reset();
```

## Styling

All components use Tailwind CSS classes. Customize by:

1. Passing `className` prop
2. Modifying component files directly
3. Using CSS modules or styled-components

```tsx
<TextInput 
  className="custom-input-class"
  hasError={!!error}
/>
```

## Accessibility

All components include:
- ARIA labels and descriptions
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements

No additional configuration needed!

## TypeScript Support

All components are fully typed. Import types:

```tsx
import type { 
  ValidationRule, 
  FieldError, 
  FormState,
  SelectOption,
  WizardStep 
} from './types/forms.types';
```

## Testing

Import test utilities:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('form submission', async () => {
  const user = userEvent.setup();
  render(<MyForm />);
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## Common Patterns

### Dependent Fields

```tsx
const password = formState.password?.value;

register('confirmPassword', {
  validate: (value) => 
    value === password || 'Passwords must match'
});
```

### Conditional Validation

```tsx
const isBusinessAccount = formState.accountType?.value === 'business';

register('companyName', {
  required: isBusinessAccount ? 'Company name required' : false
});
```

### Dynamic Options

```tsx
const [countries, setCountries] = useState([]);

useEffect(() => {
  fetchCountries().then(setCountries);
}, []);

<Select options={countries} />
```

## Performance Tips

1. Use `mode: 'onBlur'` for better performance
2. Memoize validation functions
3. Debounce async validation
4. Use React.memo for step components in FormWizard

## Troubleshooting

### Form not validating
- Check validation mode is set
- Ensure field is registered
- Verify validation rules are correct

### Select/Checkbox not working with register
- These components need manual onChange handling
- See integration patterns above

### Submission state stuck on loading
- Ensure async function completes
- Handle errors in onSubmit
- Check for unhandled promise rejections

## Examples

See complete examples in:
- `src/components/forms/examples/ContactForm.tsx`
- `src/components/forms/examples/FormShowcase.tsx`
- `src/components/forms/examples/RegistrationWizard.tsx`
