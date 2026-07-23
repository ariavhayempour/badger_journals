// Pure, browser-safe rules (no node:*/DB imports) shared by the client script and the API route.

import { SUBMISSION_TYPES, type SubmissionType } from '../db/schema';

export interface SubmissionInput {
  name: string;
  email: string;
  type: SubmissionType;
  message: string;
}

export type SubmissionField = 'name' | 'email' | 'message' | 'type';

export interface SubmissionFieldError {
  field: SubmissionField;
  message: string;
}

// Local part, then optional subdomains, then wisc.edu as the final domain.
const WISC_EMAIL = /^[^\s@]+@([a-z0-9-]+\.)*wisc\.edu$/i;

export function validateSubmission(input: SubmissionInput): SubmissionFieldError[] {
  const errors: SubmissionFieldError[] = [];

  if (input.name.trim() === '') {
    errors.push({ field: 'name', message: 'Please enter your name.' });
  }

  if (!WISC_EMAIL.test(input.email.trim())) {
    errors.push({ field: 'email', message: 'Please use your @wisc.edu email.' });
  }

  if (input.message.trim() === '') {
    errors.push({ field: 'message', message: 'Please enter a message.' });
  }

  if (!SUBMISSION_TYPES.includes(input.type)) {
    errors.push({ field: 'type', message: 'Unknown submission type.' });
  }

  return errors;
}
