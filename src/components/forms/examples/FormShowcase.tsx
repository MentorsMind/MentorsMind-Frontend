import React, { useState } from 'react';
import { useForm } from '../../../hooks/useForm';
import { FormField } from '../FormField';
import { TextInput } from '../TextInput';
import { TextArea } from '../TextArea';
import { Select } from '../Select';
import { Checkbox } from '../Checkbox';
import { RadioGroup } from '../RadioButton';
import { DatePicker } from '../DatePicker';
import { FileUpload } from '../FileUpload';
import { emailPattern, phonePattern } from '../../../utils/validation.utils';

export const FormShowcase: React.FC = () => {
  const { register, handleSubmit, formState, submissionState } = useForm({
    mode: 'onBlur'
  });

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [files, setFiles] = useState<File[]>([]);
  const [newsletter, setNewsletter] = useState(false);
  const [plan, setPlan] = useState<string | number>('');

  const onSubmit = async (data: any) => {
    console.log('Form data:', {
      ...data,
      date: selectedDate,
      files,
      newsletter,
      plan
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Form Components Showcase</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Text Inputs */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Text Inputs</h2>
          
          <FormField
            label="Full Name"
            name="name"
            required
            hint="Enter your first and last name"
            error={formState.name?.error}
          >
            <TextInput
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              placeholder="John Doe"
              hasError={!!formState.name?.error}
            />
          </FormField>

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
              placeholder="john@example.com"
              hasError={!!formState.email?.error}
            />
          </FormField>

          <FormField
            label="Phone"
            name="phone"
            error={formState.phone?.error}
          >
            <TextInput
              {...register('phone', { pattern: phonePattern })}
              type="tel"
              placeholder="+1 (555) 123-4567"
              hasError={!!formState.phone?.error}
            />
          </FormField>
        </section>

        {/* Select */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Select Dropdown</h2>
          
          <FormField
            label="Country"
            name="country"
            required
            error={formState.country?.error}
          >
            <Select
              name="country"
              value={formState.country?.value}
              onChange={(value) => {
                const event = { target: { value, name: 'country' } } as any;
                register('country', { required: 'Please select a country' }).onChange(event);
              }}
              options={[
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'au', label: 'Australia' }
              ]}
              searchable
              placeholder="Select your country"
              hasError={!!formState.country?.error}
            />
          </FormField>
        </section>

        {/* Radio Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Radio Buttons</h2>
          
          <FormField label="Subscription Plan" name="plan">
            <RadioGroup
              name="plan"
              value={plan}
              onChange={setPlan}
              options={[
                { value: 'free', label: 'Free - $0/month' },
                { value: 'pro', label: 'Pro - $9/month' },
                { value: 'enterprise', label: 'Enterprise - $29/month' }
              ]}
            />
          </FormField>
        </section>

        {/* Checkboxes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Checkboxes</h2>
          
          <Checkbox
            label="Subscribe to newsletter"
            checked={newsletter}
            onChange={setNewsletter}
          />
          
          <Checkbox
            label="I agree to the terms and conditions"
            name="terms"
            checked={formState.terms?.value || false}
            onChange={(checked) => {
              const event = { target: { checked, name: 'terms', type: 'checkbox' } } as any;
              register('terms', { required: 'You must accept the terms' }).onChange(event);
            }}
          />
          {formState.terms?.error && (
            <p className="text-sm text-red-600">{formState.terms.error.message}</p>
          )}
        </section>

        {/* Date Picker */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Date Picker</h2>
          
          <FormField label="Birth Date" name="birthDate">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              maxDate={new Date()}
              placeholder="Select your birth date"
            />
          </FormField>
        </section>

        {/* Text Area */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Text Area</h2>
          
          <FormField
            label="Bio"
            name="bio"
            hint="Tell us about yourself"
            error={formState.bio?.error}
          >
            <TextArea
              {...register('bio', {
                maxLength: { value: 500, message: 'Bio must be less than 500 characters' }
              })}
              placeholder="Write a short bio..."
              rows={5}
              maxLength={500}
              showCharCount
              hasError={!!formState.bio?.error}
            />
          </FormField>
        </section>

        {/* File Upload */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">File Upload</h2>
          
          <FormField label="Profile Picture" name="avatar">
            <FileUpload
              onChange={setFiles}
              config={{
                maxSize: 5 * 1024 * 1024,
                maxFiles: 1,
                acceptedTypes: ['image/*']
              }}
            />
          </FormField>
        </section>

        {/* Submit Button */}
        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={submissionState === 'loading'}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {submissionState === 'loading' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </button>
        </div>

        {/* Success Message */}
        {submissionState === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Form submitted successfully!
            </div>
          </div>
        )}

        {/* Error Message */}
        {submissionState === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              An error occurred. Please try again.
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
