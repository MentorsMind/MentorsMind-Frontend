# Form Components Library

A comprehensive, accessible form components library with built-in validation, error handling, and keyboard navigation support.

## Components

### FormField
Wrapper component that provides label, error display, and accessibility features.

```tsx
<FormField 
  label="Email" 
  name="email" 
  required 
  error={error}
  hint="We'll never share your email"
>
  <TextInput />
</FormField>
```

### TextInput
Text input with validation states and icon support.

```tsx
<TextInput
  type="email"
  placeholder="Enter email"
  hasError={!!error}
  leftIcon={<MailIcon />}
/>
```

### Select
Dropdown with search functionality and keyboard navigation.

```tsx
<Select
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
  searchable
  onChange={(value) => console.log(value)}
/>
```

### Checkbox
Checkbox with indeterminate state support.

```tsx
<Checkbox
  label="Accept terms"
  checked={accepted}
  onChange={setAccepted}
/>
```

### RadioButton & RadioGroup
Radio buttons with group management.

```tsx
<RadioGroup
  name="plan"
  value={selectedPlan}
  onChange={setSelectedPlan}
  options={[
    { value: 'basic', label: 'Basic' },
    { value: 'pro', label: 'Pro' }
  ]}
  orientation="horizontal"
/>
```

### DatePicker
Date picker with timezone support.

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date()}
  timezone="America/New_York"
/>
```

### FileUpload
Drag-and-drop file upload with validation.

```tsx
<FileUpload
  multiple
  config={{
    maxSize: 5 * 1024 * 1024,
    maxFiles: 5,
    acceptedTypes: ['image/*', 'application/pdf']
  }}
  onChange={(files) => console.log(files)}
/>
```

### FormWizard
Multi-step form wizard with progress tracking.

```tsx
<FormWizard
  steps={[
    {
      id: 'step1',
      title: 'Personal Info',
      component: PersonalInfoStep,
      validate: async () => true
    },
    {
      id: 'step2',
      title: 'Address',
      component: AddressStep
    }
  ]}
  onComplete={(data) => console.log(data)}
/>
```

## useForm Hook

Custom hook for form state management and validation.

```tsx
const { register, handleSubmit, formState, submissionState } = useForm({
  mode: 'onBlur'
});

const emailField = register('email', {
  required: 'Email is required',
  pattern: emailPattern
});

<form onSubmit={handleSubmit(async (data) => {
  await submitForm(data);
})}>
  <FormField 
    label="Email" 
    name="email"
    error={formState.email?.error}
  >
    <TextInput {...emailField} />
  </FormField>
  
  <button 
    type="submit" 
    disabled={submissionState === 'loading'}
  >
    {submissionState === 'loading' ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

## Validation

Built-in validation rules:

- `required`: Field is required
- `minLength`: Minimum string length
- `maxLength`: Maximum string length
- `pattern`: Regex pattern matching
- `min`: Minimum numeric value
- `max`: Maximum numeric value
- `validate`: Custom validation function

Pre-defined patterns:
- `emailPattern`: Email validation
- `phonePattern`: Phone number validation
- `urlPattern`: URL validation

## Accessibility Features

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader announcements
- Focus management
- Error announcements with `role="alert"`
- Proper form semantics

## Submission States

The form supports four submission states:
- `idle`: Initial state
- `loading`: Form is being submitted
- `success`: Submission successful
- `error`: Submission failed

## Testing

All components include comprehensive tests for:
- User interactions
- Validation logic
- Accessibility compliance
- Keyboard navigation
