const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
const helmet = require('helmet');
require('dotenv').config();
// Upadated
const app = express();

// Use Helmet for security headers
app.use(helmet());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve the 'assets' folder inside 'public' folder as static
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Set Handlebars as the view engine
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
