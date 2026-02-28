# Social Media App — Full-Stack Native Roadmap

## Tech Stack Decisions

### Server (`server/`)
- **Language:** Go
- **Router:** Chi
- **Database:** PostgreSQL (primary), Redis (cache + sessions + pub/sub)
- **ORM/Query:** sqlc (type-safe SQL generation)
- **Migrations:** golang-migrate
- **Auth:** JWT (access) + opaque refresh tokens stored in Redis
- **Media Storage:** MinIO (S3-compatible, self-hostable)
- **Real-time:** WebSockets via gorilla/websocket
- **Config:** godotenv + environment variables
- **Containerization:** Docker + docker-compose

### Client — Web (`client/web/`)
- Vanilla HTML5, CSS3, JavaScript (ES Modules, no frameworks)
- Bundler: esbuild for JS/CSS

### Client — Android (`client/mobile/android/`)
- Kotlin + Jetpack Compose
- Architecture: MVVM + Repository pattern
- Networking: Retrofit + OkHttp
- Local DB: Room
- DI: Hilt
- Image loading: Coil

### Client — iOS (`client/mobile/ios/`)
- Swift + SwiftUI
- Architecture: MVVM + Combine
- Networking: URLSession + async/await
- Local DB: Core Data
- Image loading: Kingfisher

### Client — Desktop Linux (`client/desktop/linux/`)
- C + GTK4
- Build: Meson

### Client — Desktop macOS (`client/desktop/macos/`)
- Swift + AppKit (NSWindow, not SwiftUI — native Cocoa)
- Build: Xcode project

### Client — Desktop Windows (`client/desktop/windows/`)
- C++ + Win32 API + WinUI 3 (Windows App SDK)
- Build: MSBuild / Visual Studio solution

---

## Phase 0: Repository & Infrastructure Setup

### 0.1 Root Scaffold
- [x] Create the top-level folder structure: `server/`, `client/web/`, `client/mobile/android/`, `client/mobile/ios/`, `client/desktop/linux/`, `client/desktop/macos/`, `client/desktop/windows/`.
- [x] Add root `.gitignore` covering Go, Kotlin, Swift, C, C++, and web build artifacts.
- [x] Add root `README.md` with project overview, folder map, and per-platform build instructions stub.
- [x] Add `docker-compose.yml` at root to orchestrate: `postgres`, `redis`, `minio`, and the `server` container.
- [x] Add `.env.example` at root documenting all required environment variables (DB URL, Redis URL, JWT secret, MinIO keys, etc.).

### 0.2 PostgreSQL Container Setup
- [x] Add `postgres` service to `docker-compose.yml` with a named volume for persistence, exposed only on localhost.
- [x] Configure `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` from `.env`.
- [x] Add a healthcheck using `pg_isready` so dependent services wait for DB readiness.

### 0.3 Redis Container Setup
- [x] Add `redis` service to `docker-compose.yml` with `redis:7-alpine` image.
- [x] Mount a `redis.conf` enabling persistence (`appendonly yes`).
- [x] Expose Redis only to the internal Docker network, not to host.

### 0.4 MinIO Container Setup
- [x] Add `minio` service to `docker-compose.yml` with `minio/minio:latest`.
- [x] Configure root user/password from `.env`.
- [x] Add a startup command to `docker-compose.yml` that creates the required bucket (`media`) using `mc` (MinIO client) after MinIO starts.

---

## Phase 1: Database Schema & Migrations

### 1.1 Migration Tooling
- [x] Initialize `golang-migrate` in `server/`. Add `Makefile` targets: `migrate-up`, `migrate-down`, `migrate-create name=<name>`.
- [x] Create `server/migrations/` directory with a `000001_init.up.sql` and `000001_init.down.sql`.

### 1.2 Users Table
- [x] Write migration for `users` table: `id` (UUID PK), `username` (unique), `email` (unique), `password_hash`, `display_name`, `bio`, `avatar_url`, `created_at`, `updated_at`.
- [x] Add indexes on `username` and `email`.

### 1.3 Posts Table
- [x] Write migration for `posts` table: `id` (UUID PK), `user_id` (FK → users), `content` (text, max 500 chars enforced by check constraint), `media_urls` (text array), `created_at`, `updated_at`, `deleted_at` (soft delete).
- [x] Add index on `user_id` and `created_at DESC` (for feed queries).

### 1.4 Follows Table
- [x] Write migration for `follows` table: `follower_id` (FK → users), `following_id` (FK → users), `created_at`. Composite PK on `(follower_id, following_id)`. Prevent self-follows via check constraint.

### 1.5 Likes Table
- [x] Write migration for `likes` table: `user_id` (FK → users), `post_id` (FK → posts), `created_at`. Composite PK on `(user_id, post_id)`.

### 1.6 Comments Table
- [x] Write migration for `comments` table: `id` (UUID PK), `post_id` (FK → posts), `user_id` (FK → users), `parent_id` (nullable FK → comments, for threading), `content`, `created_at`, `deleted_at`.

### 1.7 Notifications Table
- [x] Write migration for `notifications` table: `id` (UUID PK), `recipient_id` (FK → users), `actor_id` (FK → users), `type` (enum: like, comment, follow, mention), `entity_id` (UUID), `entity_type` (post/comment), `is_read` (bool), `created_at`.

### 1.8 Sessions / Refresh Tokens (Redis Schema)
- [x] Document (in `server/docs/redis-schema.md`) the Redis key patterns for: refresh tokens (`session:<token_hash>` → JSON with user_id + expiry), online presence (`presence:<user_id>` → timestamp), unread notification count (`notif_count:<user_id>` → integer).

---

## Phase 2: Server — Project Scaffold & Config

### 2.1 Go Module Init
- [x] Run `go mod init` for the server module inside `server/`.
- [x] Add dependencies: `chi`, `pgx/v5`, `redis/v9`, `golang-jwt/jwt/v5`, `gorilla/websocket`, `minio-go/v7`, `godotenv`, `golang-migrate`, `testify`.
- [x] Create `server/Makefile` with targets: `build`, `run`, `test`, `lint`, `migrate-up`, `migrate-down`.

### 2.2 Configuration Loader [Agent 8 Completed]
- [x] Create `server/internal/config/config.go` that reads all env vars into a typed `Config` struct (DB DSN, Redis URL, JWT secret, MinIO endpoint/keys, port). Fail fast on missing required fields.

### 2.3 Server Bootstrap
- [ ] Create `server/cmd/api/main.go` that: loads config, initializes DB pool (pgx), connects to Redis, connects to MinIO, registers routes, starts HTTP server with graceful shutdown on SIGINT/SIGTERM.

### 2.4 Database Layer Scaffold
- [ ] Create `server/internal/db/` directory. Add `server/sqlc.yaml` config pointing to `migrations/` for schema and `internal/db/` for generated code.
- [ ] Add `make sqlc-generate` target to `Makefile`.

### 2.5 Middleware Stack
- [ ] Implement `RequestID` middleware: attaches a UUID to each request context and response header `X-Request-ID`.
- [ ] Implement `Logger` middleware: logs method, path, status, latency, and request ID using Go's `slog`.
- [ ] Implement `Recoverer` middleware: catches panics, logs stack trace, returns 500.
- [ ] Implement `CORS` middleware: configurable allowed origins from env var.

---

## Phase 3: Server — Authentication

### 3.1 Password Hashing
- [ ] Implement `server/internal/auth/password.go` with `HashPassword(plain string) (string, error)` and `CheckPassword(plain, hash string) bool` using bcrypt (cost 12).

### 3.2 JWT Utilities
- [ ] Implement `server/internal/auth/jwt.go` with `GenerateAccessToken(userID string) (string, error)` (15-min expiry) and `ValidateAccessToken(token string) (userID string, error)`. Use RS256 with keys loaded from env.

### 3.3 Refresh Token Logic
- [ ] Implement `server/internal/auth/refresh.go`: `CreateRefreshToken(ctx, userID)` stores a cryptographically random token hash in Redis with 30-day TTL. `RotateRefreshToken(ctx, token)` validates, deletes old, issues new (token rotation).

### 3.4 Auth Middleware
- [ ] Implement `server/internal/middleware/auth.go`: extracts Bearer token from `Authorization` header, validates JWT, attaches `userID` to request context. Returns 401 on failure.

### 3.5 Register Endpoint
- [ ] Implement `POST /api/v1/auth/register`: validate input (username 3-20 chars alphanumeric, email format, password min 8 chars), check uniqueness, hash password, insert user, return user object (no password hash).

### 3.6 Login Endpoint
- [ ] Implement `POST /api/v1/auth/login`: look up user by email, verify password, issue access token + refresh token, set refresh token in `HttpOnly Secure SameSite=Strict` cookie, return access token in body.

### 3.7 Refresh Endpoint
- [ ] Implement `POST /api/v1/auth/refresh`: read refresh token from cookie, rotate it, return new access token.

### 3.8 Logout Endpoint
- [ ] Implement `POST /api/v1/auth/logout` (requires auth middleware): delete refresh token from Redis, clear cookie.

---

## Phase 4: Server — User Endpoints

### 4.1 sqlc Queries — Users
- [ ] Write sqlc query file `server/internal/db/queries/users.sql` with: `GetUserByID`, `GetUserByUsername`, `UpdateUser` (display_name, bio, avatar_url), `SearchUsers` (ILIKE on username/display_name with limit/offset).
- [ ] Run `sqlc generate` and verify generated Go code compiles.

### 4.2 Get Profile Endpoint
- [ ] Implement `GET /api/v1/users/{username}`: return public profile (no email), follower count, following count, post count. Include `is_following` bool if request is authenticated.

### 4.3 Update Profile Endpoint
- [ ] Implement `PATCH /api/v1/users/me` (auth required): accept JSON body with optional `display_name`, `bio`. Validate lengths. Update DB. Return updated user.

### 4.4 Upload Avatar Endpoint
- [ ] Implement `POST /api/v1/users/me/avatar` (auth required): accept `multipart/form-data`, validate file is JPEG/PNG, max 5MB. Upload to MinIO under `avatars/<user_id>/<uuid>.<ext>`. Update `avatar_url` in DB. Return new URL.

### 4.5 Search Users Endpoint
- [ ] Implement `GET /api/v1/users/search?q=<query>&page=<n>`: paginated user search, return array of user summaries.

---

## Phase 5: Server — Follow System

### 5.1 sqlc Queries — Follows
- [ ] Write sqlc queries: `FollowUser`, `UnfollowUser`, `GetFollowers(userID, limit, offset)`, `GetFollowing(userID, limit, offset)`, `IsFollowing(followerID, followingID)`, `GetFollowerCount`, `GetFollowingCount`.

### 5.2 Follow / Unfollow Endpoints
- [ ] Implement `POST /api/v1/users/{username}/follow` (auth required): insert follow row, create notification for the followed user, return 204.
- [ ] Implement `DELETE /api/v1/users/{username}/follow` (auth required): delete follow row, return 204.

### 5.3 Followers / Following List Endpoints
- [ ] Implement `GET /api/v1/users/{username}/followers?page=<n>`: paginated list of followers with `is_following` field relative to authed user.
- [ ] Implement `GET /api/v1/users/{username}/following?page=<n>`: paginated list of accounts the user follows.

---

## Phase 6: Server — Posts

### 6.1 sqlc Queries — Posts
- [ ] Write sqlc queries: `CreatePost`, `GetPostByID` (with author join), `DeletePost` (soft delete), `GetPostsByUser(userID, limit, offset)`, `GetFeedForUser(userID, limit, offset)` (posts from followed users ordered by `created_at DESC`), `GetLikeCount`, `GetCommentCount`, `IsLikedByUser`.

### 6.2 Create Post Endpoint
- [ ] Implement `POST /api/v1/posts` (auth required): accept JSON `{content, media_urls[]}`. Validate content not empty, max 500 chars, max 4 media URLs. Insert post. Return created post object.

### 6.3 Upload Post Media Endpoint
- [ ] Implement `POST /api/v1/posts/media` (auth required): accept up to 4 files as `multipart/form-data`. Validate each is JPEG/PNG/GIF/MP4, max 50MB each. Upload to MinIO under `posts/<user_id>/<uuid>.<ext>`. Return array of media URLs to use in create-post request.

### 6.4 Get Post Endpoint
- [ ] Implement `GET /api/v1/posts/{postID}`: return post with author summary, like count, comment count, `is_liked` bool if authed.

### 6.5 Delete Post Endpoint
- [ ] Implement `DELETE /api/v1/posts/{postID}` (auth required): verify requester owns post, soft-delete. Return 204.

### 6.6 User Posts Endpoint
- [ ] Implement `GET /api/v1/users/{username}/posts?page=<n>`: paginated posts by user, newest first.

### 6.7 Feed Endpoint
- [ ] Implement `GET /api/v1/feed?cursor=<created_at_ISO>` (auth required): cursor-based paginated feed of posts from followed users. Use cursor instead of offset for stable pagination.

---

## Phase 7: Server — Likes & Comments

### 7.1 sqlc Queries — Likes
- [ ] Write sqlc queries: `LikePost`, `UnlikePost`, `GetLikesForPost(postID, limit, offset)`.

### 7.2 Like / Unlike Endpoints
- [ ] Implement `POST /api/v1/posts/{postID}/like` (auth required): insert like, create notification if not own post. Return 204.
- [ ] Implement `DELETE /api/v1/posts/{postID}/like` (auth required): delete like row. Return 204.

### 7.3 sqlc Queries — Comments
- [ ] Write sqlc queries: `CreateComment`, `GetCommentsForPost(postID, limit, offset)` (top-level only), `GetRepliesForComment(commentID, limit, offset)`, `DeleteComment`.

### 7.4 Comment Endpoints
- [ ] Implement `POST /api/v1/posts/{postID}/comments` (auth required): accept `{content, parent_id?}`. Max 300 chars. Insert comment, create notification. Return created comment.
- [ ] Implement `GET /api/v1/posts/{postID}/comments?page=<n>`: paginated top-level comments with reply count.
- [ ] Implement `GET /api/v1/comments/{commentID}/replies?page=<n>`: paginated replies to a comment.
- [ ] Implement `DELETE /api/v1/comments/{commentID}` (auth required): verify ownership, soft-delete. Return 204.

---

## Phase 8: Server — Notifications

### 8.1 sqlc Queries — Notifications
- [ ] Write sqlc queries: `CreateNotification`, `GetNotificationsForUser(userID, limit, offset)`, `MarkNotificationRead(id, userID)`, `MarkAllRead(userID)`, `GetUnreadCount(userID)`.

### 8.2 Notification Endpoints
- [ ] Implement `GET /api/v1/notifications?page=<n>` (auth required): paginated notifications, newest first, with actor user summary and entity preview.
- [ ] Implement `PATCH /api/v1/notifications/{id}/read` (auth required): mark single notification read.
- [ ] Implement `PATCH /api/v1/notifications/read-all` (auth required): mark all as read, reset Redis unread counter.
- [ ] Implement `GET /api/v1/notifications/unread-count` (auth required): return count from Redis (fallback to DB).

---

## Phase 9: Server — Real-Time (WebSockets)

### 9.1 WebSocket Hub
- [ ] Implement `server/internal/realtime/hub.go`: a Hub struct with a map of `userID → []*Client`. Methods: `Register(client)`, `Unregister(client)`, `BroadcastToUser(userID, message)`. Run in a goroutine using channel-based communication (no mutex on the map).

### 9.2 WebSocket Client
- [ ] Implement `server/internal/realtime/client.go`: a Client struct wrapping a `*websocket.Conn`. Has a buffered send channel. `writePump` drains send channel to WebSocket. `readPump` reads messages (only pong/ping control frames expected from client). Cleans up on disconnect.

### 9.3 WebSocket Endpoint
- [ ] Implement `GET /api/v1/ws` (auth required via query param token fallback for WS): upgrade to WebSocket, register client in hub, set presence key in Redis with 5-min TTL, refresh TTL on each ping.

### 9.4 Redis Pub/Sub Bridge
- [ ] Implement `server/internal/realtime/pubsub.go`: subscribe to a Redis channel `notifications:<userID>`. When a message arrives, look up the user's connected Client in the Hub and push it. Used so horizontal server scaling works (each server subscribes per connected user).

### 9.5 Emit Notifications via Pub/Sub
- [ ] Update all notification-creating endpoints (like, comment, follow) to also publish the notification JSON to `notifications:<recipient_id>` Redis channel after DB insert.

---

## Phase 10: Server — Testing

### 10.1 Test Infrastructure
- [ ] Create `server/internal/testutil/db.go`: helper that spins up a real PostgreSQL connection (from `TEST_DB_URL` env), runs all migrations up, returns a connection, and defers dropping all tables in cleanup.
- [ ] Create `server/internal/testutil/server.go`: helper that creates a fully wired `httptest.Server` for integration tests.

### 10.2 Auth Handler Tests
- [ ] Write integration tests for register, login, refresh, logout covering: happy path, duplicate username, weak password, wrong password, expired token.

### 10.3 Post Handler Tests
- [ ] Write integration tests for create post, get post, delete post, feed. Verify auth enforcement on protected routes.

### 10.4 Follow & Notification Tests
- [ ] Write integration tests for follow/unfollow, follower list, notification creation on follow and like events.

---

## Phase 11: Web Client Scaffold (`client/web/`)

### 11.1 Project Structure
- [ ] Create `client/web/` with: `index.html`, `src/` (JS modules), `styles/` (CSS), `public/` (static assets). Add `package.json` with `esbuild` as dev dependency. Add `build` and `dev` npm scripts.

### 11.2 CSS Foundation
- [ ] Create `styles/reset.css`: modern CSS reset (box-sizing, margin, padding, font inherit).
- [ ] Create `styles/variables.css`: CSS custom properties for color palette (light + dark theme), spacing scale, border-radius, font sizes, shadows.
- [ ] Create `styles/base.css`: body font, link styles, focus ring, scrollbar styling.
- [ ] Create `styles/layout.css`: main app shell layout (sidebar + feed + right panel, using CSS Grid).

### 11.3 Router
- [ ] Implement `src/router.js`: a client-side hash router. Maps `#/login`, `#/register`, `#/feed`, `#/profile/:username`, `#/post/:id` to view functions. Calls `history.pushState`-based navigation with fallback.

### 11.4 API Client
- [ ] Implement `src/api/client.js`: a base fetch wrapper that attaches `Authorization: Bearer <token>`, handles 401 by attempting token refresh then retrying, and throws typed errors for non-2xx responses.
- [ ] Implement `src/api/auth.js`: `register(data)`, `login(data)`, `logout()`, `refresh()`.
- [ ] Implement `src/api/users.js`: `getProfile(username)`, `updateProfile(data)`, `uploadAvatar(file)`, `follow(username)`, `unfollow(username)`, `getFollowers(username, page)`, `getFollowing(username, page)`, `searchUsers(q, page)`.
- [ ] Implement `src/api/posts.js`: `createPost(data)`, `uploadMedia(files)`, `getPost(id)`, `deletePost(id)`, `getFeed(cursor)`, `getUserPosts(username, page)`, `likePost(id)`, `unlikePost(id)`.
- [ ] Implement `src/api/comments.js`: `getComments(postId, page)`, `getReplies(commentId, page)`, `createComment(postId, data)`, `deleteComment(id)`.
- [ ] Implement `src/api/notifications.js`: `getNotifications(page)`, `getUnreadCount()`, `markRead(id)`, `markAllRead()`.

### 11.5 Auth State
- [ ] Implement `src/store/auth.js`: module that stores access token in memory (never localStorage), persists login state via a `GET /api/v1/auth/refresh` on page load, exposes `getUser()`, `isAuthenticated()`, `setToken(token)`, `clearToken()`.

---

## Phase 12: Web Client — Views

### 12.1 Login & Register Views
- [ ] Implement `src/views/login.js`: renders login form, calls `api/auth.login`, stores token, redirects to `#/feed`. Show inline validation errors.
- [ ] Implement `src/views/register.js`: renders registration form with client-side validation matching server rules, calls `api/auth.register`, auto-logs-in on success.

### 12.2 Feed View
- [ ] Implement `src/views/feed.js`: fetches paginated feed, renders post cards, supports infinite scroll (IntersectionObserver on last card triggers next cursor fetch), shows empty state.
- [ ] Implement `src/components/post-card.js`: renders a post with author avatar, display name, timestamp (relative, e.g. "3h ago"), content, media grid, like button with count, comment count, and delete button (own posts only).

### 12.3 Compose Post
- [ ] Implement `src/components/compose.js`: textarea (500 char limit with live counter), media upload (drag-and-drop + click, preview thumbnails, remove button), submit calls `uploadMedia` then `createPost`. Disable submit while uploading.

### 12.4 Post Detail View
- [ ] Implement `src/views/post.js`: shows full post, then comment thread. Comments load paginated. Each comment shows reply button which expands inline reply composer. Supports nested reply display (1 level deep displayed, rest collapsed).

### 12.5 Profile View
- [ ] Implement `src/views/profile.js`: shows user header (avatar, display name, bio, follower/following counts, follow button). Tabs for Posts. Loads user's posts in a grid. Edit profile button (own profile) opens modal.
- [ ] Implement `src/components/edit-profile-modal.js`: form to update display_name, bio, and avatar (with preview). Submits PATCH then avatar upload if changed.

### 12.6 Notifications View
- [ ] Implement `src/views/notifications.js`: grouped notification list (Today, Earlier). Each notification links to the relevant post/profile. Mark-all-read button.

### 12.7 WebSocket Integration
- [ ] Implement `src/realtime/ws.js`: connects to `/api/v1/ws`, auto-reconnects with exponential backoff (1s, 2s, 4s, max 30s). Dispatches incoming notification messages to a global event bus.
- [ ] Update notification bell icon in nav to subscribe to the event bus and increment the badge count on new notification events.

---

## Phase 13: Android Client (`client/mobile/android/`)

### 13.1 Project Scaffold
- [ ] Initialize Android project in `client/mobile/android/` with Kotlin, minimum SDK 26, target SDK 35. Enable Compose in `build.gradle.kts`. Add dependencies: Hilt, Retrofit, OkHttp, Room, Coil, Compose Navigation, Lifecycle ViewModel, Kotlin Coroutines.

### 13.2 Network Layer
- [ ] Create `data/network/ApiService.kt`: Retrofit interface defining all API endpoints matching server routes. Use suspend functions.
- [ ] Create `data/network/AuthInterceptor.kt`: OkHttp interceptor that adds `Authorization` header from `TokenStore`. On 401, attempts token refresh and retries original request once.
- [ ] Create `data/network/NetworkModule.kt`: Hilt module providing `OkHttpClient`, `Retrofit`, and `ApiService` singletons.

### 13.3 Token Store
- [ ] Create `data/local/TokenStore.kt`: stores access token in `EncryptedSharedPreferences` (Jetpack Security). Provides `getToken()`, `saveToken(token)`, `clear()`.

### 13.4 Room Database
- [ ] Define Room entities: `UserEntity`, `PostEntity`, `NotificationEntity`.
- [ ] Define DAOs: `UserDao` (upsert, getByUsername), `PostDao` (upsert, getByUser, getAll ordered by createdAt), `NotificationDao` (upsert, getAll, markRead).
- [ ] Create `AppDatabase.kt` with Hilt provision.

### 13.5 Repository Layer
- [ ] Implement `AuthRepository.kt`: login, register, logout, refresh. Saves token to `TokenStore` on success.
- [ ] Implement `UserRepository.kt`: getProfile, updateProfile, uploadAvatar, follow, unfollow, searchUsers. Caches in Room.
- [ ] Implement `PostRepository.kt`: createPost, uploadMedia, deletePost, getFeed (returns `Flow<PagingData<Post>>` using Paging 3), getUserPosts, likePost, unlikePost.
- [ ] Implement `CommentRepository.kt`: getComments (Paging 3), createComment, deleteComment.
- [ ] Implement `NotificationRepository.kt`: getNotifications (Paging 3), markRead, markAllRead, getUnreadCount.

### 13.6 Auth Screens
- [ ] Implement `LoginScreen.kt` (Compose): email + password fields, login button, navigate to Feed on success. Error snackbar.
- [ ] Implement `RegisterScreen.kt` (Compose): username, email, password, confirm password. Client-side validation with Compose state. Navigate to Feed on success.

### 13.7 Feed Screen
- [ ] Implement `FeedViewModel.kt`: exposes `PagingData<Post>` flow from `PostRepository`.
- [ ] Implement `FeedScreen.kt` (Compose): `LazyColumn` with `collectAsLazyPagingItems()`. Each item is a `PostCard` composable. Pull-to-refresh via `SwipeRefresh`. FAB to compose new post.

### 13.8 Post Card Composable
- [ ] Implement `PostCard.kt` composable: author row (Coil `AsyncImage` avatar, display name, username, relative timestamp), content text, media grid (up to 4 images in adaptive grid using `AsyncImage`), like button (animated heart), comment count, options menu (delete own post).

### 13.9 Compose Post Screen
- [ ] Implement `ComposePostScreen.kt`: TextField (500 char limit, live counter), photo picker (up to 4 images via `ActivityResultContracts.PickMultipleVisualMedia`), image previews with remove button, submit button disabled while uploading.

### 13.10 Profile Screen
- [ ] Implement `ProfileViewModel.kt`: loads user profile + posts. Handles follow/unfollow optimistic updates.
- [ ] Implement `ProfileScreen.kt`: sticky header with avatar, bio, follower/following tappable counts (navigate to list). Tabbed content area for Posts grid. Edit profile button on own profile.

### 13.11 Notifications Screen
- [ ] Implement `NotificationsScreen.kt` (Compose): `LazyColumn` of notification items, each showing actor avatar, action description, entity preview. Swipe-to-dismiss to mark read.

### 13.12 WebSocket Real-Time
- [ ] Implement `RealtimeManager.kt`: singleton (Hilt) that opens a WebSocket connection via OkHttp. Reconnects with exponential backoff. Emits events via a `SharedFlow`. Connect on login, disconnect on logout.
- [ ] Observe `RealtimeManager` in `MainViewModel.kt` and update notification badge count in the bottom nav bar.

### 13.13 Navigation
- [ ] Implement `AppNavGraph.kt` with Compose Navigation: define routes for Login, Register, Feed, PostDetail, Profile, ComposePost, Notifications. Handle deep links for post and profile routes.

---

## Phase 14: iOS Client (`client/mobile/ios/`)

### 14.1 Project Scaffold
- [ ] Initialize Xcode project `SocialApp.xcodeproj` in `client/mobile/ios/`. Target iOS 17+. Use Swift 5.10. Add Swift Package dependencies: Kingfisher, and any needed (avoid heavy frameworks, prefer URLSession + Combine).

### 14.2 Network Layer
- [ ] Create `Network/APIClient.swift`: async/await based HTTP client using `URLSession`. Attaches JWT header, handles 401 by calling refresh token endpoint and retrying, decodes JSON responses into typed structs via `Codable`.
- [ ] Create `Network/Endpoints.swift`: enum of all API endpoints with URL, method, and body encoding.

### 14.3 Keychain Token Store
- [ ] Create `Storage/KeychainTokenStore.swift`: stores and retrieves access token from Keychain using `SecItemAdd`/`SecItemCopyMatching`. Thread-safe. Methods: `save(token:)`, `retrieve() -> String?`, `delete()`.

### 14.4 Core Data Stack
- [ ] Create `Storage/CoreDataStack.swift`: `NSPersistentContainer` setup with background context for writes, view context for reads.
- [ ] Define Core Data model `SocialApp.xcdatamodeld` with entities: `CDUser`, `CDPost`, `CDNotification`.

### 14.5 Repository Layer
- [ ] Implement `AuthRepository.swift`: login, register, logout, refresh. Persists token to Keychain.
- [ ] Implement `UserRepository.swift`: getProfile, updateProfile, uploadAvatar (multipart), follow/unfollow. Caches to Core Data.
- [ ] Implement `PostRepository.swift`: createPost, uploadMedia, getFeed (cursor pagination), getUserPosts, likePost/unlikePost.
- [ ] Implement `CommentRepository.swift`: getComments, createComment, deleteComment.
- [ ] Implement `NotificationRepository.swift`: getNotifications, markRead, markAllRead, unreadCount.

### 14.6 Auth Views
- [ ] Implement `LoginView.swift` (SwiftUI): email + password fields, login button calling `AuthRepository`. Navigate to feed via `@EnvironmentObject` auth state.
- [ ] Implement `RegisterView.swift` (SwiftUI): username, email, password, confirm. Inline validation.

### 14.7 Feed View
- [ ] Implement `FeedViewModel.swift` (`@MainActor ObservableObject`): paginated post feed using `AsyncStream` for cursor-based loading.
- [ ] Implement `FeedView.swift` (SwiftUI): `List` or `ScrollView + LazyVStack` of `PostCardView`. Pull-to-refresh via `.refreshable {}`.

### 14.8 Post Card View
- [ ] Implement `PostCardView.swift`: author header (`KFImage` avatar, name, timestamp via `RelativeDateTimeFormatter`), content text, media grid (`LazyVGrid` of `KFImage`), like button with animation, comment count.

### 14.9 Compose Post View
- [ ] Implement `ComposePostView.swift`: `TextEditor` (500 char limit with overlay counter), `PhotosPicker` (up to 4 items, `PhotosUI` framework), image previews, upload + create flow.

### 14.10 Profile View
- [ ] Implement `ProfileViewModel.swift`: loads user, posts, handles follow optimistic state.
- [ ] Implement `ProfileView.swift`: scrollable header with avatar (`KFImage`), stats row (posts, followers, following as tappable), bio, follow/edit button. Grid of post thumbnails below using `LazyVGrid`.

### 14.11 Notifications View
- [ ] Implement `NotificationsView.swift`: `List` of `NotificationRowView`. Swipe actions to mark read.

### 14.12 WebSocket Manager
- [ ] Implement `RealtimeManager.swift` (`@MainActor` singleton): `URLSessionWebSocketTask`-based connection. Auto-reconnects. Publishes events via `PassthroughSubject`. Connect on login, disconnect on logout.
- [ ] Observe in root view to increment notification badge.

### 14.13 App Navigation
- [ ] Implement `AppRouter.swift` using `NavigationStack` + `NavigationPath`. Define routes as enum cases. Root uses `TabView` with tabs: Feed, Search, Compose, Notifications, Profile.

---

## Phase 15: Desktop Linux Client (`client/desktop/linux/`)

### 15.1 Project Scaffold
- [ ] Create `client/desktop/linux/meson.build`: define executable target `socialapp`, add `gtk4` pkg-config dependency, set C standard to C11, enable compiler warnings.
- [ ] Create `main.c` entry point that calls `gtk_init()` and starts the GLib main loop.

### 15.2 Application Window
- [ ] Implement `window.c/h`: creates a `GtkApplicationWindow` with title and default size (1200x750). Sets up a `GtkPaned` (horizontal) for sidebar + content area.

### 15.3 HTTP Client Wrapper
- [ ] Implement `http_client.c/h`: wrapper around `libsoup-3.0` for async HTTP requests. Provides `http_get(url, headers, callback)`, `http_post(url, headers, body, callback)`, `http_delete(url, headers, callback)`. Add `libsoup-3.0` to `meson.build`.

### 15.4 Token Storage
- [ ] Implement `token_store.c/h`: reads/writes access token to a file in `$XDG_DATA_HOME/socialapp/token` (mode 0600). Functions: `token_store_get()`, `token_store_save(token)`, `token_store_clear()`.

### 15.5 Auth Screen
- [ ] Implement `auth_screen.c/h`: `GtkBox`-based login/register form using `GtkEntry`, `GtkButton`, `GtkLabel` for errors. On successful login, emits a custom GObject signal `authenticated` with the access token.

### 15.6 Feed Panel
- [ ] Implement `feed_panel.c/h`: a `GtkScrolledWindow` containing a `GtkListBox`. Loads feed via `http_client`. Each row is a `GtkBox` showing author label, post content label, timestamp label, like button (`GtkButton` with count), comment count label.

### 15.7 Post Composer Dialog
- [ ] Implement `compose_dialog.c/h`: a `GtkDialog` with a `GtkTextView` (500 char limit via `insert-text` signal), a `GtkButton` to attach images (opens `GtkFileChooserDialog`), image preview area, and submit button.

### 15.8 Profile Panel
- [ ] Implement `profile_panel.c/h`: displays avatar (loaded asynchronously via `GdkPixbuf` + `libsoup`), display name, bio, follower/following counts, follow button, and a `GtkFlowBox` grid of post thumbnails.

### 15.9 Notifications Panel
- [ ] Implement `notifications_panel.c/h`: `GtkListBox` of notification rows. Each row shows actor name, action string, and timestamp. Mark-all-read button.

### 15.10 WebSocket Connection
- [ ] Implement `realtime.c/h`: WebSocket client using `libsoup-3.0`'s `SoupWebsocketConnection`. On new notification message, emits a GObject signal `notification-received`. Auto-reconnects using `g_timeout_add`.

### 15.11 Navigation
- [ ] Implement `sidebar.c/h`: a `GtkListBox` with icon+label rows for Feed, Notifications, Profile, Compose. Changing selection swaps the content panel using `GtkStack`.

---

## Phase 16: Desktop macOS Client (`client/desktop/macos/`)

### 16.1 Project Scaffold
- [ ] Create `client/desktop/macos/SocialApp.xcodeproj` targeting macOS 13+. Language: Swift 5.10. UI framework: AppKit (no SwiftUI). Add Kingfisher via SPM for image loading.

### 16.2 Application Delegate & Main Window
- [ ] Implement `AppDelegate.swift`: creates `NSWindow` (1200×750, resizable, titled), sets `windowController`. Implements `applicationShouldTerminateAfterLastWindowClosed` → true.
- [ ] Implement `MainWindowController.swift`: owns the window, manages navigation between `NSViewController` subclasses.

### 16.3 HTTP Client
- [ ] Implement `Network/APIClient.swift`: same pattern as iOS — `URLSession` async/await, typed `Codable` responses, JWT attachment, 401 → refresh retry.

### 16.4 Keychain Token Store
- [ ] Implement `Storage/KeychainTokenStore.swift` using macOS Security framework. Same interface as iOS version.

### 16.5 Auth View Controller
- [ ] Implement `AuthViewController.swift` (`NSViewController`): programmatic `NSTextField` for email/password (NSSecureTextField), `NSButton` for login/register, `NSTextField` for error display. On success, notifies `MainWindowController` via delegation.

### 16.6 Feed View Controller
- [ ] Implement `FeedViewController.swift`: uses `NSTableView` with a custom `NSTableCellView` subclass (`PostCellView`) for each post. Loads data source from API. Implements `NSTableViewDelegate` and `NSTableViewDataSource`. Infinite scroll via `scrollViewDidScroll` detecting approach to bottom.

### 16.7 Post Cell View
- [ ] Implement `PostCellView.swift` (`NSTableCellView`): programmatic layout with `NSImageView` (avatar via Kingfisher), `NSTextField` (author, content, timestamp), `NSButton` (like with count), `NSTextField` (comment count).

### 16.8 Compose Post Window
- [ ] Implement `ComposeWindowController.swift`: separate `NSPanel` (floating). Contains `NSTextView` (500 char limit via `textView(_:shouldChangeTextIn:replacementString:)`), drag-and-drop for images onto `NSImageView` preview area, `NSButton` to submit.

### 16.9 Profile View Controller
- [ ] Implement `ProfileViewController.swift`: top section with `NSImageView` (avatar), `NSTextField` (name, bio), `NSButton` (follow/edit), `NSCollectionView` grid of post thumbnails below.

### 16.10 Notifications View Controller
- [ ] Implement `NotificationsViewController.swift`: `NSTableView` of notification rows with actor name, description, timestamp. Mark-all-read via toolbar button.

### 16.11 WebSocket Manager
- [ ] Implement `RealtimeManager.swift`: `URLSessionWebSocketTask` on macOS. Reconnection logic. Posts `NSNotification` to `NotificationCenter` on new notification received.

### 16.12 Split View Navigation
- [ ] Implement `NSSplitViewController` as root. Left sidebar (`NSSplitViewItem`): `NSOutlineView` or `NSTableView` with Feed, Notifications, Profile items. Right content (`NSSplitViewItem`): `NSTabView` swapped programmatically on sidebar selection.

---

## Phase 17: Desktop Windows Client (`client/desktop/windows/`)

### 17.1 Project Scaffold
- [ ] Create `client/desktop/windows/SocialApp.sln` and `SocialApp.vcxproj`. Target Windows 11, Windows App SDK 1.5, WinUI 3. Language: C++20. Enable `/W4`, `/WX`.

### 17.2 Application Entry Point
- [ ] Implement `Main.cpp`: `wWinMain` entry point. Initialize Windows App SDK (`Bootstrap::Initialize`). Create `App` and `MainWindow`.

### 17.3 Main Window
- [ ] Implement `MainWindow.xaml` + `MainWindow.xaml.cpp`: `NavigationView` control (left sidebar) with items: Feed, Notifications, Profile. `Frame` for content area. Handles `NavigationView::SelectionChanged` to navigate the Frame.

### 17.4 HTTP Client
- [ ] Implement `Network/HttpClient.h/.cpp`: `IXmlHttpRequest2`-based or `winrt::Windows::Web::Http::HttpClient`-based async HTTP. Wraps with coroutines (`winrt::fire_and_forget` and `winrt::Windows::Foundation::IAsyncOperation<T>`). Handles JWT header injection and 401 retry.

### 17.5 Token Storage
- [ ] Implement `Storage/TokenStore.h/.cpp`: stores access token using `Windows::Security::Credentials::PasswordVault`. Methods: `Save(token)`, `Retrieve() -> std::wstring`, `Clear()`.

### 17.6 Auth Page
- [ ] Implement `AuthPage.xaml` + `AuthPage.xaml.cpp`: WinUI 3 `TextBox` for email, `PasswordBox` for password, `Button` for login/register, `TextBlock` for errors. Navigate to `FeedPage` on success via `Frame.Navigate`.

### 17.7 Feed Page
- [ ] Implement `FeedPage.xaml` + `FeedPage.xaml.cpp`: `ListView` bound to `IObservableVector<PostViewModel>`. `PostViewModel` exposes properties for data binding. `ScrollViewer` scroll event triggers next page load. `AppBarButton` for compose.

### 17.8 Post Item Template
- [ ] Implement `PostItemTemplate.xaml` as a `DataTemplate`: `PersonPicture` (avatar), `TextBlock` (author, content, timestamp), `Button` (like, with `Flyout` for error feedback), `TextBlock` (comment count).

### 17.9 Compose Post Dialog
- [ ] Implement `ComposeDialog.xaml` + `ComposeDialog.xaml.cpp`: `ContentDialog` with `RichEditBox` (500 char limit via `TextChanged`), `Button` to add photos (`FileOpenPicker`, multi-select images), `Image` previews in a `WrapPanel`, `Button` to submit.

### 17.10 Profile Page
- [ ] Implement `ProfilePage.xaml` + `ProfilePage.xaml.cpp`: `PersonPicture` + name + bio + stats `StackPanel`. `GridView` of post thumbnails below. Follow / Edit Profile `Button` conditional on identity.

### 17.11 Notifications Page
- [ ] Implement `NotificationsPage.xaml` + `NotificationsPage.xaml.cpp`: `ListView` of notification items. `SwipeControl` on each item for mark-as-read. `AppBarButton` for mark-all-read.

### 17.12 WebSocket Manager
- [ ] Implement `Network/RealtimeManager.h/.cpp`: `Windows::Networking::Sockets::MessageWebSocket` for WebSocket connection. Reconnect on close using `ThreadPoolTimer`. Raise a C++/WinRT event `NotificationReceived` which pages subscribe to.

---

## Phase 18: End-to-End Integration Testing

### 18.1 Server Smoke Tests
- [ ] Write a shell script `tests/e2e/smoke.sh` that: registers a user, logs in, creates a post, likes the post, comments, follows another user, checks the feed includes the followed user's post. Uses `curl` + `jq`. Exit 0 on pass, 1 on failure.

### 18.2 Web Client E2E Tests
- [ ] Set up Playwright in `client/web/tests/`. Write tests for: login flow, post creation, feed loading, like toggle, profile view, follow/unfollow.

### 18.3 Docker Compose Test Environment
- [ ] Add a `docker-compose.test.yml` that starts postgres, redis, minio, and the server with `TEST_MODE=true`. Add a `make e2e` target that runs this compose, waits for health checks, runs `smoke.sh`, and tears down.

---

## Phase 19: Deployment Preparation

### 19.1 Server Dockerfile
- [ ] Write `server/Dockerfile`: multi-stage build. Stage 1: Go builder image, `go build` the binary. Stage 2: `gcr.io/distroless/base` image, copy binary. Expose port 8080. Non-root user.

### 19.2 Production docker-compose
- [ ] Add `docker-compose.prod.yml` overriding dev compose: no exposed postgres/redis ports, server behind a reverse proxy service (Caddy), TLS via Caddy's automatic HTTPS, env vars loaded from `.env.prod`.

### 19.3 Database Backup Script
- [ ] Write `scripts/backup-db.sh`: runs `pg_dump` inside the postgres container, gzip compresses, uploads to MinIO `backups/` bucket with timestamp filename. Designed to be run as a cron job.

### 19.4 Android Release Build
- [ ] Configure `client/mobile/android/build.gradle.kts` with `release` build type: minify enabled, ProGuard rules for Retrofit and Room. Add signing config from env vars.

### 19.5 iOS Release Build
- [ ] Add `ExportOptions.plist` for `xcodebuild -exportArchive`. Document the `xcodebuild archive` + export steps for App Store submission in `client/mobile/ios/README.md`.