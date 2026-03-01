# COPILOT Session Restart Guide

Use this file to quickly restart work with Copilot if the session is interrupted.

## Start Prompt (copy/paste)

You are continuing work in this repository.

1. Read `IMPLEMENTATION_PLAN.md` and `Signup.md` completely.
2. Resume from the first unchecked item in `IMPLEMENTATION_PLAN.md`.
3. Do not make assumptions: if any requirement or API contract is unclear, stop and ask.
4. Keep changes minimal and aligned with existing architecture.
5. After each major step, update `IMPLEMENTATION_PLAN.md` progress log and checkboxes.

## Project Context Snapshot

- Stack: React 19 + TypeScript + Vite + Axios
- Routes currently include: login, signup, dashboard, statement, pay-now, exchange, history, help
- Signup page exists but is currently dummy/local-only
- Full target flow is defined in `Signup.md`

## Non-Negotiable Rules

- PoC exception: bank-user credentials can stay in `.env` for now; replace with secure backend/proxy before production.
- Validate all API responses (`IsSuccessful`, errors collection) before proceeding.
- Keep i18n updates in both:
  - `src/lang/english.json`
  - `src/lang/french.json`
- Do not implement beyond defined scope unless explicitly requested.

## If API Responses Are Unclear

Ask for Postman examples using this exact format:

endpoint url and VERB (GET|PUT|POST, etc.)
Body {} as required

## Expected Working Order

1. Resolve open questions in `IMPLEMENTATION_PLAN.md`.
2. Lock request/response contracts.
3. Implement service/types/config layer.
4. Integrate signup UI flow.
5. Implement verification wizard (if in confirmed scope).
6. Run lint/build and update progress log.

## Session Handoff Checklist

Before ending a session, ensure:

- `IMPLEMENTATION_PLAN.md` checkboxes are current.
- Progress log includes date + latest completed action.
- Any blockers/questions are written under open questions.
- Files changed are listed in your handoff note.
