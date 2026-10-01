/**
 * Contact Submission Service
 * Dispatches contact form enquiries to the production POST /api/contact endpoint.
 */

import { api } from './api';

export interface ContactPayload {
  fullName: string;
  email: string;
  phone?: string;
  enquiryType: string;
  orderNumber?: string;
  message: string;
  consent: boolean;
}

export interface ContactSubmissionResult {
  success: boolean;
  status: 'submitted' | 'error';
  message: string;
}

export async function submitContactEnquiry(payload: ContactPayload): Promise<ContactSubmissionResult> {
  // Front-end validation safety check
  if (!payload.fullName || !payload.email || !payload.enquiryType || !payload.message || !payload.consent) {
    return {
      success: false,
      status: 'error',
      message: 'Please complete all required fields.',
    };
  }

  const response = await api.submitContactEnquiry({
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    enquiryType: payload.enquiryType,
    orderNumber: payload.orderNumber,
    message: payload.message,
  });

  if (response.success) {
    return {
      success: true,
      status: 'submitted',
      message: response.message || 'Your enquiry has been received successfully.',
    };
  }

  return {
    success: false,
    status: 'error',
    message: response.message || 'Failed to submit contact enquiry. Please check your network and try again.',
  };
}
