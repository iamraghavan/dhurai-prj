const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/home', { title: 'Home' });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About Us' });
});

router.get('/contact', (req, res) => {
  res.render('pages/contact', { title: 'Contact Us' });
});

module.exports = router;
