const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//get fail page
router.get('/fail', function(req, res, next) {
  res.render('fail');
});

module.exports = router;