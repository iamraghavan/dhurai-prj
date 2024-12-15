const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { engine } = require('express-handlebars');
const helmet = require('helmet');

const exphbs = require('express-handlebars');
const helpers = require('handlebars-helpers')();

// Initialize Firebase and routes
const firebaseAdmin = require('firebase-admin');
require('dotenv').config();

const app = express();

const handlebars = exphbs.create({
  helpers: helpers
});

// Set Handlebars as the view engine
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Firebase Admin SDK setup
const serviceAccount = require('./firebase-service-account.json'); // Ensure this file is in the root directory
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://portfolio-4bf1c-default-rtdb.firebaseio.com" // Replace with your Firebase database URL
});

const db = firebaseAdmin.database();

// Use Helmet for security headers
app.use(helmet());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // for parsing application/json
app.use(express.static(path.join(__dirname, 'public'))); // Serve static assets

// Configure Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes); // Ensure routes are used here

// Error handling middleware for 404 errors
app.use((req, res, next) => {
  res.status(404).render('pages/404', { title: 'Page Not Found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
