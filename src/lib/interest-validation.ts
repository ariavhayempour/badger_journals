// Pure, browser-safe interest form validation (no node:*/DB imports) so client script and API route share rules source.

export interface InterestFormInput {
  firstName: string;
  lastName: string;
  yearInSchool: string;
  email: string;
}

import { MAX_NAME, MAX_EMAIL } from './limits';

export type InterestFormField = 'firstName' | 'lastName' | 'yearInSchool' | 'email';

export interface InterestFormFieldError {
  field: InterestFormField;
  message: string;
}

const WISC_EMAIL = /^[^\s@]+@([a-z0-9-]+\.)*wisc\.edu$/i;
const MAX_YEAR = 50;

function firstNameErrors(firstName: string): InterestFormFieldError[] {
  if (firstName.trim() === '') return [{ field: 'firstName', message: 'Please enter your first name.' }];
  if (firstName.trim().length > MAX_NAME) {
    return [{ field: 'firstName', message: `Please keep your first name under ${MAX_NAME} characters.` }];
  }
  return [];
}

function lastNameErrors(lastName: string): InterestFormFieldError[] {
  if (lastName.trim() === '') return [{ field: 'lastName', message: 'Please enter your last name.' }];
  if (lastName.trim().length > MAX_NAME) {
    return [{ field: 'lastName', message: `Please keep your last name under ${MAX_NAME} characters.` }];
  }
  return [];
}

function yearInSchoolErrors(yearInSchool: string): InterestFormFieldError[] {
  if (yearInSchool.trim() === '') return [{ field: 'yearInSchool', message: 'Please select your year in school.' }];
  if (yearInSchool.trim().length > MAX_YEAR) {
    return [{ field: 'yearInSchool', message: `Please keep your year in school under ${MAX_YEAR} characters.` }];
  }
  return [];
}

function emailErrors(email: string): InterestFormFieldError[] {
  if (!WISC_EMAIL.test(email.trim())) {
    return [{ field: 'email', message: 'Please use your @wisc.edu email.' }];
  }
  if (email.trim().length > MAX_EMAIL) {
    return [{ field: 'email', message: `Please use an email under ${MAX_EMAIL} characters.` }];
  }
  return [];
}

export function validateInterestForm(input: InterestFormInput): InterestFormFieldError[] {
  return [
    ...firstNameErrors(input.firstName),
    ...lastNameErrors(input.lastName),
    ...yearInSchoolErrors(input.yearInSchool),
    ...emailErrors(input.email),
  ];
}
