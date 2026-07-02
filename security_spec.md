# Security Specification for Bigate Creative Management

This document defines the data invariants, security test cases ("Dirty Dozen" payloads), and Firestore security rules logic for Bigate Creative Management.

## Data Invariants
1. **Admin Authorization**: Only authenticated users with a registered document in the `/admins/{uid}` collection can modify any database collections.
2. **Admins Collection Entry**: To register as an admin, the written document must contain a valid `pin` matching `"123123123"`.
3. **Tutorial Integrity**: Tutorial titles and URLs must be valid, and only admins can add or delete them.
4. **Spreadsheet Integrity**: Sheets and account sheets must have schema arrays and row maps. Only admins can edit sheets, columns, rows, or cell colors.
5. **Team Profile Integrity**: Team roster records must include name, phone, position, jobdesk, and whatsapp. Only admins can modify them.

## The "Dirty Dozen" Payloads (Denial/Attack Scenarios)
1. **Unauthorized Admin Hijack**: A non-authenticated user trying to create an admin document.
2. **Incorrect PIN Hijack**: An authenticated user trying to create an admin document with PIN `"111111"`.
3. **Bypassing Admin Check on Tutorial**: A non-admin user trying to create a tutorial.
4. **Bypassing Admin Check on Sheet**: A non-admin user trying to create or delete a sheet.
5. **Junk ID Poisoning**: Trying to create a sheet with a 2KB long ID containing malicious characters.
6. **Bypassing Admin Check on Roster**: A non-admin user trying to create a team member profile.
7. **Admins Field Pollution**: Trying to update an admin document to include unapproved roles.
8. **Negative Budget Input**: Trying to set budget field to negative or non-numerical value in sheet rows.
9. **PiI Exposure Risk**: Non-authenticated read access to sheets.
10. **Shadow Fields in Tutorial**: Adding unexpected custom fields like `isPublic: true` or `attackerIp` to tutorial documents.
11. **Malicious Column Addition**: Modifying a sheet to delete all base columns or inject empty column structures.
12. **Terminal State Manipulation**: Modifying cell coordinates of protected admin credentials in the account spreadsheet without credentials.

## Rules Draft Strategy
The actual security rules will be defined in `firestore.rules`. They will leverage `exists()` to verify if a user's UID is in `/admins/{uid}` to permit modifications to lists, sheets, tutorials, and roster docs.
