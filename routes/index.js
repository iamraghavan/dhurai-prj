const express = require('express');
const router = express.Router();
const firebaseAdmin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const serviceAccount = require('../firebase-service-account.json'); // Ensure this file is in the root directory

// Initialize Firebase Admin SDK only if it's not already initialized
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://portfolio-4bf1c-default-rtdb.firebaseio.com" // Replace with your Firebase database URL
  });
} else {
  firebaseAdmin.app(); // Use the already initialized app
}

const db = firebaseAdmin.database();

// Render Home page
router.get('/', (req, res) => {
  res.render('pages/home', { title: 'Home' });
});

// Render About page
router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About Us' });
});


// Render Contact Us page (can be an alias for /contact)
router.get('/contact-us', (req, res) => {
  res.render('pages/contact', { title: 'Contact us' });
});


router.get('/services/paid-search', (req, res) => { 
  res.render('pages/services/paid-search', { title: 'Paid Search' });
});

router.get('/services/amazon', (req, res) => {
  res.render('pages/services/amazon', { title: 'Amazon Ads' });
});

router.get('/services/lead-generation', (req, res) => {
  res.render('pages/services/lead-generation', { title: 'Lead Generation' });
});

router.get('/services/seo', (req, res) => {
  res.render('pages/services/seo', { title: 'SEO' });
});

router.get('/services/lifecycle-marketing', (req, res) => {
  res.render('pages/services/lifecycle-marketing', { title: 'Lifecycle Marketing' });
});

router.get('/services/ecommerce', (req, res) => {
  res.render('pages/services/ecommerce', { title: 'Ecommerce' });
});


router.get('/services/paid-social', (req, res) => {
  res.render('pages/services/paid-social', { title: 'Paid Social' });
});

router.get('/services/creative-services', (req, res) => {
  res.render('pages/services/creative-services', { title: 'Creative Services' });
});

router.get('/contact', async (req, res) => {
  const status = req.query.status;
  const enquiry_id = req.query.id;

  let enquiryDetails = null;

  if (status === 'success' && enquiry_id) {
    try {
      // Fetch the enquiry details from Firebase using the enquiry_id
      const enquiryRef = db.ref('messages').orderByChild('enquiry_id').equalTo(enquiry_id);
      const snapshot = await enquiryRef.once('value');
      
      if (snapshot.exists()) {
        const enquiryData = snapshot.val();
        const enquiry = Object.values(enquiryData)[0]; // Assuming only one record with the matching enquiry_id
        enquiryDetails = enquiry;
      } else {
        console.log("No data found for enquiry_id:", enquiry_id);
      }
    } catch (error) {
      console.log('Error fetching enquiry details:', error);
    }
  }

  // Debugging: Check if enquiryDetails is populated correctly
  console.log('Enquiry Details:', enquiryDetails);

  // Render the acknowledgement page with the details
  res.render('pages/acknowledgement', {
    title: enquiryDetails ? `Acknowledgement for ${enquiryDetails.name}` : 'Contact Us',
    status,
    enquiry_id,
    enquiryDetails
  });
});

// Handle form submission for contact
router.post('/contact/submit', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    // Generate a unique enquiry ID
    const enquiry_id = uuidv4();

    // Get the current date in DD:MM:YYYY format
    const currentDate = new Date();
    const date_of_enquiry = `${String(currentDate.getDate()).padStart(2, '0')}:${String(currentDate.getMonth() + 1).padStart(2, '0')}:${currentDate.getFullYear()}`;

    // Default status
    const status = "open";

    // Save data to Firebase
    const newMessageRef = db.ref('messages').push();
    await newMessageRef.set({
      enquiry_id,  // Unique ID for the enquiry
      name,
      email,
      phone,
      subject,
      message,
      date_of_enquiry,  // Date in DD:MM:YYYY format
      status,           // Default status as 'open'
      timestamp: firebaseAdmin.database.ServerValue.TIMESTAMP // Firebase server timestamp
    });

    // Send email with form details, now passing date_of_enquiry
    sendEmail(name, email, phone, subject, message, date_of_enquiry);

    // Redirect to success page with enquiry_id
    res.redirect(`/contact?status=success&id=${enquiry_id}`);
  } catch (error) {
    console.log('Error processing form:', error);
    res.status(500).send('An error occurred');
  }
});

// Function to send email with the form details
function sendEmail(name, email, phone, subject, message, date_of_enquiry) {
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT === '465', // Use SSL
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const emailTemplate = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
          }
          .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 10px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .body {
            padding: 20px;
            line-height: 1.6;
          }
          .footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 10px;
            font-size: 14px;
          }
          .footer a {
            color: #007bff;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .container {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="body">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Date of Enquiry:</strong> ${date_of_enquiry}</p>
          </div>
          <div class="footer">
            <p>Thank you for reaching out to us! We'll get back to you as soon as possible.</p>
            <p><a href="http://jsraghavan.me" target="_blank">Visit our website</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: 'letstalk@bumblebees.co.in', // Sender address
    to: 'duraiprofile@gmail.com',
    bcc: 'raghavanofficials@gmail.com',
    subject: `New Contact Form Submission: ${subject}`,
    html: emailTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}



module.exports = router;