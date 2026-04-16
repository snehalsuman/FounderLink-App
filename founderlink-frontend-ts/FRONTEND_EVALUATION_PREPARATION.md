# FounderLink Frontend TS Evaluation Preparation

This file is a simple revision guide for your frontend evaluation.

Goal of this document:

- Tell you what each evaluation parameter means
- Tell you where the code is written
- Explain the flow in simple English
- Help you answer follow-up questions easily

Project: `founderlink-frontend-ts`

## 1. Overview

### What you built

A React + TypeScript frontend for FounderLink with:

- Authentication
- Role-based routing
- Redux Toolkit state management
- Centralized API layer
- Validation
- Real-time notifications
- Razorpay payment flow
- Reusable hooks and components
- Unit tests and Cypress tests

### Main files

- `src/index.tsx`
- `src/App.tsx`
- `src/routes/router.tsx`
- `src/store/store.ts`

### Simple explanation

The app starts from `index.tsx`, loads the global styles, wraps the app in an error boundary, and renders `App.tsx`.

Then `App.tsx` provides:

- Redux store
- Toast notifications
- Router
- Theme toggle

### Flow

1. `src/index.tsx` boots the app.
2. `src/App.tsx` provides global setup.
3. `src/routes/router.tsx` decides which page to show.
4. Each feature page calls centralized API files from `src/core/api/`.

### One-line interview answer

I built a production-style React + TypeScript frontend with proper architecture, reusable logic, routing, API integration, validation, and role-based access.

## 2. Architecture and Code Quality

### Where the code is

- `src/features/`
- `src/shared/`
- `src/core/`
- `src/store/`
- `src/routes/`
- `src/types/`

### Why this matters

The project is not a random collection of components. It is split by responsibility.

### Folder meaning in simple English

- `features/` = business pages like auth, founder, investor, admin
- `shared/` = reusable components, hooks, and utilities
- `core/` = API setup, token service, guards
- `store/` = Redux Toolkit global state
- `routes/` = route setup and access control
- `types/` = shared TypeScript interfaces

### Flow

1. A page lives in `features/`.
2. It reuses common UI from `shared/components/`.
3. It uses API services from `core/api/`.
4. If state must be shared globally, it goes to Redux in `store/`.

### Best files to show

- `src/features/auth/Login.tsx`
- `src/core/api/axiosConfig.ts`
- `src/shared/hooks/useAuth.ts`
- `src/store/store.ts`

### One-line interview answer

I used feature-based architecture so the project stays scalable, readable, and easier to maintain.

## 3. API Integration and Data Handling

### Where the code is

- `src/core/api/axiosConfig.ts`
- `src/core/api/authApi.ts`
- `src/core/api/startupApi.ts`
- `src/core/api/investmentApi.ts`
- `src/core/api/paymentApi.ts`
- `src/core/api/userApi.ts`
- `src/core/api/teamApi.ts`
- `src/core/api/messagingApi.ts`
- `src/core/api/notificationApi.ts`

### What is implemented

- Shared Axios instance
- Centralized base URL
- Automatic auth header attachment
- Global 401 handling
- Token refresh flow

### Simple explanation

Instead of writing API calls separately inside every component, I created dedicated API files. That keeps components cleaner and makes backend communication easier to manage.

### Flow

1. A page calls an API function like `login()`, `getStartupById()`, or `createOrder()`.
2. That function uses the shared Axios instance from `axiosConfig.ts`.
3. Axios automatically attaches the token.
4. If the server returns `401`, the interceptor tries to refresh the token.
5. If refresh succeeds, the original request is retried.
6. If refresh fails, user data is cleared and the user is sent to login.

### Important file detail

In `src/core/api/axiosConfig.ts`:

- `baseURL` comes from `REACT_APP_API_BASE_URL`
- `withCredentials: true` is enabled
- request interceptor adds `Authorization: Bearer <token>`
- response interceptor handles refresh logic

### One-line interview answer

I centralized API handling with Axios interceptors so auth headers and 401 handling are managed in one place instead of repeating logic in every component.

## 4. Authentication and Authorization

### Where the code is

- `src/features/auth/Login.tsx`
- `src/features/auth/Register.tsx`
- `src/core/api/authApi.ts`
- `src/core/tokenService.ts`
- `src/store/slices/authSlice.ts`
- `src/shared/components/ProtectedRoute.tsx`
- `src/shared/hooks/useAuth.ts`
- `src/routes/router.tsx`

### What is implemented

- Login
- Register
- Token storage
- Protected routes
- Role-based routes
- Role helper hook

### Simple explanation

After login, the app stores token and user details. Protected pages check whether the user is logged in and whether the role is allowed.

### Login flow

1. User enters email and password in `Login.tsx`.
2. Form is validated with Yup.
3. `login()` API is called.
4. Response returns token, userId, role, email, and name.
5. `setCredentials()` in `authSlice.ts` stores data in Redux and `tokenService`.
6. User is redirected to the correct dashboard based on role.

### Register flow

1. User fills form in `Register.tsx`.
2. Form is validated with `registerSchema`.
3. `registerApi()` is called.
4. On success, success toast is shown.
5. User is redirected to login.

### Protected route flow

1. `ProtectedRoute.tsx` gets `isAuthenticated` and `role` from `useAuth()`.
2. It also reads token from `tokenService`.
3. It checks if token exists and whether token is expired.
4. If invalid, it clears session and redirects to `/login`.
5. If role is not allowed, it redirects to `/unauthorized`.
6. Otherwise it renders the page.

### Role helper flow

In `src/shared/hooks/useAuth.ts`, the hook returns:

- `isAuthenticated`
- `isFounder`
- `isInvestor`
- `isAdmin`
- `isCoFounder`
- `userId`
- `role`

This makes role checks simple in components.

### One-line interview answer

I implemented authentication with Redux and token storage, then enforced authorization through protected routes and role-based routing.

## 5. Error Handling and Resilience

### Where the code is

- `src/shared/components/ErrorBoundary.tsx`
- `src/routes/router.tsx`
- `src/core/api/axiosConfig.ts`
- `src/App.tsx`
- multiple feature pages using `toast`

### What is implemented

- Global React error boundary
- Route-level fallback page
- API error handling
- User-friendly toast messages
- Loading, empty, and failure states

### Simple explanation

I handled errors at multiple levels so the app does not fail silently and the user sees clear feedback.

### Flow

1. If rendering crashes, `ErrorBoundary.tsx` catches it.
2. If route loading fails, `router.tsx` shows `ErrorPage`.
3. If an API request fails, the page shows a toast or local fallback UI.
4. If auth fails with `401`, Axios handles refresh or logout globally.

### Example files

- `src/features/auth/Login.tsx`
- `src/features/investor/StartupDetail.tsx`
- `src/features/common/Notifications.tsx`

### One-line interview answer

I added both global and local error handling so crashes, API failures, and invalid sessions are handled gracefully.

## 6. State Management

### Where the code is

- `src/store/store.ts`
- `src/store/slices/authSlice.ts`
- `src/store/slices/notificationSlice.ts`
- `src/store/slices/themeSlice.ts`
- `src/store/slices/startupSlice.ts`

### What is implemented

- Redux Toolkit store
- Shared auth state
- Shared startup list state
- Shared notifications state
- Shared theme state

### Simple explanation

I used Redux only for data that many parts of the app need. Small temporary UI state still stays local inside components.

### Flow

1. `store.ts` combines all slices.
2. `App.tsx` provides the Redux store.
3. Components use `useSelector()` to read global state.
4. Components use `dispatch()` to update state.

### Auth slice flow

1. `setCredentials()` stores token and user.
2. `logout()` clears token and user.
3. Selectors expose auth state to the app.

### One-line interview answer

I used Redux Toolkit for truly global state like auth, startups, notifications, and theme, while keeping small UI state local.

## 7. Environment and Configuration Management

### Where the code is

- `src/core/api/axiosConfig.ts`
- `src/shared/hooks/useNotificationSocket.ts`
- environment files like `.env` and `.env.production` if present

### What is implemented

- API base URL from env
- WebSocket URL from env

### Simple explanation

I avoided hardcoding backend URLs. That makes the app easier to deploy in different environments like local, test, or production.

### Flow

1. App reads `REACT_APP_API_BASE_URL`.
2. Axios uses that as backend base URL.
3. App reads `REACT_APP_WS_URL`.
4. Notification socket uses that for WebSocket connection.

### One-line interview answer

I used environment variables so the same frontend code can work with different backend environments safely.

## 8. Component Design and Reusability

### Where the code is

- `src/shared/components/Button.tsx`
- `src/shared/components/Input.tsx`
- `src/shared/components/Layout.tsx`
- `src/shared/components/Navbar.tsx`
- `src/shared/components/Sidebar.tsx`
- `src/shared/components/StartupCard.tsx`
- `src/shared/hooks/useAuth.ts`
- `src/shared/hooks/useDebounce.ts`
- `src/shared/hooks/useThrottle.ts`

### What is implemented

- Reusable button and input
- Shared layout structure
- Reusable utility hooks

### Simple explanation

If the same UI or logic is needed in multiple places, I moved it into reusable shared files. This reduces duplicate code.

### Flow

1. Feature page imports shared component or hook.
2. Shared logic runs in one central place.
3. Any future update can be done once and reused everywhere.

### One-line interview answer

I extracted repeated UI and logic into shared components and hooks to reduce duplication and improve maintainability.

## 9. User Experience and Interaction Logic

### Where the code is

- `src/features/auth/Login.tsx`
- `src/features/auth/Register.tsx`
- `src/features/investor/StartupDetail.tsx`
- `src/shared/components/Button.tsx`
- `src/App.tsx`

### What is implemented

- Loading buttons
- Disabled submit states
- Inline validation errors
- Success and error toasts
- Role-based redirects after login

### Simple explanation

The app always tries to tell the user what is happening. If something is loading, the user sees loading. If something fails, the user sees a proper message.

### Flow examples

- Login: user submits -> loading starts -> API runs -> success toast -> redirect
- Register: user submits -> validation checks -> success toast -> login page
- Payment: button becomes processing -> script loads -> payment opens -> verify payment -> success or error message

### One-line interview answer

I focused on feedback-driven UX so users always know whether an action is loading, successful, or failed.

## 10. UI Design and Visual Quality

### Where the code is

- `src/styles/index.css`
- `src/shared/components/Button.tsx`
- `src/shared/components/Layout.tsx`
- `src/features/auth/Login.tsx`
- `src/features/auth/Register.tsx`
- `src/features/common/LandingPage.tsx`

### What is implemented

- Consistent dark-themed design
- Reusable design patterns
- Shared classes
- Consistent spacing and card design

### Simple explanation

I kept the UI consistent instead of designing each page differently. That gives the product a cleaner and more professional feel.

### One-line interview answer

I used shared styling patterns and reusable UI building blocks to keep the product visually consistent.

## 11. Responsiveness and Cross-Browser Compatibility

### Where the code is

- `src/features/auth/Login.tsx`
- `src/features/auth/Register.tsx`
- `src/layouts/MainLayout.tsx`
- `src/shared/components/Navbar.tsx`
- `src/shared/components/Sidebar.tsx`
- `src/styles/index.css`

### What is implemented

- Mobile and desktop layout handling
- Responsive utility classes
- Flexible grids and flexbox layouts

### Simple explanation

The UI is built to adapt to different screen sizes. Desktop gets wider layout, and smaller screens get stacked layout.

### Honest answer if asked

Responsive code is implemented, but manual browser testing should still be done before final production release.

### One-line interview answer

I used responsive layouts and utility classes so the app adapts across mobile and desktop screens.

## 12. Performance Optimization

### Where the code is

- `src/routes/router.tsx`
- `src/shared/hooks/useDebounce.ts`
- `src/shared/hooks/useThrottle.ts`
- `src/features/investor/BrowseStartups.tsx`
- `src/features/founder/TeamManagement.tsx`
- `src/reportWebVitals.ts`

### What is implemented

- Lazy loading with `React.lazy`
- `Suspense` loading fallback
- Debouncing
- Throttling

### Simple explanation

I used performance techniques to reduce unnecessary work. This helps the app feel smoother and prevents too many updates.

### Lazy loading flow

1. Route components in `router.tsx` are imported with `lazy()`.
2. Page code is loaded only when needed.
3. While loading, `Suspense` shows `PageLoader`.

### Debounce flow

Where used:

- `src/shared/hooks/useDebounce.ts`
- `src/features/investor/BrowseStartups.tsx`
- `src/features/founder/TeamManagement.tsx`

Simple meaning:

Debounce waits for the user to stop typing before updating the final value.

Flow in `BrowseStartups.tsx`:

1. User types search text.
2. `search` state changes immediately.
3. `useDebounce(search, 400)` waits 400ms.
4. Filtering uses the debounced value.
5. This avoids heavy work on every keystroke.

### Throttle flow

Where written:

- `src/shared/hooks/useThrottle.ts`

Where used:

- `src/features/investor/BrowseStartups.tsx`

Simple meaning:

Throttle allows an action only once in a given time window.

Flow in `BrowseStartups.tsx`:

1. User clicks page buttons quickly.
2. `handlePageChange` is wrapped with `useThrottle(..., 500)`.
3. Only one page change is allowed every 500ms.
4. This avoids rapid repeated dispatches and repeated scrolling.

### Very important interview point

You can say:

I added both debouncing and throttling. Debouncing is used for text input based filtering, while throttling is used for pagination clicks so repeated rapid actions are controlled.

### One-line interview answer

I improved performance using lazy loading, debouncing for input-heavy interactions, and throttling for repeated user actions like pagination.

## 13. Real-Time Communication

### Where the code is

- `src/shared/hooks/useNotificationSocket.ts`
- `src/features/common/Notifications.tsx`
- `src/shared/components/Navbar.tsx`

### What is implemented

- STOMP client
- SockJS connection
- Per-user topic subscription
- Reconnect handling
- Cleanup on unmount

### Simple explanation

I built real-time notifications using a custom hook so UI components do not need to manage socket connection details themselves.

### Flow

1. Component calls `useNotificationSocket(userId, onNotification)`.
2. Hook reads token from `tokenService`.
3. Hook creates STOMP client using SockJS.
4. It connects to `REACT_APP_WS_URL`.
5. On connect, it subscribes to `/topic/notifications/{userId}`.
6. When a message arrives, JSON is parsed and passed to the callback.
7. On unmount, socket is deactivated.

### One-line interview answer

I isolated WebSocket notification logic inside a reusable hook so connection handling stays clean and reusable.

## 14. Payment Integration

### Where the code is

- `src/features/investor/StartupDetail.tsx`
- `src/core/api/paymentApi.ts`
- `src/core/api/investmentApi.ts`
- `src/core/api/userApi.ts`

### What is implemented

- Create order from backend
- Load Razorpay script dynamically
- Open payment modal
- Verify payment on backend
- Refresh investments after success

### Simple explanation

The frontend does not trust payment success directly. It asks the backend to create the order first, and after payment it verifies the response with the backend.

### Full payment flow

1. Investor opens `StartupDetail.tsx`.
2. Startup info and current investments are loaded.
3. User enters amount.
4. Validation checks amount through `investmentSchema`.
5. `loadRazorpayScript()` loads Razorpay checkout if not already loaded.
6. `createOrder()` is called on backend.
7. Backend returns `orderId`, `amount`, `currency`, and `keyId`.
8. Razorpay modal opens with those details.
9. On payment success, frontend receives `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
10. Frontend sends these to backend using `verifyPayment()`.
11. If backend confirms success, success toast is shown and investments are refreshed.
12. If payment fails or is cancelled, user sees a proper message.

### One-line interview answer

I implemented a backend-verified Razorpay flow, not just a frontend-only payment popup, which is safer and more production-oriented.

## 15. Testing and Debugging

### Where the code is

- `src/shared/hooks/useAuth.test.ts`
- `src/shared/hooks/useDebounce.test.ts`
- `src/shared/utils/validationSchemas.test.ts`
- `src/shared/components/ProtectedRoute.test.tsx`
- `cypress/e2e/auth.cy.ts`
- `cypress/e2e/browse.cy.ts`
- `cypress/support/commands.ts`
- `src/setupTests.ts`

### What is implemented

- Unit tests for reusable logic
- Route protection tests
- Cypress E2E tests for user flows

### Simple explanation

I did not rely only on manual checking. I added automated tests for important logic and user journeys.

### Flow

1. Unit tests verify small logic pieces like hooks and schemas.
2. Component tests verify protected route behavior.
3. Cypress tests check bigger flows like auth and browsing.

### One-line interview answer

I added tests at multiple levels so shared logic and user flows can be verified automatically.

## 16. Documentation and Maintainability

### Where the code is

- `README.md`
- `tsconfig.json`
- `src/types/index.ts`
- `FRONTEND_EVALUATION_PREPARATION.md`

### What is implemented

- TypeScript typing
- Shared types
- Setup documentation
- Evaluation documentation

### Simple explanation

TypeScript makes the code easier to understand and safer to change. Shared types also reduce mistakes between components and APIs.

### One-line interview answer

I improved maintainability using TypeScript, shared types, and documentation so the project is easier for others to understand and extend.

## 17. Feature Completeness and Functional Coverage

### Where the code is

- `src/features/auth/`
- `src/features/founder/`
- `src/features/investor/`
- `src/features/common/`
- `src/features/admin/AdminDashboard.tsx`
- `src/features/cofounder/CoFounderDashboard.tsx`

### What is implemented

- Auth
- Founder dashboard and startup management
- Investor browsing and investment
- Notifications and messaging
- Profile
- Admin dashboard
- Cofounder dashboard
- Payment history and investment history

### Simple explanation

The project covers all main user roles and major product flows, not just a few sample pages.

### One-line interview answer

The frontend covers the main FounderLink roles and flows end to end, including auth, startup management, investment, messaging, notifications, and admin functions.

## 18. Code Understanding and Explanation Ability

### Best files to study before evaluation

- `src/routes/router.tsx`
- `src/core/api/axiosConfig.ts`
- `src/shared/components/ProtectedRoute.tsx`
- `src/store/slices/authSlice.ts`
- `src/shared/hooks/useAuth.ts`
- `src/features/auth/Login.tsx`
- `src/features/investor/BrowseStartups.tsx`
- `src/features/investor/StartupDetail.tsx`
- `src/shared/hooks/useNotificationSocket.ts`

### Design choices you can explain

- Why feature-based structure is better
- Why Axios interceptors were centralized
- Why Redux was used only for shared state
- Why protected routes were added
- Why debounce and throttle were both added
- Why payment verification must happen on backend
- Why socket logic was isolated in a hook

### One-line interview answer

My focus was not only making the app work, but making the code understandable, reusable, and scalable.

## 19. Communication and Problem-Solving

### What you can say in discussion

- This was not only a `.js` to `.tsx` rename. I also improved architecture and type safety.
- I centralized repeated logic like auth handling and API configuration.
- I handled edge cases like token expiry, API failure, empty states, and payment errors.
- I added reusable hooks for cleaner logic.

### Simple explanation

This shows that you thought beyond just making the UI visible. You also thought about maintainability, error handling, and user experience.

## 20. Security Best Practices

### Where the code is

- `src/core/api/axiosConfig.ts`
- `src/core/tokenService.ts`
- `src/shared/components/ProtectedRoute.tsx`
- `src/shared/utils/validationSchemas.ts`

### What is implemented

- Auth headers through interceptor
- Protected route checks
- Token expiry check
- Validation before submission
- Environment-based config

### Simple explanation

Frontend security is about reducing obvious risks and handling auth properly, but final security always depends on backend enforcement too.

### Flow

1. Token is stored using `tokenService`.
2. Axios attaches token automatically.
3. Protected routes stop unauthenticated users.
4. Expired token causes redirect to login.
5. Validation blocks bad form input before request is sent.

### Important CORS answer

Question: Did we need to add CORS in frontend?

Simple answer:

Usually no, not as a frontend feature.

CORS is mainly a backend/server responsibility. The backend must allow the frontend origin if frontend and backend run on different domains or ports.

### What exists in this frontend

In `src/core/api/axiosConfig.ts`, this frontend uses:

- `withCredentials: true`

This means:

- the browser is allowed to send cookies/credentials with requests
- but the backend must be configured correctly for CORS

### What to say in evaluation

You can say:

We did not implement CORS policy inside the frontend because actual CORS configuration belongs to the backend. In the frontend, I enabled `withCredentials: true` in Axios so credentialed cross-origin requests can work if the backend allows them.

### One-line interview answer

Security-related frontend work is present, but full enforcement of CORS, JWT verification, authorization, and payment trust must be handled by the backend.

## 21. Advanced Practices

### Where the code is

- `src/shared/hooks/useAuth.ts`
- `src/shared/hooks/useDebounce.ts`
- `src/shared/hooks/useThrottle.ts`
- `src/shared/hooks/useNotificationSocket.ts`
- `src/routes/router.tsx`
- `src/shared/components/Button.tsx`
- `src/shared/components/Layout.tsx`
- `src/shared/utils/validationSchemas.ts`

### What is implemented

- Custom hooks
- Lazy-loaded routes
- Reusable UI abstractions
- Typed validation schemas

### Simple explanation

These are signs of a more mature frontend codebase. The app is not only functional, but also structured well for reuse and future growth.

### One-line interview answer

I used advanced frontend practices like custom hooks, route lazy loading, typed validation, and reusable abstractions to make the codebase stronger.

## Quick Revision: Most Important Flows

### App start flow

1. `src/index.tsx` loads app and wraps it in `ErrorBoundary`.
2. `src/App.tsx` provides Redux, router, toaster, and theme toggle.
3. `src/routes/router.tsx` renders route based on URL.

### Login flow

1. User enters credentials in `Login.tsx`.
2. Yup validates input.
3. `authApi.login()` is called.
4. `authSlice.setCredentials()` stores token and user.
5. User is redirected by role.

### Protected route flow

1. Route passes through `ProtectedRoute.tsx`.
2. Auth state and token are checked.
3. Expired or missing token redirects to login.
4. Wrong role redirects to unauthorized page.

### Browse startups flow

1. `BrowseStartups.tsx` loads startup page data from Redux action.
2. Search and location values are debounced.
3. Results are filtered on current page data.
4. Pagination is throttled to avoid rapid repeated actions.

### Notification flow

1. User is authenticated.
2. `useNotificationSocket()` connects using token.
3. Hook subscribes to user-specific topic.
4. Incoming message updates UI.

### Payment flow

1. Investor enters amount.
2. Validation checks amount.
3. Backend creates Razorpay order.
4. Frontend opens Razorpay.
5. Backend verifies payment response.
6. UI refreshes investment data.

## Direct Answers You Can Use Tomorrow

### If they ask: Why TypeScript?

TypeScript improves safety, readability, and maintainability. It helps catch mistakes early and makes shared contracts clear across components and APIs.

### If they ask: Why Redux?

Redux Toolkit was used only for truly global state like auth, startups, notifications, and theme. Local UI state still stays inside components.

### If they ask: Why use Axios interceptors?

So token attachment and 401 handling are done once centrally instead of repeating the same logic in every API call.

### If they ask: Why debounce and throttle both?

Debounce is for typing-based interactions so the app waits before reacting. Throttle is for repeated actions like pagination so the action cannot fire too often.

### If they ask: Did you add CORS?

Frontend does not usually implement CORS policy. Backend handles CORS. In frontend I enabled `withCredentials: true`, which supports credentialed cross-origin requests when backend CORS is configured properly.

### If they ask: What are your strongest points in this frontend?

- TypeScript migration with better structure
- Role-based protected routing
- Centralized API handling
- Token refresh flow
- Reusable hooks and components
- Debounce and throttle optimization
- Real-time notifications
- Razorpay payment integration
- Testing support

## Short Mentor-Facing Summary

I built the FounderLink frontend as a structured React + TypeScript application with feature-based architecture, Redux Toolkit, centralized Axios services, protected role-based routing, validation, reusable hooks and components, real-time notifications, and backend-verified Razorpay integration. I also added performance improvements like lazy loading, debouncing, and throttling, and documented the implementation clearly for maintainability and evaluation readiness.
