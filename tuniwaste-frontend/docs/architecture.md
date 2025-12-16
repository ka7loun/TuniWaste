## TuniWaste Frontend Architecture

- **Framework / Stack**: Angular 17 standalone + RxJS. Designed for MEAN stack integration through REST services.
- **Color System**:  
  - `--tw-navy: #090634`  
  - `--tw-emerald: #03CC88`  
  - `--tw-turquoise: #80DEC1`  
  - `--tw-aqua: #BFF2E1`  
  - `--tw-white: #FFFFFF`

### Application Shell
- `AppComponent` hosts `TopNavComponent` and `<router-outlet>`.
- Global layout, typography, and color tokens live in `src/styles.scss`.

### Routing (`app.routes.ts`)
| Route | Component | Notes |
| --- | --- | --- |
| `/` | `LandingComponent` | Marketing hero, trust signals. |
| `/auth` | `AuthComponent` | Login/Register with role selection. |
| `/verification` | `KycComponent` | KYC / compliance forms. |
| `/dashboard` | `DashboardHubComponent` | Role-based dashboard selector (generators, buyers, transporters, admins). |
| `/listings` | `ListingsComponent` | Browse/search/filter materials, map view. |
| `/listings/create` | `ListingCreateComponent` | File upload, compliance docs, preview. |
| `/bidding` | `BiddingComponent` | Live auction stream + notifications. |
| `/messaging` | `MessagingComponent` | Internal chat w/ unread indicator. |
| `/analytics` | `AnalyticsComponent` | Impact metrics, CO₂ savings calculator, charts. |
| `/profile` | `ProfileComponent` | Company info, transaction history. |

### Feature Domains
- `features/landing`: Marketing hero, feature cards, testimonials.
- `features/auth`: Auth forms, validation, role toggles.
- `features/verification`: KYC steps (company, compliance, documents).
- `features/dashboard`: Hub cards, quick actions, notifications.
- `features/listings`: Filtering, map integration, listing cards.
- `features/listing-create`: Reactive form + uploads + preview.
- `features/bidding`: Bid table, live feed, auto-refresh service.
- `features/messaging`: Thread list, composer, attachment indicator.
- `features/analytics`: Stat widgets, impact metrics, charts, transaction summary.
- `features/profile`: Settings, team, verifications, history.

### Shared Components
- `TopNavComponent`: Global navigation, notifications, CTA.
- `SectionHeadingComponent`: Title/subtitle/cta pattern.
- `StatCardComponent`: KPI display.
- `ListingCardComponent`: Reusable material card (status, tags, CTA).
- `ImpactMetricComponent`: CO₂ savings / waste diverted tiles.
- `MapPanelComponent`: Location map + facility pins.

### Core Services (Mocks, ready for API wiring)
- `AuthService`: Role-aware login/register, session state.
- `WasteService`: Listings CRUD, filtering, material categories.
- `BiddingService`: Simulated real-time bids via RxJS interval + websockets hook.
- `MessagingService`: Conversations, unread counts.
- `AnalyticsService`: KPI + impact metrics.
- `NotificationService`: Toast/bell notifications.
- `FileUploadService`: Handles documents/photos, emits upload progress.
- `MapService`: Reverse geocoding + facility pins (mocked, ready for API).
- `EnvironmentService`: CO₂ savings + diversion calculator.
- `TransactionService`: Tracks deal lifecycle & shipment status.

### State & Data Flow
- Lightweight RxJS subjects inside services for demo data.
- Components subscribe via async pipe to keep OnPush-friendly patterns.
- Forms built with `ReactiveFormsModule` for validation + error surfacing.

### Extensibility
- Environment ready for REST integration (MEAN stack) by swapping mock observables with HttpClient calls.
- Shared tokens ensure palette compliance; add new theming via CSS vars.
- Feature folders isolated for lazy loading when backend endpoints exist.


