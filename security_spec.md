# Security Specification & Test Cases (TDD)

## 1. Data Invariants

1. **User Ownership**: A user document can only be created or modified by the user themselves (matching their authenticated UID).
2. **Story Authentication**: A story can only be posted by an authenticated user whose UID matches the story's `userId`.
3. **Connection Immutability**: Connections are system-driven and once established, they cannot be updated or deleted by normal users via client-side operations.
4. **Message Integrity**: A message inside a connection chat can only be posted by a user who is a participant of that connection (`user1Id` or `user2Id` in the connection document).
5. **System Messages Integrity**: System messages (`isSystem == true`) can only be created during initial connection setup and cannot be faked or sent by users.

---

## 2. The "Dirty Dozen" Payloads

Here are 12 specific payloads representing critical security threats to the system. Each of these must be rejected with `PERMISSION_DENIED`:

### User Entity Attacks
1. **User Spoofing**: Attempt to create a user document with a document ID of `attacker_user_id` but authenticated as `victim_user_id`.
2. **Admin Claim Escalation**: Attempt to write a user document where the user sets a custom `isAdmin` field or similar roles field to `true`.
3. **Shadow Field Inject**: Attempt to update a user's biography but adding an unauthorized key `ghostField: "hacked"`.

### Story Entity Attacks
4. **Story Identity Hijack**: Attempt to post a story under a victim's `userId` (victim_uid) while authenticated as attacker_uid.
5. **Invalid Story Genre**: Attempt to publish a story with an unapproved/dangerous genre or a 1MB payload string.
6. **Cross-User Story Editing**: Attempt to modify another user's story document.
7. **Immortality Field Overwrite**: Attempt to change `createdAt` of a story on update.

### Connection Entity Attacks
8. **Direct Connection Hijack**: Attempt to create a connection directly from the client side without using the secure system backend.
9. **Resonance Score Poisoning**: Attempt to update a connection to increase the `matchScore` to `100` from the client side.

### Message Entity Attacks
1. **Stranger Chat Intruder**: Attempt to list or get messages from a connection where the authenticated user is neither `user1Id` nor `user2Id`.
2. **Fake System Message**: Attempt to send a message where `isSystem` is set to `true` to impersonate the Librarian AI.
3. **Temporal Invariant Violation**: Attempt to post a message with a falsified client-side `createdAt` timestamp instead of the server timestamp (`request.time`).

---

## 3. Test Runner: `firestore.rules.test.ts`

This spec ensures that all 12 payloads are tested and fail securely under our security rules.
