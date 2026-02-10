<?php
// db.php - Database Connection (SQLite)

$db_file = __DIR__ . '/lab.db';

try {
    // Create (or open) the SQLite database
    $conn = new SQLite3($db_file);
    
    // Enable exceptions for errors
    $conn->enableExceptions(true);

    // Ensure tables exist (Fallback if Node.js hasn't run yet)
    $conn->exec("CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        test TEXT,
        date TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $conn->exec("CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT UNIQUE NOT NULL,
        patient_name TEXT,
        patient_email TEXT,
        file_path TEXT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

} catch (Exception $e) {
    // Return JSON error if connection fails
    header('Content-Type: application/json');
    die(json_encode(["error" => "Database connection failed: " . $e->getMessage()]));
}
?>
