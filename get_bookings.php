<?php
// get_bookings.php - Fetch all bookings for admin (SQLite)

header('Content-Type: application/json');
require 'db.php';

try {
    $sql = "SELECT * FROM bookings ORDER BY created_at DESC";
    $result = $conn->query($sql);

    $bookings = [];
    if ($result) {
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            // Map columns for compatibility with admin.html if needed
            $row['test_type'] = $row['test']; 
            $row['appointment_date'] = $row['date'];
            $row['appointment_time'] = ''; // Time is already in date
            $bookings[] = $row;
        }
    }

    echo json_encode(['data' => $bookings]);
} catch (Exception $e) {
    echo json_encode(['error' => 'Database Error: ' . $e->getMessage()]);
}

$conn->close();
?>
