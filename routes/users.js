var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');
var transport = require('../transport/mail');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// New
router.get('/new', function (req, res) {
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  console.log('user.authCode: '+user.authCode);
  res.render('users/new', { user: user, errors: errors });
  
});


// create
router.post('/', function (req, res) {
  User.create(req.body, function (err, user) {
    console.log(user);
    if (err) {
      req.flash('user', req.body);
      console.log(req.body);
      req.flash('errors', util.parseError(err));
      console.log('errors: '+err);
      return res.redirect('/users/new');
    }
    res.redirect('/');
  });
});

// show
router.get('/:username', util.isLoggedin, checkPermission, function (req, res) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) return res.json(err);
    res.render('users/show', { user: user });
  });
});

var state = {
  createdAuthCode: ""
}

//mail
router.post('/new/sendMail', function (req, res, next) {

  state.createdAuthCode = Math.random().toString(36).substr(2, 6);//랜덤문자열 6자리
  var auth = state.createdAuthCode;
  var email = req.body.data;
  console.log('authCode = ' + state.createdAuthCode);
  transport.sendMail({
    from: `고양이 이야기 <ektmf1101@naver.com>`,
    to: email,
    subject: '[고양이 이야기] 인증코드가 도착했습니다.',
    text: '',
    html: `
      <div style="text-align: center;">
        <h3 style="color: #FA5882">아래 인증코드를 입력해 주세요.</h3>
        <br />
        <h2>${auth}</h2>
      </div>
    `})
    .then(send => res.json(send))
    .catch(err => next(err))
});


router.post('/new/authCode', function (req, res) {
  var authCode = req.body.data;
  console.log('입력한authCode = ' + authCode);
  console.log('인증코드 = ' + state.createdAuthCode);
  if (state.createdAuthCode===authCode) {
    res.send({data:authCode});
  }
});



// edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function (req, res) {
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if (!user) {
    User.findOne({ username: req.params.username }, function (err, user) {
      if (err) return res.json(err);
      res.render('users/edit', { username: req.params.username, user: user, errors: errors });
    });
  }
  else {
    res.render('users/edit', { username: req.params.username, user: user, errors: errors });
  }
});

// update
router.put('/:username', util.isLoggedin, checkPermission, function (req, res, next) {
  User.findOne({ username: req.params.username })
    .select('password')
    .exec(function (err, user) {
      if (err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword ? req.body.newPassword : user.password;
      for (var p in req.body) {
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function (err, user) {
        if (err) {
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/' + req.params.username + '/edit');
        }
        res.redirect('/users/' + user.username);
      });
    });
});

module.exports = router;

// private functions
function checkPermission(req, res, next) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) return res.json(err);
    if (user.id != req.user.id) return util.noPermission(req, res);

    next();
  });
}
