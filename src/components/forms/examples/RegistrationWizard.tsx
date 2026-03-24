import React from 'react';
import { FormWizard } from '../FormWizard';
import { FormField } from '../FormField';
import { TextInput } from '../TextInput';
import { RadioGroup } from '../RadioButton';
import { Checkbox } from '../Checkbox';

const PersonalInfoStep: React.FC<any> = ({ data, updateData }) => {
  return (
    <div className="space-y-4">
      <FormField label="First Name" name="firstName" required>
        <TextInput
          value={data.firstName || ''}
          onChange={(e) => updateData({ firstName: e.target.value })}
        />
      </FormField>
      <FormField label="Last Name" name="lastName" required>
        <TextInput
          value={data.lastName || ''}
          onChange={(e) => updateData({ lastName: e.target.value })}
        />
      </FormField>
      <FormField label="Email" name="email" required>
        <TextInput
          type="email"
          value={data.email || ''}
          onChange={(e) => updateData({ email: e.target.value })}
        />
      </FormField>
    </div>
  );
};

const AccountTypeStep: React.FC<any> = ({ data, updateData }) => {
  return (
    <div className="space-y-4">
      <FormField label="Account Type" name="accountType" required>
        <RadioGroup
          name="accountType"
          value={data.accountType}
          onChange={(value) => updateData({ accountType: value })}
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'business', label: 'Business' },
            { value: 'enterprise', label: 'Enterprise' }
          ]}
        />
      </FormField>
    </div>
  );
};

const PreferencesStep: React.FC<any> = ({ data, updateData }) => {
  return (
    <div className="space-y-4">
      <Checkbox
        label="Subscribe to newsletter"
        checked={data.newsletter || false}
        onChange={(checked) => updateData({ newsletter: checked })}
      />
      <Checkbox
        label="Enable notifications"
        checked={data.notifications || false}
        onChange={(checked) => updateData({ notifications: checked })}
      />
      <Checkbox
        label="I agree to the terms and conditions"
        checked={data.terms || false}
        onChange={(checked) => updateData({ terms: checked })}
      />
    </div>
  );
};

export const RegistrationWizard: React.FC = () => {
  const handleComplete = (data: any) => {
    console.log('Registration complete:', data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormWizard
        steps={[
          {
            id: 'personal',
            title: 'Personal Info',
            description: 'Tell us about yourself',
            component: PersonalInfoStep,
            validate: async () => true
          },
          {
            id: 'account',
            title: 'Account Type',
            description: 'Choose your plan',
            component: AccountTypeStep
          },
          {
            id: 'preferences',
            title: 'Preferences',
            description: 'Customize your experience',
            component: PreferencesStep
          }
        ]}
        onComplete={handleComplete}
      />
    </div>
  );
};
