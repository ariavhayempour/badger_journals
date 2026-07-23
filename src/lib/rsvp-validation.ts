// Pure, browser-safe RSVP validation (no node:*/DB imports) so the client script and API route share one rules source.

export interface RsvpInput {
  name: string;
  email: string;
  meeting: string;
}

import { MAX_NAME, MAX_EMAIL } from './limits';

export type RsvpField = 'name' | 'email' | 'meeting';

export interface RsvpFieldError {
  field: RsvpField;
  message: string;
}

// Local part, then optional subdomains, then wisc.edu as the final domain.
const WISC_EMAIL = /^[^\s@]+@([a-z0-9-]+\.)*wisc\.edu$/i;

export function validateRsvp(input: RsvpInput): RsvpFieldError[] {
  const errors: RsvpFieldError[] = [];

  if (input.name.trim() === '') {
    errors.push({ field: 'name', message: 'Please enter your name.' });
  } else if (input.name.trim().length > MAX_NAME) {
    errors.push({ field: 'name', message: `Please keep your name under ${MAX_NAME} characters.` });
  }

  if (!WISC_EMAIL.test(input.email.trim())) {
    errors.push({ field: 'email', message: 'Please use your @wisc.edu email.' });
  } else if (input.email.trim().length > MAX_EMAIL) {
    errors.push({ field: 'email', message: `Please use an email under ${MAX_EMAIL} characters.` });
  }

  if (input.meeting.trim() === '') {
    errors.push({ field: 'meeting', message: 'Missing meeting.' });
  }

  return errors;
}
