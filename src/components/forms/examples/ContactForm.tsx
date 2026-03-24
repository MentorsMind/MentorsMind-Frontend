import React from 'react';
import { useForm } from '../../../hooks/useForm';
import { FormField } from '../FormField';
import { TextInput } from '../TextInput';
import { Select } from '../Select';
import { emailPattern } from '../../../utils/validation.utils';

export const ContactForm: React.FC = () => {
  const { register, handleSubmit, formState, submissionState } = useForm({
    mode: 'onBlur'
  });

  const nameField = register('name', {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' }
  });

  const emailField = register('email', {
    required: 'Email is required',
    pattern: emailPattern
  });

  const subjectField = register('subject', {
    required: 'Please select a subject'
  });

  const messageField = register('message', {
    required: 'Message is required',
    minLength: { value: 10, message: 'Message must be at least 10 characters' }
  });

  const onSubmit = async (data: any) => {
    console.log('Form submitted:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Contact Us</h2>

      <FormField
        label="Name"
        name="name"
        required
        error={formState.name?.error}
      >
        <TextInput {...nameField} placeholder="Your name" />
      </FormField>

      <FormField
        label="Email"
        name="email"
        required
        error={formState.email?.error}
      >
        <TextInput {...emailField} type="email" placeholder="your@email.com" />
      </FormField>

      <FormField
        label="Subject"
        name="subject"
        required
        error={formState.subject?.error}
      >
        <Select
          {...subjectField}
          options={[
            { value: 'general', label: 'General Inquiry' },
            { value: 'support', label: 'Technical Support' },
            { value: 'billing', label: 'Billing Question' }
          ]}
          placeholder="Select a subject"
        />
      </FormField>

      <FormField
        label="Message"
        name="message"
        required
        error={formState.message?.error}
      >
        <textarea
          {...messageField}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Your message..."
        />
      </FormField>

      <button
        type="submit"
        disabled={submissionState === 'loading'}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {submissionState === 'loading' ? 'Sending...' : 'Send Message'}
      </button>

      {submissionState === 'success' && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          Message sent successfully!
        </div>
      )}
    </form>
  );
};
