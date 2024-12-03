const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { engine } = require('express-handlebars');
const helmet = require('helmet');

const app = express();

// Use Helmet for security headers
app.use(helmet());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static assets

// Configure Handlebars
app.engine('handlebars', engine({ 
  defaultLayout: 'main', 
  layoutsDir: path.join(__dirname, 'views/layouts'), 
  partialsDir: path.join(__dirname, 'views/partials') 
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routes
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('pages/404', { title: 'Page Not Found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
