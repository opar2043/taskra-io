# API_CONTRACT.md — pixlo-backend endpoints used by taskra-client

Base URL: `import.meta.env.VITE_API_URL` (all routes at root, except emails at `/api/emails`).
Unless noted, writes return the **raw Mongo driver result** (`{acknowledged, insertedId|modifiedCount|deletedCount}`) — refetch after mutating. Reads return plain JSON docs/arrays.

## Users
- `POST /users` — create user `{name,email,role,location,...}` → `201 {success, message, result}`. Also sends welcome email.
- `GET /users` — all users, each enriched with `profileCompletion`, `profileCompletionMessage`.
- `GET /users/:id` — single by ObjectId.
- `PATCH /users/:id` — `:id` may be ObjectId **or email**. Partial update.
- `DELETE /users/:id`

## Jobs
- `POST /jobs` — create job `{title,category,price,location,eventDate,email,...}`; notifies all professionals.
- `GET /jobs` — all jobs + `clientVerified` / `clientVerifiedReason` (`"payment"|"contact"`).
- `GET /jobs/:id`, `PATCH /jobs/:id`, `DELETE /jobs/:id`

## Quotes (marketplace proposals)
- `POST /quote`, `GET /quote`, `GET /quote/:id`, `PATCH /quote/:id`, `DELETE /quote/:id`

## Inbox-quote (CRM pipeline cards)
- `POST /inbox-quote` — **returns the saved document**. `{clientId|clientEmail, projectName|requirement, status, ...}`
- `GET /inbox-quote`, `GET /inbox-quote/:id`, `DELETE /inbox-quote/:id`
- `PATCH /inbox-quote/:id` — on status change to `accepted|inprogress|complete|confirm` the backend auto-emails the client.

## Orders (payments/invoices)
- `POST /orders` — `{userEmail, userName, total, item:{_id, freelancerId, status,...}, status, category, createdAt...}`
- `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id`, `DELETE /orders/:id`

## Reviews
- `POST /reviews` (`{freelancerEmail, rating, ...}`), `GET /reviews`, `GET /reviews/:id`, `PATCH /reviews/:id`, `DELETE /reviews/:id`

## Saved freelancers / saved jobs
- `POST /save` — `{freelancerId, userEmail, ...}`; duplicate → `400 {message:"Already saved"}`.
- `GET /save` — ALL rows (filter client-side by `userEmail`). `DELETE /save/:id`.
- `POST /save-jobs` — `{userEmail, jobId, ...}` (no dedupe — check client-side).
- `GET /save-jobs` — ALL rows (filter client-side). `DELETE /save-jobs/:id` (accepts non-ObjectId ids too).

## Notifications
- `GET /notifications/:email` — latest 10, newest first.
- `PATCH /notifications/:email/mark-read`
- `GET /jobs/notifications/unread/:email` → `{count}`

## Stats
- `GET /dashboard-stats/:email` — role-aware aggregates:
  - admin: totalUsers, totalClients, totalFreelancers, newUsersToday, totalJobs, openJobs, pendingJobs, completedJobs, cancelledJobs, photographyJobs, videographyJobs, bothJobs, totalQuotes, totalOrders, confirmedOrders, pendingOrders, inprogressOrders, completedOrders, totalRevenue, todayRevenue, totalReviews, savedFreelancers, savedJobs, totalConversations, totalMessages
  - client: jobsPosted, openJobs, completedJobs, cancelledJobs, quotesReceived, totalOrders, inprogressProjects, completedProjects, totalSpent, savedFreelancers, savedJobs, conversations
  - professional: bidsSent, bidsToday, totalProjects, inprogressProjects, completedProjects, totalEarnings, todayEarnings, averageOrderValue, savedJobs, reviewsReceived, conversations, totalMessages, photoJobs, videoJobs
- `GET /calendar-activity/:email` → `{role, events:[{title,start,end}]}`

## Chat (HTTP is source of truth; sockets optional enhancement)
- `POST /conversations` — `{senderId, receiverId}` (user _id strings) → full conversation doc (get-or-create, has `memberDetails`).
- `GET /conversations/:userId` — newest-updated first.
- `GET /messages/:conversationId` — oldest first.
- `POST /messages` — `{conversationId, senderId, text}` → the new message doc.
- `PUT /messages/:id` — `{text}` edit. `PUT /messages/delete/:id` — soft delete.
- `DELETE /conversations/:id` — hard delete conversation + messages.
- Socket events — client emits: `joinConversation(conversationId)`, `sendMessage({conversationId,senderId,text})`, `editMessage({messageId,text})`, `deleteMessage({messageId,conversationId})`. Server emits: `receiveMessage(messageDoc)` (room), `messageEdited({messageId,text,updatedAt})` (global), `messageDeleted(messageId)` (room).

## Payments
- `POST /create-mollie-payment` — `{amount, orderData}` (amount in major units GBP) → `{checkoutUrl}`; redirect the browser there. Mollie redirects back to `${FRONTEND_URL}/payment-success?id=<orderData.item._id>`.
- `POST /create-payment-intent` — `{price}` → `{clientSecret}` (Stripe scaffolding, EUR).
- `POST /mollie-webhook` — backend-only.
- Flow: `POST /orders` first (status `confirmed`), then create Mollie payment, redirect to `checkoutUrl`.

## Questionnaires
- `POST /questionnaires` — `{freelancer_id, ...}`
- `GET /questionnaires/:freelancerId` — all for a professional, newest first.
- `GET /questionnaires/single/:id` — one (public fill page).
- `POST /questionnaires/submit/:id` — `{answers}`.

## CMS content (⚠️ updates use **PUT**, not PATCH)
- `GET|POST /faqs`, `PUT|DELETE /faqs/:id`
- `GET|POST /pricing`, `PUT|DELETE /pricing/:id` (list sorted by `priceMonthly` asc)
- `GET|POST /featured-creatives`, `PUT|DELETE /featured-creatives/:id` (sorted by `order`)
- `GET|POST /how-it-works`, `PUT|DELETE /how-it-works/:id` (sorted by `order`)

## Emails (`/api/emails`, respond with res.json)
- `POST /api/emails/send` — `{clientEmail*, clientName, subjectTemplate, bodyTemplate, freelancerEmail, freelancerName, studioName, projectName, projectType, jobData}` — substitutes `{{tokens}}`.
- `POST /api/emails/job-posted` — `{clientEmail*, clientName, jobData:{category,location,matchCount}}`
- `POST /api/emails/welcome` — `{clientEmail*, clientName, role}`

## Error shapes (inconsistent — handle defensively)
`{message}` or `{error}` or `{message, error}` or `{error, details}`; codes 400/404/422/500.
Read `err.response?.data?.message || err.response?.data?.error || "Something went wrong"`.
Invalid ObjectIds in `:id` params can 500 — always pass real ids.
