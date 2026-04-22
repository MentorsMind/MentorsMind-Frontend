import { useState, useCallback } from 'react';

export type KYCStatus = 'unverified' | 'pending' | 'basic' | 'enhanced' | 'rejected';

export interface KYCData {
  firstName: string;
  lastName: string;
  dob: string;
  country: string;
  documentType: 'passport' | 'id_card' | 'drivers_license';
  documentFront?: File;
  documentBack?: File;
  selfie?: File;
}

export interface KYCLimits {
  current: number;
  potential: number;
}

export const useKYC = () => {
  const [status, setStatus] = useState<KYCStatus>('unverified');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [kycData, setKycData] = useState<Partial<KYCData>>({});

  const limits: Record<KYCStatus, KYCLimits> = {
    unverified: { current: 1000, potential: 5000 },
    pending: { current: 1000, potential: 5000 },
    basic: { current: 5000, potential: 50000 },
    enhanced: { current: 50000, potential: 1000000 },
    rejected: { current: 1000, potential: 5000 },
  };

  const updateKycData = useCallback((data: Partial<KYCData>) => {
    setKycData((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const submitKYC = useCallback(async () => {
    setStatus('pending');
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 2000);
    });
  }, []);

  const resubmit = useCallback(() => {
    setStatus('unverified');
    setStep(1);
    setRejectionReason(null);
  }, []);

  return {
    status,
    rejectionReason,
    step,
    kycData,
    limits: limits[status],
    updateKycData,
    nextStep,
    prevStep,
    submitKYC,
    resubmit,
    setStep,
  };
};
