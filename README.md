# Academic analyzer backend

Requires Node.js 22.14+ (PDF.js), npm, and these environment variables:

- `OPENAI_API_KEY`
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for the shared rate limiter
- `SESSION_SECRET` (at least 32 characters), `APP_PASSWORD_HASH` for login
- `PORT` (optional, default 3000)

Run `npm install`, `npm run build`, then `npm start`. Run tests with `npm test`.

## POST /analyze

Requires the session cookie issued by `/login`. Send `multipart/form-data`:

- `rules`: profile ID from `src/docs/01-czu-pef-bakalarka.json` (same enabled profile as the serverless app)
- `assignment`: optional assignment text, up to 5,000 characters
- `documents`: repeated PDF or DOCX file fields; at least one, with unique filenames

The total multipart body is limited to 50 MiB. Documents are processed sequentially,
first PDF checks, then AI analysis. Response: `{ "filename.pdf": { "pdf": {...}, "ai": {...} } }`.
The PDF pipeline is identical to the serverless implementation, including table
extraction. Its current limitation is also preserved: although input validation accepts
DOCX, the PDF parser cannot analyze it and the request fails. Use PDF for comparisons.

AI prompts, model (`gpt-5.6-terra`), response schema, profile and PDF checks are
ported from `academic-analyzer-fe`. The request logs preserve its JSON events,
request/document correlation IDs, stage timings, OpenAI operation counts and
approximate payload sizes. Documents and assignment text are not logged.

Errors match the serverless endpoint: 400 invalid input, 403 unknown profile,
429 rate limit (10 requests per 60 seconds), 500 analysis/provider failure.
Authentication failures return 401. A batch failure returns 500, without partial results.

Rate limiting uses Koa's `ctx.ip`. If deployed behind a reverse proxy, configure
trusted proxy handling for that deployment before relying on client IP limits.
Tests use service doubles and do not make paid OpenAI requests.

## Experiment parity

`src/docs/01-czu-pef-bakalarka.json` is a complete, independent copy of the
serverless app’s `app/docs/01-czu-pef-bakalarka.json`. No rules JSON is sent
from FE to BE: the multipart `rules` field contains only `profile_id`. The BE
selects its local profile and uses `documentRules` for PDF checks and `rules`
for AI analysis. Keep both copies synchronized manually when changing the experiment.

All modules in `src/pdf` are copied from the serverless app’s `lib/pdf`; only
TypeScript type imports and module paths are adapted for Node ESM.
