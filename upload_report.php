<?php
// upload_report.php - Handle Patient Report Uploads (SQLite)

header('Content-Type: application/json');
require 'db.php';

// Ensure uploads directory exists
$uploadDir = 'uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Validate Request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

if (!isset($_FILES['reportFile']) || !isset($_POST['patientId'])) {
    echo json_encode(['error' => 'Missing report file or Patient ID']);
    exit;
}

$patientId = $_POST['patientId'];
$patientName = isset($_POST['patientName']) ? $_POST['patientName'] : '';
$patientEmail = isset($_POST['patientEmail']) ? $_POST['patientEmail'] : '';
$file = $_FILES['reportFile'];

// Validate File
if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'File upload error: ' . $file['error']]);
    exit;
}

$fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
if (strtolower($fileExt) !== 'pdf') {
    echo json_encode(['error' => 'Only PDF files are allowed']);
    exit;
}

// Generate New Filename
$newFilename = time() . '_' . basename($file['name']);
$targetPath = $uploadDir . $newFilename;

// Move File
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Insert into DB
    try {
        $stmt = $conn->prepare("INSERT INTO reports (patient_id, patient_name, patient_email, file_path) VALUES (:pid, :pname, :pemail, :fpath)");
        $stmt->bindValue(':pid', $patientId, SQLITE3_TEXT);
        $stmt->bindValue(':pname', $patientName, SQLITE3_TEXT);
        $stmt->bindValue(':pemail', $patientEmail, SQLITE3_TEXT);
        $stmt->bindValue(':fpath', $targetPath, SQLITE3_TEXT);
        
        $result = $stmt->execute();
        
        if ($result) {
            // Send Email to Patient with Notification
            if ($patientEmail && strlen($patientEmail) > 5) {
                require_once 'email_helper.php';
                
                $subject = "Your Medical Report is Ready - Sagarmatha Diagnostics";
                $msg = "Dear $patientName,\n\nYour diagnostic report is now available. You can view it by visiting our portal and entering your Patient ID: $patientId\n\nPortal: http://localhost:8000/reports.html\n\nThank you for choosing Sagarmatha Diagnostics.";
                
                sendEmailDirect($patientEmail, $subject, $msg);
            }

            echo json_encode(['message' => 'Report uploaded and saved successfully!', 'reportId' => $conn->lastInsertRowID()]);
        } else {
            echo json_encode(['error' => 'Failed to save report details to database']);
        }
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
             echo json_encode(['error' => 'A report for this Patient ID already exists.']);
        } else {
             echo json_encode(['error' => 'Database Error: ' . $e->getMessage()]);
        }
    }
} else {
    echo json_encode(['error' => 'Failed to move uploaded file.']);
}

$conn->close();
?>
