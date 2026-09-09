import { describe, it, expect } from 'vitest';
import { validateInterestForm } from '../../src/lib/interest-validation';

describe('validateInterestForm', () => {
  it('passes on valid complete input', () => {
    const errors = validateInterestForm({
      firstName: 'Bucky',
      lastName: 'Badger',
      yearInSchool: 'Junior',
      email: 'bucky@wisc.edu',
    });
    expect(errors).toEqual([]);
  });

  it('allows subdomains of wisc.edu', () => {
    const errors = validateInterestForm({
      firstName: 'Bucky',
      lastName: 'Badger',
      yearInSchool: 'Junior',
      email: 'bucky@cs.wisc.edu',
    });
    expect(errors).toEqual([]);
  });

  it('rejects empty first name', () => {
    const errors = validateInterestForm({
      firstName: '   ',
      lastName: 'Badger',
      yearInSchool: 'Junior',
      email: 'bucky@wisc.edu',
    });
    expect(errors).toContainEqual({ field: 'firstName', message: 'Please enter your first name.' });
  });

  it('rejects empty last name', () => {
    const errors = validateInterestForm({
      firstName: 'Bucky',
      lastName: '',
      yearInSchool: 'Junior',
      email: 'bucky@wisc.edu',
    });
    expect(errors).toContainEqual({ field: 'lastName', message: 'Please enter your last name.' });
  });

  it('rejects empty year in school', () => {
    const errors = validateInterestForm({
      firstName: 'Bucky',
      lastName: 'Badger',
      yearInSchool: '',
      email: 'bucky@wisc.edu',
    });
    expect(errors).toContainEqual({ field: 'yearInSchool', message: 'Please select your year in school.' });
  });

  it('rejects non-wisc.edu emails', () => {
    const invalidEmails = ['bucky@gmail.com', 'bucky@wisc.edu.fake.com', 'bucky', '@wisc.edu'];
    for (const email of invalidEmails) {
      const errors = validateInterestForm({
        firstName: 'Bucky',
        lastName: 'Badger',
        yearInSchool: 'Junior',
        email,
      });
      expect(errors).toContainEqual({ field: 'email', message: 'Please use your @wisc.edu email.' });
    }
  });

  it('rejects names and emails exceeding length limits', () => {
    const errors = validateInterestForm({
      firstName: 'a'.repeat(121),
      lastName: 'b'.repeat(121),
      yearInSchool: 'c'.repeat(51),
      email: `${'d'.repeat(250)}@wisc.edu`,
    });
    expect(errors.map((e) => e.field)).toEqual(['firstName', 'lastName', 'yearInSchool', 'email']);
  });
});
