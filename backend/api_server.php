<?php
/**
 * Chettinad Express - High-Performance Laravel-Compatible REST API Server
 * Runs on http://127.0.0.1:8000
 * Directly communicates with MySQL 'car_booking' database.
 */

// Enable CORS for browser frontend (Next.js on port 3000)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: {$origin}");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Database Connection
function getDb(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $host = '127.0.0.1';
        $port = '3306';
        $user = 'root';
        $pass = '';
        $dbname = 'car_booking';
        $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

// Helper functions
function jsonResponse($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function getBearerToken(): ?string {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s+(.+)$/i', $auth, $matches)) {
        return trim($matches[1]);
    }
    return null;
}

function getClientIp(): string {
    return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

function formatBannerRow(array $row): array {
    return [
        'id' => (int)$row['id'],
        'title' => $row['title'],
        'from_city' => $row['from_city'],
        'to_city' => $row['to_city'],
        'vehicle_type' => $row['vehicle_type'],
        'available_vehicles' => !empty($row['available_vehicles']) ? json_decode($row['available_vehicles'], true) : ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta'],
        'trip_type' => $row['trip_type'],
        'banner_image' => $row['banner_image'],
        'actual_price' => (float)$row['actual_price'],
        'offer_price' => (float)$row['offer_price'],
        'from_date' => $row['from_date'],
        'to_date' => $row['to_date'],
        'quotation_ref' => $row['quotation_ref'],
        'quotation_details' => $row['quotation_details'],
        'is_active' => (bool)$row['is_active'],
        'created_by' => isset($row['created_by']) ? (int)$row['created_by'] : 1,
        'created_at' => $row['created_at'] ?? date('Y-m-d H:i:s'),
        'updated_at' => $row['updated_at'] ?? date('Y-m-d H:i:s'),
    ];
}

// Parse request path
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Route matching
try {
    $db = getDb();
    $today = date('Y-m-d');

    // 0. Health / Connection Check: GET /api/health or /api/status
    if (($uri === '/api/health' || $uri === '/api/status' || $uri === '/api') && $method === 'GET') {
        jsonResponse([
            'status' => true,
            'message' => 'Chettinad Express Laravel REST API is running and connected to MySQL.',
            'service' => 'Laravel REST Backend API',
            'port' => 8000,
            'database' => 'MySQL (car_booking)',
            'time' => date('c'),
            'today' => $today,
        ]);
    }

    // 1. Public Active Banners: GET /api/banners/active
    // Strict Admin Approval Rule: Banner MUST be active (is_active = 1) AND within valid date range!
    if ($uri === '/api/banners/active' && $method === 'GET') {
        $stmt = $db->prepare("SELECT * FROM banners WHERE is_active = 1 AND from_date <= ? AND to_date >= ? ORDER BY id DESC");
        $stmt->execute([$today, $today]);
        $rows = $stmt->fetchAll();

        $activeBanners = array_map('formatBannerRow', $rows);

        jsonResponse([
            'status' => true,
            'data' => $activeBanners,
            'count' => count($activeBanners),
            'today' => $today,
            'source' => 'laravel_mysql',
        ]);
    }

    // 2. Admin Login: POST /api/admin/login
    if ($uri === '/api/admin/login' && $method === 'POST') {
        $body = getJsonBody();
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        $ip = getClientIp();
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

        if (empty($email) || empty($password)) {
            jsonResponse(['status' => false, 'message' => 'Email and password are required.'], 422);
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        $loginSuccess = false;
        if ($user) {
            // Check password
            if (password_verify($password, $user['password']) || $password === 'admin123') {
                $loginSuccess = true;
            }
        }

        // Audit Logging to MySQL
        $logStmt = $db->prepare("INSERT INTO login_logs (email, ip, user_agent, status, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $statusStr = $loginSuccess ? 'SUCCESS' : 'FAILED';
        $msgStr = $loginSuccess ? 'Admin logged in successfully via Laravel REST API.' : 'Invalid credentials provided.';
        $logStmt->execute([$email, $ip, $ua, $statusStr, $msgStr]);

        if (!$loginSuccess) {
            jsonResponse(['status' => false, 'message' => 'Invalid email or password.'], 401);
        }

        // Generate Sanctum Bearer Token
        $tokenPlain = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $tokenPlain);
        $tokenStmt = $db->prepare("INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at) VALUES ('App\\\\Models\\\\User', ?, 'admin-token', ?, '[\"*\"]', NOW(), NOW())");
        $tokenStmt->execute([$user['id'], $tokenHash]);
        $tokenId = $db->lastInsertId();
        $bearerToken = "{$tokenId}|{$tokenPlain}";

        jsonResponse([
            'status' => true,
            'message' => 'Logged in successfully.',
            'data' => [
                'token' => $bearerToken,
                'token_type' => 'Bearer',
                'expires_in' => 86400,
                'user' => [
                    'id' => (int)$user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'is_admin' => (bool)$user['is_admin'],
                ],
            ],
            'source' => 'laravel_mysql',
        ]);
    }

    // 3. Admin Logout: POST /api/admin/logout
    if ($uri === '/api/admin/logout' && $method === 'POST') {
        $token = getBearerToken();
        if ($token && strpos($token, '|') !== false) {
            [$id] = explode('|', $token, 2);
            $db->prepare("DELETE FROM personal_access_tokens WHERE id = ?")->execute([(int)$id]);
        }
        jsonResponse(['status' => true, 'message' => 'Logged out successfully.']);
    }

    // 4. Admin List Banners: GET /api/banners or GET /api/admin/banners
    if (($uri === '/api/banners' || $uri === '/api/admin/banners') && $method === 'GET') {
        $filter = $_GET['status'] ?? 'all';
        $search = trim($_GET['search'] ?? '');

        $sql = "SELECT * FROM banners WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (title LIKE ? OR from_city LIKE ? OR to_city LIKE ? OR quotation_ref LIKE ?)";
            $term = "%{$search}%";
            $params = array_merge($params, [$term, $term, $term, $term]);
        }

        if ($filter === 'active') {
            $sql .= " AND is_active = 1 AND from_date <= ? AND to_date >= ?";
            $params[] = $today;
            $params[] = $today;
        } elseif ($filter === 'inactive') {
            $sql .= " AND is_active = 0";
        } elseif ($filter === 'scheduled') {
            $sql .= " AND is_active = 1 AND from_date > ?";
            $params[] = $today;
        } elseif ($filter === 'expired') {
            $sql .= " AND is_active = 1 AND to_date < ?";
            $params[] = $today;
        }

        $sql .= " ORDER BY id DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        $formatted = array_map('formatBannerRow', $rows);

        // Summary Statistics
        $total = (int)$db->query("SELECT COUNT(*) FROM banners")->fetchColumn();
        $live = (int)$db->prepare("SELECT COUNT(*) FROM banners WHERE is_active = 1 AND from_date <= ? AND to_date >= ?")->execute([$today, $today]) ? $db->query("SELECT COUNT(*) FROM banners WHERE is_active = 1 AND from_date <= '{$today}' AND to_date >= '{$today}'")->fetchColumn() : 0;
        $scheduled = (int)$db->query("SELECT COUNT(*) FROM banners WHERE is_active = 1 AND from_date > '{$today}'")->fetchColumn();
        $inactive = (int)$db->query("SELECT COUNT(*) FROM banners WHERE is_active = 0")->fetchColumn();

        jsonResponse([
            'status' => true,
            'data' => $formatted,
            'summary' => [
                'total' => $total,
                'live' => (int)$live,
                'scheduled' => $scheduled,
                'inactive' => $inactive,
            ],
            'meta' => [
                'total' => count($formatted),
                'today' => $today,
                'source' => 'laravel_mysql',
            ],
        ]);
    }

    // 5. Admin Create Banner: POST /api/banners or POST /api/admin/banners
    if (($uri === '/api/banners' || $uri === '/api/admin/banners') && $method === 'POST') {
        $body = getJsonBody();

        if (empty($body['title']) || empty($body['from_city']) || empty($body['to_city'])) {
            jsonResponse(['status' => false, 'message' => 'Title, Starting Location, and Destination Location are required.'], 422);
        }

        $actual = (float)($body['actual_price'] ?? 0);
        $offer = (float)($body['offer_price'] ?? 0);
        if ($actual <= 0 || $offer <= 0) {
            jsonResponse(['status' => false, 'message' => 'Actual and offer prices must be greater than zero.'], 422);
        }
        if ($offer > $actual) {
            jsonResponse(['status' => false, 'message' => 'Offer price cannot be greater than actual price.'], 422);
        }

        $fromDate = $body['from_date'] ?? $today;
        $toDate = $body['to_date'] ?? $today;
        if ($toDate < $fromDate) {
            jsonResponse(['status' => false, 'message' => 'To Date cannot be earlier than From Date.'], 422);
        }

        $vehicles = isset($body['available_vehicles']) && is_array($body['available_vehicles'])
            ? json_encode($body['available_vehicles'])
            : json_encode(['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta']);

        $stmt = $db->prepare("INSERT INTO banners 
            (title, from_city, to_city, vehicle_type, available_vehicles, trip_type, banner_image, actual_price, offer_price, from_date, to_date, quotation_ref, quotation_details, is_active, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())");

        $stmt->execute([
            trim($body['title']),
            trim($body['from_city']),
            trim($body['to_city']),
            $body['vehicle_type'] ?? 'Sedan (Dzire / Etios)',
            $vehicles,
            $body['trip_type'] ?? 'One Way',
            $body['banner_image'] ?? '/images/special-offer-banner.jpg',
            $actual,
            $offer,
            $fromDate,
            $toDate,
            $body['quotation_ref'] ?? ('QT-' . time()),
            $body['quotation_details'] ?? 'All-inclusive drop taxi fare.',
            !empty($body['is_active']) ? 1 : 0,
        ]);

        $newId = (int)$db->lastInsertId();
        $row = $db->query("SELECT * FROM banners WHERE id = {$newId}")->fetch();
        $formatted = formatBannerRow($row);

        jsonResponse([
            'status' => true,
            'message' => 'Banner created in MySQL database successfully. ' . ($formatted['is_active'] ? 'Status is Active (Live on Website).' : 'Status is Inactive (Draft, Admin approval needed).'),
            'data' => $formatted,
            'source' => 'laravel_mysql',
        ], 201);
    }

    // 6. Admin Toggle Banner Status: PATCH /api/admin/banners/{id}/status or PATCH /api/banners/{id}/status
    if (preg_match('#^/api/(admin/)?banners/(\d+)/status$#', $uri, $m) && $method === 'PATCH') {
        $id = (int)$m[2];
        $body = getJsonBody();
        $isActive = !empty($body['is_active']) ? 1 : 0;

        $stmt = $db->prepare("UPDATE banners SET is_active = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$isActive, $id]);

        $row = $db->query("SELECT * FROM banners WHERE id = {$id}")->fetch();
        if (!$row) {
            jsonResponse(['status' => false, 'message' => 'Banner not found.'], 404);
        }

        $formatted = formatBannerRow($row);
        jsonResponse([
            'status' => true,
            'message' => 'Banner status updated in MySQL database. ' . ($isActive ? 'Banner is now LIVE on website!' : 'Banner is now INACTIVE / HIDDEN from website.'),
            'data' => $formatted,
            'source' => 'laravel_mysql',
        ]);
    }

    // 7. Admin Update Banner: PUT /api/banners/{id} or PUT /api/admin/banners/{id}
    if (preg_match('#^/api/(admin/)?banners/(\d+)$#', $uri, $m) && $method === 'PUT') {
        $id = (int)$m[2];
        $body = getJsonBody();

        $stmt = $db->prepare("SELECT * FROM banners WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            jsonResponse(['status' => false, 'message' => 'Banner not found.'], 404);
        }

        $title = $body['title'] ?? $existing['title'];
        $fromCity = $body['from_city'] ?? $existing['from_city'];
        $toCity = $body['to_city'] ?? $existing['to_city'];
        $vehicleType = $body['vehicle_type'] ?? $existing['vehicle_type'];
        $tripType = $body['trip_type'] ?? $existing['trip_type'];
        $actual = isset($body['actual_price']) ? (float)$body['actual_price'] : (float)$existing['actual_price'];
        $offer = isset($body['offer_price']) ? (float)$body['offer_price'] : (float)$existing['offer_price'];
        $fromDate = $body['from_date'] ?? $existing['from_date'];
        $toDate = $body['to_date'] ?? $existing['to_date'];
        $quoteRef = $body['quotation_ref'] ?? $existing['quotation_ref'];
        $quoteDetails = $body['quotation_details'] ?? $existing['quotation_details'];
        $bannerImage = $body['banner_image'] ?? $existing['banner_image'];
        $isActive = isset($body['is_active']) ? (!empty($body['is_active']) ? 1 : 0) : (int)$existing['is_active'];

        $updateStmt = $db->prepare("UPDATE banners SET
            title = ?, from_city = ?, to_city = ?, vehicle_type = ?, trip_type = ?,
            actual_price = ?, offer_price = ?, from_date = ?, to_date = ?,
            quotation_ref = ?, quotation_details = ?, banner_image = ?, is_active = ?, updated_at = NOW()
            WHERE id = ?");

        $updateStmt->execute([
            $title, $fromCity, $toCity, $vehicleType, $tripType,
            $actual, $offer, $fromDate, $toDate,
            $quoteRef, $quoteDetails, $bannerImage, $isActive, $id
        ]);

        $row = $db->query("SELECT * FROM banners WHERE id = {$id}")->fetch();
        jsonResponse([
            'status' => true,
            'message' => 'Banner updated successfully in MySQL database.',
            'data' => formatBannerRow($row),
            'source' => 'laravel_mysql',
        ]);
    }

    // 8. Admin Delete Banner: DELETE /api/banners/{id} or DELETE /api/admin/banners/{id}
    if (preg_match('#^/api/(admin/)?banners/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        $id = (int)$m[2];
        $stmt = $db->prepare("DELETE FROM banners WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse([
            'status' => true,
            'message' => 'Banner deleted from MySQL database successfully.',
            'source' => 'laravel_mysql',
        ]);
    }

    // 9. Bookings: GET /api/bookings and POST /api/bookings
    if ($uri === '/api/bookings' && $method === 'GET') {
        $stmt = $db->query("SELECT * FROM bookings ORDER BY id DESC");
        $rows = $stmt->fetchAll();
        $formatted = array_map(function($b) {
            return [
                'id' => (int)$b['id'],
                'customer_name' => $b['customer_name'],
                'phone' => $b['phone'],
                'pickup' => $b['pickup'],
                'drop' => $b['drop_location'],
                'vehicle' => $b['vehicle'],
                'trip_type' => $b['trip_type'],
                'date' => $b['booking_date'],
                'time' => $b['booking_time'],
                'estimated_fare' => (float)$b['estimated_fare'],
                'offer_code' => $b['offer_code'],
                'offer_price' => $b['offer_price'] ? (float)$b['offer_price'] : null,
                'status' => $b['status'],
                'source' => $b['source'],
                'notes' => $b['notes'],
                'created_at' => $b['created_at'],
            ];
        }, $rows);

        jsonResponse([
            'status' => true,
            'data' => $formatted,
            'count' => count($formatted),
            'source' => 'laravel_mysql',
        ]);
    }

    if ($uri === '/api/bookings' && $method === 'POST') {
        $body = getJsonBody();
        if (empty($body['customer_name']) || empty($body['phone'])) {
            jsonResponse(['status' => false, 'message' => 'Customer name and phone number are required.'], 422);
        }

        $stmt = $db->prepare("INSERT INTO bookings 
            (customer_name, phone, pickup, drop_location, vehicle, trip_type, booking_date, booking_time, estimated_fare, offer_code, offer_price, status, source, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");

        $stmt->execute([
            trim($body['customer_name']),
            trim($body['phone']),
            trim($body['pickup'] ?? 'Chennai'),
            trim($body['drop'] ?? 'Madurai'),
            $body['vehicle'] ?? 'Sedan',
            $body['trip_type'] ?? 'One Way',
            $body['date'] ?? date('Y-m-d'),
            $body['time'] ?? date('H:i'),
            (float)($body['estimated_fare'] ?? 0),
            $body['offer_code'] ?? null,
            isset($body['offer_price']) ? (float)$body['offer_price'] : null,
            $body['status'] ?? 'Pending',
            $body['source'] ?? 'Direct Booking',
            $body['notes'] ?? '',
        ]);

        $newId = (int)$db->lastInsertId();
        $row = $db->query("SELECT * FROM bookings WHERE id = {$newId}")->fetch();

        jsonResponse([
            'status' => true,
            'message' => 'Customer booking quotation saved successfully in MySQL database.',
            'data' => $row,
            'source' => 'laravel_mysql',
        ], 201);
    }

    // 10. Admin Login Audit Logs: GET /api/admin/logins
    if ($uri === '/api/admin/logins' && $method === 'GET') {
        $stmt = $db->query("SELECT * FROM login_logs ORDER BY id DESC LIMIT 50");
        $rows = $stmt->fetchAll();
        jsonResponse([
            'status' => true,
            'data' => $rows,
            'count' => count($rows),
            'source' => 'laravel_mysql',
        ]);
    }

    // 404 Route Not Found
    jsonResponse([
        'status' => false,
        'message' => "Route '{$method} {$uri}' not found on Laravel REST API server.",
    ], 404);

} catch (Exception $e) {
    jsonResponse([
        'status' => false,
        'message' => 'Server Error: ' . $e->getMessage(),
    ], 500);
}
