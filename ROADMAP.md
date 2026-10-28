# Backend Roadmap

A running record of what we are building, why, what is done, and what comes next.
**Backend only.** The "client" throughout is Postman or curl; a frontend is out of scope.

Update the checkboxes and the status table as each step lands.

---

## 1. The goal

This project started as a course app: a small Express + MongoDB + JavaScript API
that I wrote by hand to understand how a server behaves. The goal is two things,
in this order:

1. **Learn modern backend development deeply**, by growing this project one
   concept at a time, until I understand every layer a request passes through:

   ```
   client → middleware → route → controller → service → repository → database
                                                                         │
   client ← response ← controller ← service ← repository ←───────────────┘

   anything throws at any layer → errorHandler → error response
   ```

   | Layer | Folder | Job | Knows `req`/`res`? | Knows the database? |
   |---|---|---|---|---|
   | Entry | `index.ts` | start the server, connect the database | no | connects only |
   | App | `app.ts` | global middleware, mount routers, error handlers last | yes | no |
   | Routes | `routes/` | URL + method → middleware + controller | yes | no |
   | Middleware | `middleware/` | validate input, (later) check login, handle errors | yes | no |
   | Controller | `controller/` | read the request, call a service, send the success response | **yes** | **no** |
   | Service | `services/` | business rules; returns plain results; throws `AppError` | **no** | **no** |
   | Repository | `repositories/` | database calls only; returns `null` when nothing matched | no | **yes** |
   | Model / schema | `models/` (Mongo), `db/` (Postgres, step 4) | the shape of the stored data | no | yes |

2. **Turn it into the backend for a Substack-style publishing platform**:
   writers run publications and publish posts, readers subscribe (free or paid),
   new posts are emailed to subscribers, and readers comment and like.

The Substack features come last on purpose. Each one is chosen because it
teaches a backend skill that the earlier steps prepared me for
(see section 6, "How Substack maps to backend skills").

## 2. How we work

- **One file at a time.** Change one file, explain it, review it, then move on.
- **Long, explicit code.** No shorthand that hides what is happening. If I would
  have to ask "what does that do?", write it the longer way.
- **Concepts before code.** Every new idea gets explained from scratch first.
- **Change one thing at a time.** So when something breaks, we know which change broke it.
- **Each step ends with a self-check.** The step is done when I can answer its
  "Done when I can explain" questions without looking, not just when the code works.

---

## 3. Where we are

| Phase | Step | What | Status |
|---|---|---|---|
| 1. Foundations | 1 | Fix bugs in the old controllers | Done (folded into 3a) |
| | 2 | Convert to TypeScript | Done |
| | 3a | Central error handling | Done |
| | 3b | Request validation with Zod | Done |
| | 3c | Service and repository layers | Done |
| | 3d | RESTful routes and API conventions | **Next** |
| 2. Data and identity | 4 | MongoDB → PostgreSQL | Not started |
| | 5 | Authentication and authorization | Not started |
| 3. Production-ready | 6 | Testing | Not started |
| | 7 | Configuration, logging, health | Not started |
| | 8 | Security hardening | Not started |
| | 9 | Deployment and CI | Not started |
| 4. Substack core | 10 | Domain model and API design | Not started |
| | 11 | Publications and posts | Not started |
| | 12 | Subscriptions and the feed | Not started |
| | 13 | Comments and likes | Not started |
| 5. Substack advanced | 14 | Background jobs and email delivery | Not started |
| | 15 | Paid subscriptions | Not started |
| | 16 | Search | Not started |
| | 17 | Image uploads | Not started |
| | 18 | Performance and caching | Not started |

---

## 4. Decision log

Decisions already made, and why. Revisit one only with a reason.

| Decision | Why |
|---|---|
| TypeScript, `strict: true` | Catch mistakes before the code runs; types document the shape of data. |
| Express 5 (not 4) | Forwards errors from `async` handlers to the error handler automatically. |
| Zod for input validation | TypeScript cannot check data from the internet; Zod checks it at runtime and gives the type from the same definition. |
| PostgreSQL instead of MongoDB | A publishing platform is full of relationships (users → publications → posts → comments, users ↔ subscriptions). Relational databases are built for that, and enforce rules like "unique email" in the table itself. |
| Drizzle (not Prisma) | Queries read like SQL, so I learn SQL instead of hiding it. |
| Docker for local Postgres | Same database on any machine; no installing Postgres by hand. |
| Neon to host (not Supabase) | Plain Postgres. Supabase bundles auth and auto-generated APIs, which are exactly the things I want to build myself. |
| Service layer before the database swap | So the swap only touches one layer, and I can see why layering matters. |
| Separate repository layer | Chosen for learning. Services hold only rules; repositories hold only database calls. Cost: some service functions just pass calls through until they gain rules (expected from step 5 and step 11). Benefit: the step 4 swap rewrites `repositories/` and leaves services alone. |
| Services return `PublicUser`, never the raw user | The password hash cannot leak through a controller, even by accident. |

Still to decide (decide when we reach the step): sessions vs JWT (step 5),
test runner (step 6), logger (step 7), API host (step 9), job queue (step 14),
email provider (step 14).

---

## 5. The steps

Each step has:
- **Why**: the problem it solves.
- **Learn**: the concepts to understand deeply.
- **Tasks**: the work, one file at a time.
- **Done when I can explain**: the self-check.

---

### Phase 1: Foundations

The structure of a modern Express app.

#### Step 2: TypeScript conversion (done)

- [x] Tooling: `typescript`, `tsx`, `@types/*`; `tsconfig.json` with `strict: true`
- [x] Scripts: `dev` (tsx watch), `build` (tsc), `start` (node dist), `typecheck`
- [x] Every file renamed to `.ts`; `allowJs` removed
- [x] `post.model.ts`: `IPost` interface passed to `Schema<IPost>` and `model<IPost>`
- [x] `user.model.ts`: `IUser`, `IUserMethods`, `UserModel` for the custom `comparePassword`
- [x] Controllers typed with `Request` / `Response`
- [x] `database.ts` throws when `MONGODB_URI` is missing; `index.ts` decides to exit
- [x] `index.ts` reads `PORT` once; listen errors handled through the Express 5 `app.listen` callback

**Learned:** narrowing (`if (!x) throw`), generics (`<T>`) vs unions (`A | B`),
`unknown` in `catch`, `import type`, and that types disappear at runtime so they
cannot validate real input.

#### Step 3a: Central error handling (done)

- [x] `utils/AppError.ts`: an error that carries an HTTP status code
- [x] `middleware/error.middleware.ts`: `notFound` and `errorHandler`
- [x] Registered at the bottom of `app.ts` (order matters)
- [x] Post controller: no `try/catch`, throws `AppError` instead
- [x] User controller: same, plus 409 for duplicate users and 401 for login failures
- [x] Login returns the same message for unknown email and wrong password (no account probing)

**Learned:** classes, `extends`, `constructor`, `super`; the middleware chain and
`next()`; the four-parameter error handler; Express 5 forwards async errors;
which status code to use (section 8).

#### Step 3b: Zod validation (done)

- [x] `schemas/post.schema.ts`: `createPostSchema`, `updatePostSchema` (+ inferred types)
- [x] `schemas/user.schema.ts`: `registerSchema`, `loginSchema` (+ inferred types)
- [x] `middleware/validate.middleware.ts`: takes a schema, returns a middleware
- [x] Attached per route in `post.routes.ts` and `user.routes.ts`
- [x] Controllers read typed input (`CreatePostInput`, `UpdatePostInput`, `RegisterInput`, `LoginInput`)
- [x] Unknown fields are stripped, so clients cannot write fields we did not allow

**Learned:** closures (a function that returns a function and remembers its
inputs), `safeParse`, `.optional()`, `z.infer`, where middleware can sit
(app, router, or a single route), and that Zod checks the email format before
trimming unless you `.pipe()`.

#### Step 3c: Service and repository layers (done)

**Why:** controllers did two jobs: handle HTTP *and* talk to the database.
Mixing them makes both harder to change and to test.

- [x] `repositories/post.repository.ts`: `create`, `findAll`, `updateById`, `deleteById` (Mongoose only)
- [x] `services/post.service.ts`: `createPost`, `listPosts`, `updatePost`, `deletePost` (rules only)
- [x] `post.controller.ts`: read, delegate, respond; typed `req.params` with `Request<PostIdParams>`
- [x] `repositories/user.repository.ts`: `create`, `findByEmail`
- [x] `services/user.service.ts`: `registerUser` (409 rule), `loginUser` (401 rule), `logoutUser`; returns `PublicUser`
- [x] `user.controllers.ts`: read, delegate, respond
- [x] Verified: only repositories import a model; no controller imports a repository or model
- [x] Controller functions renamed to `handle...` so they cannot be confused with the service functions they call

**Naming convention** (use it for every new feature):

| Layer | Pattern | Example |
|---|---|---|
| Controller | `handle` + action | `handleLogin`, `handleUpdatePost` |
| Service | what the app does | `loginUser`, `updatePost` |
| Repository | database operation | `findByEmail`, `updateById` |

**Learned:** separation of concerns; controller = HTTP, service = rules,
repository = data; the repository returns `null` and the service decides it means 404;
rules can run before, after, and around repository calls; Zod checks the *shape*
of input, services check things that need the app's *state*; checks run cheapest
first and the request stops at the first one that fails; `await` pauses the
caller until the layers below answer, and re-throws if any of them threw;
`import * as`;
`Request<Params>` generics; Express 5 types params as `string | string[]`;
structural typing (`UserFromDatabase`).

**Known gap:** password hashing (pre-save hook) and `comparePassword` are still
Mongoose model features the user service depends on. They move into the service
in step 4.

**Done when I can explain:**
- If we swapped MongoDB for Postgres tomorrow, which files would change, and why only those?
- Why shouldn't a service function receive `req`?
- Why does the repository return `null` instead of throwing a 404?
- Where does the "user already exists" rule live now, and why there?
- Name one rule that runs before the repository and one that runs after.

#### Step 3d: RESTful routes and API conventions (next)

**Why:** our routes name *actions* (`/create`, `/update/:id`, `/delete/:id`).
REST names *resources* and lets the HTTP method say the action. Every real API,
including the Substack one, follows this.

**Learn:**
- Resources vs actions; plural nouns (`/posts`, `/posts/:id`)
- HTTP methods and their meaning: GET, POST, PUT, PATCH, DELETE
- "Safe" (does not change data) and "idempotent" (repeating it has the same effect)
- PUT (replace the whole thing) vs PATCH (change some fields)
- API versioning (`/api/v1`), and why it exists
- A consistent response shape for success and errors
- 204 No Content for deletes

**Tasks:**
- [ ] Posts become: `POST /posts`, `GET /posts`, `GET /posts/:id` (new), `PATCH /posts/:id`, `DELETE /posts/:id`
- [ ] Decide one response shape and apply it everywhere
- [ ] Auth routes stay as actions (`/auth/register`, `/auth/login`); know why that is acceptable

**Done when I can explain:**
- Why `DELETE /posts/5` is better than `POST /posts/delete/5`
- Which methods are idempotent, and why that matters if a client retries a request
- When I would use PUT instead of PATCH

---

### Phase 2: Data and identity

#### Step 4: MongoDB → PostgreSQL

**Why:** relational data needs a relational database. This is also where I learn SQL,
which every backend developer needs regardless of the ORM.

**Learn:**
- Documents (Mongo) vs tables and rows (Postgres), and when each fits
- Column types, `NOT NULL`, `DEFAULT`, `CHECK` constraints
- Primary keys: auto-increment integers vs UUIDs
- Foreign keys, and what `ON DELETE CASCADE` / `RESTRICT` / `SET NULL` do
- Unique constraints (and why they are stronger than Mongoose's `unique: true`)
- Indexes: what they are, what they cost, when to add one
- SQL by hand first: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `WHERE`, `ORDER BY`, `LIMIT`
- `JOIN`s: inner vs left
- Transactions: all-or-nothing changes
- Migrations: why schema changes are versioned files, not edits made by hand
- SQL injection, and how parameterized queries prevent it
- Connection pools: why we don't open a new connection per request
- ORM vs query builder vs raw SQL
- Docker basics: images, containers, volumes, `docker compose`

**Tasks:**
- [ ] `docker-compose.yml` for local Postgres; connect with `psql` and write the tables in raw SQL first
- [ ] `db/schema.ts` (Drizzle tables for users and posts)
- [ ] `db/index.ts` (connection pool)
- [ ] First migration, generated and applied
- [ ] A seed script with sample data
- [ ] Rewrite the repository files to use Drizzle instead of Mongoose (services and controllers should not change)
- [ ] Move password hashing and `comparePassword` out of the model and into the user service
- [ ] Repositories describe their own input types instead of borrowing the Zod input types
- [ ] Translate database errors (e.g. unique violation → 409) in one place
- [ ] Remove `mongoose`, the Mongo models, and `database.ts`
- [ ] Extend `validate` to cover `req.params` (the `:id`) and `req.query`
- [ ] Validate environment variables with Zod at startup (`config/env.ts`)

**Done when I can explain:**
- What a foreign key prevents, with an example from this app
- What happens to a user's posts when the user is deleted, and where that is decided
- Why an index makes reads faster but writes slower
- What a migration is, and why I never edit the database schema by hand
- How `WHERE email = $1` with a parameter prevents SQL injection
- What a transaction is, and one place in this app that needs one

#### Step 5: Authentication and authorization

**Why:** right now login does not log anyone in. Nothing is issued, so the server
cannot tell who is making a request, and anyone can edit any post.

**Learn:**
- Authentication ("who are you?") vs authorization ("are you allowed?")
- Hashing vs encryption; salts; why `bcrypt` is slow on purpose
- Sessions (server remembers you) vs JWTs (a signed token you carry); the trade-offs
- Cookies: `httpOnly`, `secure`, `sameSite`, and why tokens should not live in `localStorage`
- Access tokens and refresh tokens; expiry; what "logging out" means for each
- CORS: what it protects, and what it does not
- CSRF: when cookies make you vulnerable, and how `sameSite` helps
- Brute-force protection and rate limiting
- Password reset and email verification flows: one-time, expiring, hashed tokens

**Tasks:**
- [ ] Decide sessions vs JWT and write the reasoning in the decision log
- [ ] Login issues the session/token; logout revokes it
- [ ] `requireAuth` middleware attaches the current user to the request
- [ ] Posts get an `authorId`; only the author can edit or delete (403 otherwise)
- [ ] `GET /auth/me` returns the logged-in user
- [ ] Rate limit the login route
- [ ] Password reset flow
- [ ] Email verification flow

**Done when I can explain:**
- The difference between a 401 and a 403, with a request from this app for each
- Exactly what is stored on the server and on the client after login, and why
- What an attacker could do with a stolen token, and how expiry limits it
- Why the password reset token is stored hashed

---

### Phase 3: Production-ready

Before building real features, make the app safe to change and safe to run.

#### Step 6: Testing

**Learn:**
- Unit vs integration vs end-to-end tests; what each catches
- Testing a service directly vs testing an HTTP route
- A separate test database, and resetting it between tests
- Factories and fixtures for test data
- What is worth testing (rules, edge cases, auth) and what is not

**Tasks:**
- [ ] Choose a test runner (Vitest is the likely pick) and an HTTP test helper (supertest)
- [ ] Tests for `validate` middleware and `errorHandler`
- [ ] Tests for each service
- [ ] Route tests for the full request → response flow, including auth failures
- [ ] `npm test` runs everything against a test database

**Done when I can explain:**
- Why a test that hits a real test database is worth more here than one that mocks it
- What test I would write first after finding a bug, and why

#### Step 7: Configuration, logging, health

**Learn:**
- Twelve-factor config: settings come from the environment
- Structured logs (JSON) vs `console.log`; log levels
- Request IDs: following one request through the logs
- Health checks: how hosting platforms know the app is alive
- Graceful shutdown: finishing in-flight requests and closing the DB pool on `SIGTERM`

**Tasks:**
- [ ] Choose a logger (pino is the likely pick); replace `console.log`
- [ ] Request ID middleware; include it in every log line and error response
- [ ] `GET /health` (app up) and a readiness check (database reachable)
- [ ] Graceful shutdown in `index.ts`

**Done when I can explain:**
- How I would find every log line for one failed request in production
- What happens to a request that is in flight when the server is told to stop

#### Step 8: Security hardening

**Learn:**
- The OWASP Top 10, mapped to this app
- Broken access control (the most common real-world bug)
- Mass assignment (already blocked by Zod stripping unknown fields; know why)
- XSS, and why it matters for a platform where users write rich-text posts
- Security headers (`helmet`), CORS configuration, request size limits
- Secrets management; never committing `.env`
- Dependency vulnerabilities (`npm audit`)

**Tasks:**
- [ ] `helmet`, a strict CORS allowlist, an explicit `express.json()` size limit
- [ ] A global rate limit, plus stricter limits on auth routes
- [ ] Sanitize stored post HTML (needed by step 11)
- [ ] Walk the OWASP Top 10 against this codebase and note the findings

**Done when I can explain:**
- How a reader could attack other readers through a post body, and what stops it
- Why "only the author can edit" must be checked on the server even if the UI hides the button

#### Step 9: Deployment and CI

**Learn:**
- Building for production: compile, then run `dist/`
- Dockerfiles; multi-stage builds
- Environments: development, staging, production
- Running migrations on deploy, safely
- Continuous integration: every push runs typecheck, tests and build
- Database branches on Neon for testing migrations

**Tasks:**
- [ ] Dockerfile for the API
- [ ] GitHub Actions workflow: typecheck, test, build
- [ ] Choose an API host and deploy
- [ ] Production database on Neon; migrations run as part of deploy
- [ ] Clean up the course's `package.json` metadata (author, repository URL)

**Done when I can explain:**
- Every step between `git push` and the new code serving requests
- How to roll back a bad deploy, and why rolling back a migration is harder

---

### Phase 4: Substack core

The placeholder `post` (with `name`, `description`, `age`) is replaced by the real domain.

#### Step 10: Domain model and API design

**Learn:**
- Turning product features into entities and relationships
- One-to-many, many-to-many (join tables), self-referencing relations
- Entity-relationship diagrams
- Slugs (`/p/my-first-post`) and why they need uniqueness rules
- Soft delete (`deletedAt`) vs hard delete
- Pagination: offset vs cursor, and why feeds use cursors
- Nested routes (`/publications/:slug/posts`) vs flat routes (`/posts/:id`)

**Tasks:**
- [ ] Draw the entity-relationship diagram for section 7 and refine it
- [ ] Write the full API outline (every route, method, auth requirement, status codes)
- [ ] Migration from the placeholder schema to the real one

**Done when I can explain:**
- Why subscriptions need their own table instead of a list on the user
- Why cursor pagination does not skip or repeat posts when new ones are published

#### Step 11: Publications and posts

**Learn:**
- Ownership and authorization rules on nested resources
- State machines: `draft → published` (and later `scheduled`)
- Storing rich text: Markdown vs HTML vs structured JSON, and the trade-offs
- Timestamps that mean something: `createdAt`, `updatedAt`, `publishedAt`

**Tasks:**
- [ ] A user can create a publication (name, slug, description)
- [ ] Posts belong to a publication: title, subtitle, slug, body, status
- [ ] Drafts are visible only to the author; publishing sets `publishedAt`
- [ ] Public routes: a publication's page and its published posts

**Done when I can explain:**
- How the API stops a reader from fetching someone else's draft
- What happens to the slug if a published post's title changes

#### Step 12: Subscriptions and the feed

**Learn:**
- Many-to-many relationships in practice
- Idempotent actions (subscribing twice is not an error)
- Queries with `JOIN`, `ORDER BY` and cursor pagination
- Composite indexes for the feed query
- Counts: computing on read vs storing a counter

**Tasks:**
- [ ] Subscribe and unsubscribe to a publication
- [ ] "My subscriptions" list
- [ ] `GET /feed`: published posts from my subscriptions, newest first, cursor-paginated
- [ ] Subscriber count on a publication

**Done when I can explain:**
- The SQL behind the feed, and which index makes it fast
- Why a unique constraint on (user, publication) matters

#### Step 13: Comments and likes

**Learn:**
- Self-referencing relations (replies to comments)
- Race conditions: two likes arriving at once
- Transactions and atomic counter updates
- Cascades: what happens to comments when a post is deleted

**Tasks:**
- [ ] Comment on a post; reply to a comment
- [ ] Like and unlike a post (one like per user)
- [ ] The post author can delete comments on their post
- [ ] Like and comment counts on posts

**Done when I can explain:**
- How two simultaneous likes could produce a wrong count, and how the database prevents it

---

### Phase 5: Substack advanced

#### Step 14: Background jobs and email delivery

**Why:** sending a post to 10,000 subscribers cannot happen inside one HTTP request.

**Learn:**
- Why slow work moves out of the request: queues and workers
- Retries, backoff, and dead-letter handling
- Idempotency: making sure a retry does not email someone twice
- Transactional emails (password reset) vs bulk sends (newsletters)
- Signed unsubscribe links
- Scheduled jobs (publish at a future time)

**Tasks:**
- [ ] Choose a queue (pg-boss uses Postgres, so no extra service; BullMQ needs Redis)
- [ ] Choose an email provider
- [ ] Publishing a post enqueues one email job per subscriber
- [ ] Unsubscribe link that works without logging in
- [ ] Scheduled publishing

**Done when I can explain:**
- What happens if the server crashes halfway through sending a newsletter

#### Step 15: Paid subscriptions

**Learn:**
- Payment providers (Stripe): products, prices, checkout, customers
- Webhooks: verifying signatures, handling retries and out-of-order events
- Why payment state comes from the provider, never from the client
- Access control on content (paywall: paid posts show only a preview)

**Tasks:**
- [ ] A publication can offer a paid tier
- [ ] Checkout flow, and a webhook that records the subscription
- [ ] Paid posts return a preview to non-paying readers
- [ ] Handle cancellation and failed payments

**Done when I can explain:**
- Why the webhook, not the redirect after checkout, decides that someone has paid

#### Step 16: Search

**Learn:**
- Postgres full-text search: `tsvector`, `tsquery`, ranking, GIN indexes
- When a separate search engine becomes worth it

**Tasks:**
- [ ] Search published posts and publications

#### Step 17: Image uploads

**Learn:**
- Why files go in object storage (S3, R2), not the database
- Presigned URLs: the client uploads directly, the API only signs
- Validating file type and size

**Tasks:**
- [ ] Cover images for posts and logos for publications

#### Step 18: Performance and caching

**Learn:**
- `EXPLAIN ANALYZE`: reading a query plan
- N+1 queries and how to spot them
- Caching hot reads (Redis); cache invalidation
- HTTP caching headers (`ETag`, `Cache-Control`)

**Tasks:**
- [ ] Profile the feed and the publication page; fix what is slow
- [ ] Cache public, read-heavy pages

#### Later, if wanted

- Multi-author publications (roles: owner, editor, contributor)
- Notifications (in-app, real-time with server-sent events or websockets)
- Analytics: post views, email opens
- OpenAPI documentation for the API
- Admin and moderation tools

---

## 6. How Substack maps to backend skills

| Substack feature | Backend skill it teaches | Step |
|---|---|---|
| Sign up, log in | Hashing, sessions/JWT, cookies | 5 |
| Only authors edit their posts | Authorization, 403 | 5, 11 |
| Drafts vs published | State, visibility rules | 11 |
| Publications and posts | One-to-many relations, foreign keys | 10, 11 |
| Subscribing | Many-to-many, unique constraints, idempotency | 12 |
| The feed | Joins, indexes, cursor pagination | 12 |
| Comments and replies | Self-referencing relations, cascades | 13 |
| Like counts | Race conditions, transactions | 13 |
| Emailing new posts | Queues, workers, retries | 14 |
| Paid posts | Webhooks, external services, paywalls | 15 |
| Rich-text posts | XSS and sanitization | 8, 11 |
| Search | Full-text search, GIN indexes | 16 |
| Cover images | Object storage, presigned URLs | 17 |
| A busy home page | Query plans, caching | 18 |

## 7. Draft data model (refined in step 10)

```
users
  id, email (unique), username (unique), passwordHash, createdAt

publications                      one user → many publications
  id, ownerId → users, name, slug (unique), description, createdAt

posts                             one publication → many posts
  id, publicationId → publications, authorId → users,
  title, subtitle, slug (unique per publication), body,
  status (draft | scheduled | published), visibility (free | paid),
  publishedAt, createdAt, updatedAt

subscriptions                     users ↔ publications (many-to-many)
  userId → users, publicationId → publications, tier (free | paid),
  status, createdAt
  unique (userId, publicationId)

comments                          one post → many comments
  id, postId → posts, userId → users,
  parentId → comments (null for top-level; set for replies),
  body, createdAt

likes                             users ↔ posts (many-to-many)
  userId → users, postId → posts, createdAt
  unique (userId, postId)
```

---

## 8. Reference: HTTP status codes we use

| Code | Meaning | Where |
|---|---|---|
| 200 | OK | reads, updates, login |
| 201 | Created | create post, register |
| 204 | No Content | deletes (from step 3d) |
| 400 | Bad request (malformed or invalid input) | Zod failures, "No data provided" |
| 401 | Not authenticated | login failures, missing token |
| 403 | Authenticated but not allowed | editing someone else's post (step 5) |
| 404 | Not found | missing post, unknown route |
| 409 | Conflict with existing data | email already registered |
| 429 | Too many requests | rate limits (steps 5 and 8) |
| 500 | Unexpected server error | produced by `errorHandler`, never thrown on purpose |

Shortcut: 2xx all good, 4xx the client's fault, 5xx the server's fault.

## 9. Glossary (concepts learned so far)

Add to this as each step lands.

| Term | Meaning |
|---|---|
| Middleware | A function in the request chain with `(req, res, next)`. It either responds or calls `next()`. |
| Error handler | Middleware with four parameters `(error, req, res, next)`. Express jumps to it when anything throws. |
| Controller | The last function in the chain for a route. Reads the request and sends the response. |
| Narrowing | TypeScript following an `if` or `throw` to know a value's type is more specific afterwards. |
| Generic (`<T>`) | Passing a type into something that needs one, like `Schema<IPost>`. |
| Union (`A \| B`) | A value that can be one of several types. |
| `unknown` | "Could be anything; check before using it." What `catch (error)` gives you. |
| Class / instance | A blueprint / one object built from it with `new`. |
| `extends` / `super` | Building a class on top of another / calling the parent's constructor. |
| Closure | An inner function that remembers variables from the outer function that created it. |
| Schema (Zod) | A description of what data must look like, checked at runtime. |
| `safeParse` | Zod check that returns `{ success, data or error }` instead of throwing. |
| Separation of concerns | Each layer has one job, so changing one job touches one layer. |
| Service | The layer for business rules. No `req`/`res`, no direct database calls. |
| Repository | The layer for database calls only. Returns what the database said, including `null`. |
| Business rule | A decision about how the app works that needs app state or who is asking ("post must exist", "email already taken"). |
| Pass-through | A function that only forwards a call to the next layer, because it has no rules yet. |
| `import * as x` | Import everything a file exports into one object, so calls read `x.create(...)`. |
| Structural typing | TypeScript accepts any object that has the required fields, whatever it is called. |

## 10. Known gaps (on purpose, for later)

- `:id` in URLs is not validated, so `/update/banana` returns a 500. (Step 4)
- Routes name actions (`/create`, `/update/:id`) instead of resources. (Step 3d)
- `logout` takes an unvalidated email and does nothing. (Step 5)
- The user service still relies on Mongoose's pre-save hook and `comparePassword`. (Step 4)
- `createPost` and `listPosts` in the post service are pass-throughs with no rules yet. (Steps 5 and 11)
- No tests yet. (Step 6)
- `express.json()` has no explicit size limit. (Step 8)
- `post` fields (`name`, `description`, `age`) are course placeholders. (Step 10)
