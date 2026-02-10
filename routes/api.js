const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const nodemailer = require('nodemailer');

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Append extension
    }
});

const upload = multer({ storage: storage });

// Email Configuration (Gmail)
const MY_EMAIL = process.env.EMAIL_USER || 'tilakthakury@gmail.com';
const MY_PASSWORD = process.env.EMAIL_PASS || 'kwjr gxqk aoam hawq';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: MY_EMAIL,
        pass: MY_PASSWORD
    }
});

async function sendEmail({ to, subject, text, attachments = [] }) {
    try {
        let info = await transporter.sendMail({
            from: `"Sagarmatha Diagnostics" <${MY_EMAIL}>`,
            to: to,
            subject: subject,
            text: text,
            attachments: attachments
        });
        console.log("Message sent to %s: %s", to, info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Rethrow to let the caller handle it
    }
}


// --- Routes ---

// 1. Submit Booking
router.post('/book', (req, res) => {
    const { name, email, phone, text, date } = req.body;

    // Insert into DB
    const sql = `INSERT INTO bookings (name, phone, test, date) VALUES (?, ?, ?, ?)`;
    const params = [name, phone, text || 'General Inquiry', date || new Date().toISOString().split('T')[0]];

    db.run(sql, params, function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }

        // Notify Admin (Receive at your Gmail)
        if (MY_EMAIL.includes('@')) {
            sendEmail({
                to: MY_EMAIL, // Send to yourself
                subject: "New Test Booking Received",
                text: `New booking from ${name}.\nPhone: ${phone}\nTest: ${text}\nDate: ${date}`
            }).catch(console.error);
        } else {
            console.log("Email skipped: Password not set.");
        }

        res.json({
            message: "Booking submitted successfully!",
            bookingId: this.lastID
        });
    });
});

// 2. Upload Report (Admin only - simplified no auth for now)
router.post('/upload-report', upload.single('reportFile'), (req, res) => {
    const { patientId, patientName, patientEmail } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = file.path;

    const sql = `INSERT INTO reports (patient_id, patient_name, patient_email, file_path) VALUES (?, ?, ?, ?)`;
    const params = [patientId, patientName, patientEmail, filePath];

    db.run(sql, params, function (err) {
        if (err) {
            // Handle unique constraint violation for patient_id
            if (err.message.includes('UNIQUE constraint failed')) {
                // Determine if we update instead? For now, error.
                return res.status(409).json({ error: "Report for this Patient ID already exists." });
            }
            return res.status(500).json({ error: err.message });
        }

        // Send Email to Patient with Report (Only if password is seemingly set)
        if (patientEmail && MY_PASSWORD && MY_PASSWORD.length > 5) {
            sendEmail({
                to: patientEmail,
                subject: "Your Medical Report is Ready - Sagarmatha Diagnostics",
                text: `Dear ${patientName},\n\nYour diagnostic report is ready. Please find it attached.\n\nThank you for choosing us.`,
                attachments: [{ path: filePath }]
            }).catch(console.error);
        }

        res.json({
            message: "Report uploaded and sent successfully!",
            reportId: this.lastID
        });
    });
});

// 3. Get Report (Patient Portal)
router.get('/report/:patientId', (req, res) => {
    const { patientId } = req.params;

    const sql = `SELECT * FROM reports WHERE patient_id = ?`;

    db.get(sql, [patientId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: "Report not found." });
        }
        res.json(row);
    });
});

// 4. Get All Bookings (For Admin Dashboard)
router.get('/bookings', (req, res) => {
    const sql = "SELECT * FROM bookings ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// 5. Proxy Email (Used by PHP backend)
router.post('/proxy-email', async (req, res) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ error: "Missing to, subject, or text" });
    }

    try {
        await sendEmail({ to, subject, text });
        res.json({ message: "Email sent successfully via Node.js proxy" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
