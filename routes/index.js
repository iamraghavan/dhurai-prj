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


// Render Paid Search Services page
router.get('/services/paid-search', (req, res) => { 
  console.log('Rendering Paid Search page');
  res.render('pages/services/paid-search', { title: 'Paid Search' });
});

// Render Contact Us page (can be an alias for /contact)
router.get('/contact-us', (req, res) => {
  res.render('pages/contact', { title: 'Contact us' });
});

// Handle form submission for contact

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

    // Send email with form details
    sendEmail(name, email, phone, subject, message);

    // Redirect to success page with enquiry_id
    res.redirect(`/contact?status=success&id=${enquiry_id}`);
  } catch (error) {
    console.log('Error processing form:', error);
    res.status(500).send('An error occurred');
  }
});

// Function to send email with the form details
function sendEmail(name, email, phone, subject, message) {
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

  const mailOptions = {
    from: 'letstalk@bumblebees.co.in', // Sender address
    to: 'duraiprofile@gmail.com',
    bcc: 'raghavanofficials@gmail.com',
    subject: `New Contact Form Submission: ${subject}`,
    text: `You have a new message from ${name} (${email}).\n\nPhone: ${phone}\nSubject: ${subject}\n\nMessage:\n${message}`
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
