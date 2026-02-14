# TASK-8: Fix Existing Email Bugs

## What You're Building
Fix two pre-existing bugs in the email sending route.

## Dependencies
- None (independent of all other tasks)

## Files to Modify

### `app/api/send-email/route.ts`

**Bug 1: Public event customer email shows package/pricing**
When a customer submits a public event inquiry, the confirmation email they receive incorrectly shows package selection and pricing sections. Public events get custom quotes — the email should NOT show package or pricing details.

Fix: Wrap the package/pricing/drink sections in the customer email HTML with a condition that only shows them for private events (`eventCategory === 'private'`).

**Bug 2: Contact info placeholders not filled in**
The customer confirmation email contains placeholder text: `[YOUR PHONE]`, `[YOUR EMAIL]`, `[YOUR WEBSITE]`. These should be replaced with real values:
- Phone: 386-882-6560
- Email: theporchkombuchabar@gmail.com
- Website: (check if there's a real URL, otherwise remove the website line or use the Instagram handle)

## Success Criteria
- Public event customer emails don't show package/pricing sections
- Contact info in customer emails shows real phone and email
- Private event emails still work correctly (no regression)
