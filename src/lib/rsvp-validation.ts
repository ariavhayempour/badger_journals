// Pure, browser-safe RSVP validation. No node:* or DB imports — the client
// script and the API route both import this so the rules stay in one place.

export interface RsvpInput {
  name: string;
  email: string;
  meeting: string;
}

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
  }

  if (!WISC_EMAIL.test(input.email.trim())) {
    errors.push({ field: 'email', message: 'Please use your @wisc.edu email.' });
  }

  if (input.meeting.trim() === '') {
    errors.push({ field: 'meeting', message: 'Missing meeting.' });
  }

  return errors;
}
