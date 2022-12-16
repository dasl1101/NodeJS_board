var express = require('express');
var router = express.Router();
var passport = require('../config/passport');

// Home
router.get('/', function(req, res){
  var Counter = require('../models/Counter');
  var vistorCounter = null;
  Counter.findOne({name:'vistors'}, function (err,counter) {
    if(!err) vistorCounter = counter;
  });
  res.render('home/welcome', {counter:vistorCounter});
  console.log("counter: "+ vistorCounter);
  });

router.get('/about', function(req, res){
  res.render('home/about');
});

// Login
router.get('/login', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username:username,
    errors:errors
  });
});

// Post Login
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.username){
      isValid = false;
      errors.username = '이름은 필수항목입니다.';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = '비밀번호는 필수항목입니다.';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors',errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/posts',
    failureRedirect : '/login'
  }
));

// Logout
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
