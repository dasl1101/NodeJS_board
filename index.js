var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();
var path = require('path');
var logger = require('./config/tracer');
var cookieParser = require('cookie-parser');
var Counter = require('./models/Counter');

// DB setting
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
});

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));
app.use(cookieParser());
app.use(countVisitors);

// Passport
app.use(passport.initialize());
app.use(passport.session());

//tracer
app.use(function(req, res, next) {
  res.locals.logger = logger;
  next();
});



// Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.util = util;
  next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.use('/comments', util.getPostQueryString, require('./routes/comments'));
app.use('/files', require('./routes/files'));
app.use('/img', express.static(path.join(__dirname, 'img')));


// Port setting
var port = 3001;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});

//countVisitors
function countVisitors(req,res,next){
  if(!req.cookies.count&&req.cookies['connect.sid']){ //connect.sid:브라우저가 쿠키 사용 금지인지 확인하는 쿠키
    res.cookie('count', "", { maxAge: 3600000, httpOnly: true });
    var now = new Date();
    var date = now.getFullYear() +"/"+ now.getMonth() +"/"+ now.getDate();
    if(date != req.cookies.countDate){
      res.cookie('countDate', date, { maxAge: 86400000, httpOnly: true });

      Counter.findOne({name:"vistors"}, function (err,counter) {
        if(err) return next();
        if(counter===null){
          Counter.create({name:"vistors",totalCount:1,todayCount:1,date:date});
        } else {
          counter.totalCount++;
          if(counter.date == date){
            counter.todayCount++;
          } else {
            counter.todayCount = 1;
            counter.date = date;
          }
          counter.save();
        }
      });
    }
  }
  return next();
}

