var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// schema
var userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,'아이디를 적어주세요.'],
    match:[/^.{4,12}$/,'아이디는 4~6자 사이로 적어주세요.'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'패스워드를 적어주세요.'],
    select:false //select:false : DB에서 불러오지 않음 
  },
  name:{
    type:String,
    required:[true,'이름을 적어주세요.'],
    match:[/^.{2,12}$/,'이름은 2~12자 사이로 적어주세요.'],
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'이메일 형식에 맞게 적어주세요.'],
    trim:true
  }
},{
  toObject:{virtuals:true}
});



// virtuals ->DB에 저장되지 않는 값
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

 userSchema.virtual('authCode') 
  .get(function(){return this._authCode; })
  .set(function(value){this._authCode=value});

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = '비밀번호는 최소 8글자의 영어와 숫자를 조합하여 적어주세요.';
userSchema.path('password').validate(function(v) {
  var user = this;



  // create user
  if(user.isNew){

    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', '비밀번호 확인을 입력해 주세요.');
    }

    if(!passwordRegex.test(user.password)){
      user.invalidate('password', passwordRegexErrorMessage);
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '비밀번호가 일치하지 않습니다.');
    }
    if(!user.authCode){
      user.invalidate('authConfirmation', '인증코드를 입력해 주세요.');
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', '기존 비밀번호를 입력해 주세요.');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate('currentPassword', '비밀번호가 다릅니다.');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMessage);
    }
    else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '비밀번호가 일치하지 않습니다.');
    }
  }
});

// hash password
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
