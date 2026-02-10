<?php
// process_booking.php - Handle Booking Form Submission (SQLite)

header('Content-Type: application/json');
require 'db.php';

// Get JSON Input
$data = json_decode(file_get_contents("php://input"), true);

// Validate Input
if (!isset($data['name']) || !isset($data['phone']) || !isset($data['test_type']) || !isset($data['date']) || !isset($data['time'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$name = $data['name'];
$phone = $data['phone'];
$test = $data['test_type'];
$date = $data['date'] . ' ' . $data['time']; // Combine date and time
$message = isset($data['message']) ? $data['message'] : '';

// Insert into Database using Prepared Statement
try {
    $stmt = $conn->prepare("INSERT INTO bookings (name, phone, test, date) VALUES (:name, :phone, :test, :date)");
    $stmt->bindValue(':name', $name, SQLITE3_TEXT);
    $stmt->bindValue(':phone', $phone, SQLITE3_TEXT);
    $stmt->bindValue(':test', $test, SQLITE3_TEXT);
    $stmt->bindValue(':date', $date, SQLITE3_TEXT);
    
    $result = $stmt->execute();

    if ($result) {
        // Send Email notification to Admin (Gmail SMTP)
        require_once 'email_helper.php';
        
        $to = "tilakthakury@gmail.com";
        $subject = "New Lab Booking Received - Sagarmatha Diagnostics";
        $email_content = "You have a new booking from: $name\n";
        $email_content .= "Phone: $phone\n";
        $email_content .= "Test Type: $test\n";
        $email_content .= "Date/Time: $date\n";
        $email_content .= "Message: $message\n\n";
        $email_content .= "Manage this booking at: http://localhost:8000/admin.html";

        sendEmailDirect($to, $subject, $email_content);

        echo json_encode(['success' => 'Booking confirmed successfully']);
    } else {
        echo json_encode(['error' => 'Failed to execute query']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Database Error: ' . $e->getMessage()]);
}

$conn->close();
?>
