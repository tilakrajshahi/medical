<?php
// get_report.php - Fetch Patient Report (SQLite)

header('Content-Type: application/json');
require 'db.php';

if (!isset($_GET['patientId'])) {
    echo json_encode(['error' => 'Missing Patient ID']);
    exit;
}

$patientId = $_GET['patientId'];

try {
    $stmt = $conn->prepare("SELECT * FROM reports WHERE patient_id = :pid");
    $stmt->bindValue(':pid', $patientId, SQLITE3_TEXT);
    $result = $stmt->execute();
    
    $row = $result->fetchArray(SQLITE3_ASSOC);
    
    if ($row) {
        echo json_encode($row);
    } else {
        header("HTTP/1.1 404 Not Found");
        echo json_encode(['message' => 'Report not found.']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Database Error: ' . $e->getMessage()]);
}

$conn->close();
?>
