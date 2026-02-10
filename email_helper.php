<?php
// email_helper.php - Email Proxy for PHP (delegates to Node.js backend)

function sendEmailDirect($to, $subject, $message, $from = 'Sdclab2024@gmail.com') {
    $proxy_url = 'http://localhost:3000/api/proxy-email';
    
    $data = array(
        'to' => $to,
        'subject' => $subject,
        'text' => $message
    );

    $options = array(
        'http' => array(
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data),
            'timeout' => 10
        )
    );

    $context  = stream_context_create($options);
    
    try {
        $result = @file_get_contents($proxy_url, false, $context);
        
        if ($result === FALSE) {
            error_log("Email Proxy Failed: Could not connect to Node.js server at $proxy_url");
            return false;
        }

        $response = json_decode($result, true);
        return isset($response['message']);
        
    } catch (Exception $e) {
        error_log("Email Proxy Exception: " . $e->getMessage());
        return false;
    }
}
?>
