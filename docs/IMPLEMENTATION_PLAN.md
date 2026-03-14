# Signup + Verification Implementation Plan

Last updated: 2026-03-01
Owner: Copilot + Ralf
Status: Phases 1-7 complete (verification wizard implemented)

## Goal

Implement the full flow documented in `Signup.md` in the existing React + Vite app:

1. Signup (bank-user-backed multi-call workflow)
2. Login handoff
3. Get Verified 4-step wizard (ID upload, selfie, review/submit, confirmation)
4. Supporting API services, types, validation, i18n strings, and routing

## Current Repository Snapshot (as of this plan)

- `src/pages/Signup.tsx` is a dummy form (no real API integration).
- Existing API client (`src/api/client.ts`) attaches user bearer token globally from local storage.
- Existing auth flow (`src/api/auth.service.ts`, `src/contexts/AuthContext.tsx`) is for end-user login only.
- Existing `API_CONFIG` does not yet include signup/verification endpoint groups.
- No existing `Get Verified` page/wizard route in `src/App.tsx`.

## Constraints We Must Respect

- PoC exception accepted: bank-user credentials and related settings are kept in `.env` for now.
- Keep changes consistent with current service/page/type architecture.
- Reuse existing i18n structure (`src/lang/english.json`, `src/lang/french.json`).
- Implement exactly the flow in `Signup.md` unless clarified otherwise.

## Delivery Phases

## Phase 0 — Clarify & Lock API Contracts

- [x] Confirm exact endpoint casing/path variants to use in this environment
      (example: `/authenticate` vs `/Authenticate`, and `/api/v1` prefix behavior).
- [x] Confirm response object shapes for all signup + verification endpoints used by UI.
- [x] Confirm PoC credential strategy for bank-user operations (frontend `.env` for now).
- [x] Confirm whether full verification wizard must be implemented now or only signup flow first.

Completion criteria:
- All required request/response payloads verified and documented in this file.
- No API shape uncertainty remains for implementation.

---

## Phase 1 — Configuration + Contract Foundation

- [x] Extend `src/api/config.ts` with grouped endpoints for:
      username check, customer create, customer user create, template link,
      country list, identification types, file attachment ops, verified link ops, notes.
- [x] Add environment variable mapping for new configurable values.
- [x] Add/update types under `src/types/` for signup request/response models.

Completion criteria:
- TypeScript compiles with new type contracts.

---

## Phase 2 — Signup Service Layer

- [x] Implement signup orchestration service(s):
      authenticate bank user -> username availability -> create customer -> create user -> link template.
- [x] Implement robust response validation (`IsSuccessful`, `HasErrors`, `ErrorMessages`) and normalized error mapping.
- [x] Return typed result objects consumable by `Signup.tsx`.

Completion criteria:
- Happy path and API failure paths handled deterministically.

---

## Phase 3 — Signup UI Integration

- [x] Wire `src/pages/Signup.tsx` to real service layer.
- [x] Implement password regex-driven validation message support from API settings.
- [x] Implement referred-by required logic + notary node dynamic options.
- [x] Replace dummy success message with actual success redirect behavior.
- [x] Update i18n keys for new signup labels/messages.

Completion criteria:
- Signup form completes real workflow end-to-end in UI.

---

## Phase 4 — Get Verified Foundation

- [x] Add route/page skeleton for get-verified flow.
- [x] Add services for customer, country list, country ID types, attachment listing, vlink lookup/create.
- [x] Implement initial state hydration logic and current-step detection rules.

Completion criteria:
- Page loads with correct wizard step based on existing backend state.

---

## Phase 5 — Wizard Step 1 + Step 2 (Uploads)

- [x] Implement Step 1 ID upload (front/back), file validation, OCR property merge.
- [x] Implement customer patch + front description patch behavior.
- [x] Implement Step 2 selfie upload with `BypassFileAnalysis=true`.

Completion criteria:
- Upload steps complete and persist backend artifacts correctly.

---

## Phase 6 — Wizard Step 3 + Step 4 (Submit + Confirmation)

- [x] Implement review/edit form and validations.
- [x] Implement submit orchestration:
      front description update, customer update, verified link create/update,
      verification metadata append.
- [x] Implement confirmation UI data rendering (reference, URL/code, uploaded docs).
- [ ] Implement notes retrieval/create if included in scope. (Deferred — user decision)

Completion criteria:
- Verification request can be submitted and confirmation data is shown.

---

## Phase 7 — Hardening, Localization, QA

- [x] Ensure all new messages are localized (EN/FR).
- [x] Run lint/build and fix only relevant issues.
- [ ] Add concise README section for signup/verification config and run notes.

Completion criteria:
- `npm run lint` and `npm run build` succeed for changed scope.

## Open Questions (Current)

- Notes feature on Step 4 confirmation page deferred (user decision to add later).

## Postman Examples Needed (for contract lock)

Please share examples in this format for each endpoint below:

endpoint url and VERB (GET|PUT|POST, etc.)
Body {} as required

Minimum set requested:
- `POST /authenticate` (bank user)
- `GET /User/DoesUsernameExist/{username}`
- `POST /Customer/FromTemplate`
- `POST /CustomerUser`
- `PATCH /User/LinkAccessRightTemplate`
- `GET /CountryList`
- `GET /CountryIdentificationTypeList/{countryCode}`
- `GET /FileAttachmentInfoList/{customerId}`
- `POST /FileAttachment` (front/back/selfie examples)
- `PATCH /FileAttachment`
- `PATCH /Customer`
- `POST /VerifiedLink`
- `PATCH /VerifiedLink`
- `GET /ItemNote/{itemId}`
- `POST /ItemNote`

## Progress Log

- [x] 2026-03-01: Re-analyzed repository state and read full `Signup.md`.
- [x] 2026-03-01: Created implementation tracker and restart guide files.
- [x] 2026-03-01: Added signup config/types/service and wired `src/pages/Signup.tsx` to real API workflow.
- [x] 2026-03-01: Added `.env.example` entries for signup PoC configuration.
- [x] 2026-03-01: Implemented full Get Verified wizard (Phases 4-7): types, service, 4-step wizard page, CSS, routing, nav, i18n (EN+FR). Build + lint pass.
