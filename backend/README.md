# Offer Banner Management API

This folder is a complete Laravel REST application for the existing car-booking repository. Run it independently of the Next.js frontend. All implementation files are included at the paths listed below; no `make:*` commands or additional scaffolding are needed.

The browser admin panel is available at **http://localhost:8000/admin**. It includes session login, banner counts, search, active/inactive filters, pagination, image previews, create/edit forms, activation, deletion, and a public offer preview. It runs directly in Laravel; no separate frontend build is required.

Sign in with an admin created by `php artisan admin:create`. For this machine's initial local setup, credentials were saved in `storage/app/private/local-admin.json`, which is ignored by Git and is not publicly served. No credentials are embedded in the frontend.

Panel source files live in `resources/views/admin/`, `public/admin-assets/`, `routes/web.php`, and `app/Http/Controllers/Admin/PanelController.php`. The panel uses an HTTP-only session cookie and Laravel request-forgery protection. Its JavaScript calls the same REST endpoints as Postman; API bearer-token authentication remains available. `/offers/preview` displays the currently eligible public offer.

Use PHP 8.4+, Composer 2, and MySQL 8.0+ with InnoDB (MySQL 8.4 is suitable). Enable PHP's usual Laravel extensions, including `pdo_mysql`, `mbstring`, `fileinfo`, `openssl`, `curl`, `xml`, and `ctype`. Tests additionally use `pdo_sqlite` and `gd`. Dependencies are pinned in `composer.lock`.

## Start locally

From the repository root, in PowerShell:

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Create a database in MySQL:

```sql
CREATE DATABASE car_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Edit `.env` with your MySQL username/password and database host. Set `APP_URL` to the actual backend origin, including the port locally, because it is used for complete image URLs. Set `CORS_ALLOWED_ORIGINS` to comma-separated browser frontend origins. Date eligibility uses `APP_TIMEZONE`, which defaults to `Asia/Kolkata`.

```powershell
php artisan migrate
php artisan storage:link
php artisan admin:create admin@example.com --name="Banner Admin"
php artisan serve --host=127.0.0.1 --port=8000
```

The admin command asks for a password and confirmation. It does not install a default password or expose public admin registration. On Windows, `storage:link` requires symlink support (Developer Mode or an appropriately privileged terminal).

Configure PHP `upload_max_filesize=5M` and `post_max_size=8M` or higher, and set the web server body limit accordingly. Images are JPEG, PNG, or WebP, up to 5 MiB. Set your production document root to `backend/public`, make `storage` and `bootstrap/cache` writable, use an HTTPS `APP_URL`, and keep `APP_DEBUG=false`. After environment changes, run `php artisan config:clear`; production may use `php artisan config:cache`. Run Laravel's scheduler to prune expired Sanctum tokens if desired.

## File placement and responsibilities

Every path below is relative to `backend/`. Follow these links to the complete source files.

| File | Responsibility |
| --- | --- |
| [composer.json](composer.json), [composer.lock](composer.lock) | Framework, Sanctum, testing and formatting dependencies |
| [bootstrap/app.php](bootstrap/app.php) | API route registration, admin middleware alias, uniform JSON errors |
| [bootstrap/providers.php](bootstrap/providers.php) | Application provider registration |
| [config/app.php](config/app.php), [config/database.php](config/database.php) | Origin, timezone, MySQL/InnoDB configuration |
| [config/filesystems.php](config/filesystems.php) | Public Storage disk and absolute image URL prefix |
| [config/auth.php](config/auth.php), [config/sanctum.php](config/sanctum.php) | User provider and expiring bearer-token authentication |
| [config/cors.php](config/cors.php) | Browser frontend origin allowlist |
| [config/cache.php](config/cache.php), [config/logging.php](config/logging.php) | Rate limiter storage and exception logs |
| [app/Providers/AppServiceProvider.php](app/Providers/AppServiceProvider.php) | Login rate limits |
| [database/migrations/0001_01_01_000000_create_users_table.php](database/migrations/0001_01_01_000000_create_users_table.php) | Users and the protected `is_admin` flag |
| [database/migrations/0001_01_01_000001_create_personal_access_tokens_table.php](database/migrations/0001_01_01_000001_create_personal_access_tokens_table.php) | Sanctum token storage |
| [database/migrations/2026_09_15_000000_create_banners_table.php](database/migrations/2026_09_15_000000_create_banners_table.php) | All banner fields, creator foreign key, activation lock and unique active constraint |
| [app/Models/User.php](app/Models/User.php) | Hashed passwords, admin cast and Sanctum token support |
| [app/Models/Banner.php](app/Models/Banner.php) | Decimal/date/boolean casts, creator relationship and active-date scope |
| [app/Http/Middleware/EnsureAdmin.php](app/Http/Middleware/EnsureAdmin.php) | Reject authenticated non-admins with HTTP 403 |
| [app/Http/Requests/StoreBannerRequest.php](app/Http/Requests/StoreBannerRequest.php) | Required fields and safe image validation |
| [app/Http/Requests/UpdateBannerRequest.php](app/Http/Requests/UpdateBannerRequest.php) | Partial update validation against existing values |
| [app/Http/Requests/UpdateBannerStatusRequest.php](app/Http/Requests/UpdateBannerStatusRequest.php) | Required boolean status |
| [app/Http/Requests/ListBannersRequest.php](app/Http/Requests/ListBannersRequest.php) | Bounded pagination validation |
| [app/Http/Requests/AdminLoginRequest.php](app/Http/Requests/AdminLoginRequest.php) | Login input validation |
| [app/Support/BannerValues.php](app/Support/BannerValues.php) | Shared monetary and date validation, including validation after locking |
| [app/Services/BannerService.php](app/Services/BannerService.php) | Transactions, activation, uploads, replacements and cleanup |
| [app/Services/AdminAuthService.php](app/Services/AdminAuthService.php) | Verify credentials and issue admin tokens |
| [app/Http/Resources/BannerResource.php](app/Http/Resources/BannerResource.php) | Exact public frontend response fields |
| [app/Http/Resources/AdminBannerResource.php](app/Http/Resources/AdminBannerResource.php) | Public fields plus creator and audit timestamps |
| [app/Http/Controllers/Admin/BannerController.php](app/Http/Controllers/Admin/BannerController.php) | Thin CRUD/status HTTP handlers |
| [app/Http/Controllers/Admin/AuthController.php](app/Http/Controllers/Admin/AuthController.php) | Login and current-token logout |
| [app/Http/Controllers/ActiveBannerController.php](app/Http/Controllers/ActiveBannerController.php) | Public banner or `null` |
| [app/Console/Commands/CreateAdmin.php](app/Console/Commands/CreateAdmin.php) | Interactive initial admin creation |
| [routes/api.php](routes/api.php), [routes/console.php](routes/console.php) | REST endpoints and token pruning schedule |
| [public/index.php](public/index.php), [artisan](artisan) | HTTP and CLI entry points |
| [tests/Feature/BannerApiTest.php](tests/Feature/BannerApiTest.php) | CRUD, date boundaries, validation, storage rollback and uniqueness tests |
| [tests/Feature/AdminAuthTest.php](tests/Feature/AdminAuthTest.php) | Real bearer token, roles, expiry, throttling, CLI and CORS tests |
| [tests/Feature/MySqlBannerConcurrencyTest.php](tests/Feature/MySqlBannerConcurrencyTest.php) | Competing activation requests through independent PHP processes |
| [postman/Offer-Banners.postman_collection.json](postman/Offer-Banners.postman_collection.json) | Importable requests, examples and token/banner-id capture |

`title` is the display title or destination, for example `Special Offer` or `Chennai → Madurai`. The public contract deliberately uses `title`. Prices are stored as `DECIMAL(12,2)` and returned as JSON numbers. Both prices must be nonnegative, have at most two decimal places, and `offer_price <= actual_price`. Dates use exactly `YYYY-MM-DD`, with `to_date >= from_date`. Creation requires both dates; updates preserve omitted values and reject explicit nulls.

`created_by` always comes from the authenticated admin and is immutable through this API. The creator foreign key restricts deleting a user who owns banners. The database-only generated `active_slot` is never accepted as input or included in a resource.

## Endpoints

Use `Accept: application/json` and, for protected endpoints, `Authorization: Bearer <token>`.

| Method | Path | Access | Success |
| --- | --- | --- | --- |
| POST | `/api/admin/login` | Valid admin credentials, rate limited | 200 |
| POST | `/api/admin/logout` | Authenticated token | 200 |
| POST | `/api/admin/banners` | Admin | 201 |
| GET | `/api/admin/banners?page=1&per_page=15` | Admin | 200 |
| GET | `/api/admin/banners/{id}` | Admin | 200 |
| PUT | `/api/admin/banners/{id}` | Admin | 200 |
| DELETE | `/api/admin/banners/{id}` | Admin | 200 with JSON |
| PATCH | `/api/admin/banners/{id}/status` | Admin | 200 |
| GET | `/api/banners/active` | Public | 200 |

Admin listing is newest first, includes inactive/expired/future banners, and returns pagination metadata; `per_page` defaults to 15 and has a maximum of 100. API resource routing additionally permits PATCH for ordinary field updates.

## Postman requests and responses

Import [the collection](postman/Offer-Banners.postman_collection.json). Set collection variables `base_url` (default `http://localhost:8000`), `admin_email`, and `admin_password` locally in Postman. Login captures `admin_token`; create captures `banner_id`. For upload requests, select your local image in the `banner_image` file field. Let Postman set the multipart Content-Type and boundary.

**Login** — `POST {{base_url}}/api/admin/login`, raw JSON:

```json
{
  "email": "admin@example.com",
  "password": "your-admin-password",
  "device_name": "postman"
}
```

HTTP 200:

```json
{
  "status": true,
  "data": {
    "token": "1|example-token-returned-only-at-login",
    "token_type": "Bearer",
    "expires_in": 86400
  }
}
```

The default token lifetime is 1,440 minutes. These bearer requests suit Postman/mobile clients. The included browser admin panel uses Sanctum's cookie/session authentication. Set `SANCTUM_STATEFUL_DOMAINS` if you serve it from additional domains or ports. The public banner API needs no authentication.

**Create** — `POST {{base_url}}/api/admin/banners`, Body → form-data:

| Key | Type | Value |
| --- | --- | --- |
| title | Text | Special Offer |
| banner_image | File | Select `banner.jpg` |
| actual_price | Text | 6500 |
| offer_price | Text | 5000 |
| from_date | Text | 2026-09-14 |
| to_date | Text | 2026-09-30 |
| is_active | Text | 1 |

Omit `is_active` to create an inactive banner. Use `1`/`0` for multipart booleans; JSON requests accept `true`/`false` as well. Do not send multipart strings `"true"` or `"false"`.

HTTP 201, with a `Location` header for the new banner:

```json
{
  "status": true,
  "message": "Banner created successfully.",
  "data": {
    "id": 1,
    "title": "Special Offer",
    "banner_image": "http://localhost:8000/storage/banners/generated-name.jpg",
    "actual_price": 6500,
    "offer_price": 5000,
    "from_date": "2026-09-14",
    "to_date": "2026-09-30",
    "is_active": true,
    "created_by": 1,
    "created_at": "2026-09-15T06:30:00.000000Z",
    "updated_at": "2026-09-15T06:30:00.000000Z"
  }
}
```

**List** returns `{"status":true,"data":[...],"meta":{"current_page":1,"last_page":1,"per_page":15,"total":1}}`. **View** returns `{"status":true,"data":{...}}`. Each object contains the admin fields shown above; the importable collection includes full examples.

**Update fields** — `PUT {{base_url}}/api/admin/banners/{{banner_id}}`, raw JSON:

```json
{
  "title": "Chennai Special Offer",
  "offer_price": 4800
}
```

HTTP 200 contains `status: true`, `message: "Banner updated successfully."`, and the updated admin resource. Omitted values and the existing image are retained. A partial price/date update is checked against the stored counterpart, including a second check inside the transaction.

**Replace image** — use `POST {{base_url}}/api/admin/banners/{{banner_id}}`, Body → form-data, with `_method` (Text) `PUT`, `banner_image` (File), and any other changed fields. Laravel's method override reaches the same PUT route and works across PHP versions that do not parse multipart PUT uploads.

**Activate or deactivate** — `PATCH {{base_url}}/api/admin/banners/{{banner_id}}/status`, raw JSON:

```json
{"is_active": true}
```

Use `false` to deactivate. HTTP 200 contains `status: true`, `message: "Banner status updated successfully."`, and the updated admin resource. Repeating the same status is safe.

**Delete** — `DELETE {{base_url}}/api/admin/banners/{{banner_id}}`:

```json
{"status": true, "message": "Banner deleted successfully."}
```

**Public active banner** — `GET {{base_url}}/api/banners/active`, with no token:

```json
{
  "status": true,
  "data": {
    "id": 1,
    "title": "Special Offer",
    "banner_image": "https://domain.com/storage/banners/generated-name.jpg",
    "actual_price": 6500,
    "offer_price": 5000,
    "from_date": "2026-09-14",
    "to_date": "2026-09-30",
    "is_active": true
  }
}
```

The image hostname follows `APP_URL`. If no eligible banner exists, HTTP 200 is `{"status":true,"data":null}`. The response uses `Cache-Control: no-store` so clients should fetch fresh state.

**Errors** use `status: false`. HTTP 401 means missing/invalid/expired token or bad login credentials; 403 means a non-admin; 404 means an unknown banner; 422 means invalid input; 429 means too many login attempts. Server errors are logged and return a generic HTTP 500 message without database, stack, or filesystem details.

Example HTTP 422:

```json
{
  "status": false,
  "message": "The offer price field must be less than or equal to 6500.",
  "errors": {
    "offer_price": ["The offer price field must be less than or equal to 6500."]
  }
}
```

## Activation and storage behavior

There is at most one globally active banner, including future or expired banners. Activation immediately deactivates the previous active banner in the same transaction. Consequently, activating a future-dated banner immediately hides the old one; the public endpoint returns `null` until the new start date. Expiry does not restore an older banner. Both date boundaries are inclusive. No daily status-reset job is required for public filtering.

All service writes lock the permanent `banner_activation_locks` row before reading or changing banners, which also protects the first activation in an empty table. The generated `active_slot` is `1` for an active row and `NULL` otherwise. Its unique database index independently prevents multiple active rows, including writes that bypass this service. A plain unique index on `is_active` would incorrectly prevent multiple inactive banners. Transactions retry deadlocks up to three attempts.

Uploads use random Laravel Storage filenames, with only relative paths persisted. Replacement uploads are written before the transaction; failed saves remove the new file. Old images are removed only after successful commit. A cleanup failure is logged and can leave an unreferenced file for later removal; it does not turn a committed database save into an error response. SQL transactions cannot make filesystem operations atomic across a process/server crash.

## Frontend use

```js
const response = await fetch(`${API_BASE_URL}/api/banners/active`, {
  headers: { Accept: 'application/json' },
  cache: 'no-store',
});
if (!response.ok) throw new Error('Unable to load offer banner');
const result = await response.json();
const banner = result.status ? result.data : null;
// When banner is null, hide the offer area.
// Otherwise use banner.banner_image, banner.title and the numeric prices.
```

Flutter can call the same endpoint and decode the same JSON; allow the nullable `data` object. Existing Next.js UI integration is outside this backend deliverable.

## Verification

```powershell
composer test
composer lint
php artisan route:list --path=api
```

The default suite uses an isolated in-memory SQLite database. The uniqueness constraint is tested there, while the multi-process InnoDB concurrency test runs only on MySQL. To execute the whole suite including that test, create a **dedicated, disposable test database**: the test migration trait drops and recreates tables. Never point it at the application database.

```sql
CREATE DATABASE car_booking_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

In a separate PowerShell session, set credentials for that test database:

```powershell
$env:DB_CONNECTION = 'mysql'
$env:DB_DATABASE = 'car_booking_test'
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '3306'
$env:DB_USERNAME = 'your-test-database-user'
$env:DB_PASSWORD = 'your-test-database-password'
php artisan test
```

The MySQL test launches two independent PHP processes that compete to activate different banners and checks both complete with exactly one active row remaining.

Framework references: [Sanctum](https://laravel.com/docs/13.x/sanctum), [pessimistic locking](https://laravel.com/docs/13.x/queries#pessimistic-locking), [public file storage](https://laravel.com/docs/13.x/filesystem#the-public-disk).
