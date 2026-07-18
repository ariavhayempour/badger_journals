# 008: RSVP to a meeting

## Story

As an end user, I want to RSVP to a specific meeting with my name and wisc.edu email, so that the club knows I plan to attend.

## Acceptance Criteria

- Each meeting exposes an RSVP action that collects name and email
- Submitting a valid RSVP persists {name, email, meeting, timestamp} and shows a success confirmation
- Submitting with a missing name or an email that is not a valid wisc.edu address shows a specific inline error and does not persist
- A submission failure shows a user-friendly error and does not lose the entered values
- The RSVP form is keyboard-navigable with visible focus states

## Technical Notes

- Depends on 006 (data store) and 007 (meeting identity)
- First form→backend pattern in the repo; establishes the reusable submission pattern that 009 reuses
- Async/DB write plus security-adjacent wisc.edu validation
- Assumption: wisc.edu email is format/domain validated, not ownership-verified (no confirmation email) — confirm with product owner
- Affected files (create): `src/pages/api/rsvp.ts`, `src/components/RsvpForm.tsx`, `src/db/rsvp.ts`; wire into `MeetingsCalendar`

## Points: 5
