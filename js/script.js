// Backend API URL (Change this to your live server URL after deployment)
const BASE_URL = ''; // Leave empty for local development, e.g., 'https://medical-server.onrender.com'

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    // Booking Form Submission
    const bookingForm = document.getElementById('booking-form');
    const bookingConfirmation = document.getElementById('booking-confirmation');

    if (bookingForm) {
        // Pre-select package from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const packageParam = urlParams.get('package');
        if (packageParam) {
            const select = document.getElementById('test-type');
            if (select) {
                select.value = packageParam;
            }
        }

        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Gather Data
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const testType = document.getElementById('test-type').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const message = document.getElementById('message').value;

            // UI Feedback
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = 'Processing...';

            try {
                const response = await fetch(`${BASE_URL}/api/book`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        phone: phone,
                        text: testType,
                        date: date + ' ' + time,
                        message: message
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    bookingForm.style.display = 'none';
                    bookingConfirmation.style.display = 'block';
                    document.getElementById('patient-name-display').innerText = name;
                    bookingConfirmation.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert('Error: ' + (result.error || 'Failed to book. Please try again.'));
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;
                }
            } catch (error) {
                console.error(error);
                alert('Network error. Please check your connection.');
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }

    // Reports Form Submission
    const reportForm = document.getElementById('report-form');
    const reportResult = document.getElementById('report-result');

    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const patientId = document.getElementById('patient-id').value.trim();
            const submitBtn = reportForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            if (!patientId) return;

            submitBtn.disabled = true;
            submitBtn.innerText = 'Searching...';

            try {
                const response = await fetch(`${BASE_URL}/api/report/${patientId}`);

                if (response.ok) {
                    const data = await response.json();

                    // Populate Report Card
                    const html = `
                        <div class="report-card">
                            <h4><i class="fas fa-file-medical-alt" style="color: var(--primary-color);"></i> Lab Report - #${data.patient_id}</h4>
                            <p style="margin: 5px 0;"><strong>Patient:</strong> ${data.patient_name}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(data.upload_date).toLocaleDateString()}</p>
                            <p style="margin: 10px 0; color: green;"><i class="fas fa-check-circle"></i> Report Available</p>
                            <div style="margin-top: 15px;">
                                <a href="/${data.file_path}" target="_blank" class="btn" style="padding: 5px 15px; font-size: 0.9rem;"><i class="fas fa-eye"></i> View / Download</a>
                            </div>
                        </div>
                    `;

                    reportResult.innerHTML = html;
                    reportResult.style.display = 'block';
                    reportResult.scrollIntoView({ behavior: 'smooth' });

                    // Clear error styling if any
                    reportResult.style.borderTop = "1px solid #eee";

                } else {
                    // Report Not Found
                    reportResult.innerHTML = `<p style="color: red; text-align: center; margin-top: 20px;"><i class="fas fa-exclamation-circle"></i> No report found for ID: <strong>${patientId}</strong></p>`;
                    reportResult.style.display = 'block';
                }

            } catch (error) {
                console.error(error);
                reportResult.innerHTML = `<p style="color: red; text-align: center;">System Error. Please try again later.</p>`;
                reportResult.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = 'Sending...';

            setTimeout(() => {
                alert('Thank you for contacting us! We will get back to you shortly.');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }, 1500);
        });
    }
});
