var fs = require('fs');

var logger = require('tracer').colorConsole({
  transport: function(data) {
    console.log(data.output);
    // logs 폴더에 로그 파일을 생성할 것이므로 폴더를 미리 만들어 놓아야 한다!
    fs.appendFile('logs/'+getTodayFormat()+'.log', data.rawoutput + '\n', err => {
      if (err) throw err
    });
  }
});

function getTodayFormat() {
  let today = new Date();

  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1;  // 월
  let date = today.getDate();  // 날짜
  // let day = today.getDay();  // 요일

  let format = year + '-' + (((month+'').length === 1)?'0':'')+month + '-' + (((date+'').length === 1)?'0':'')+date; // ex) 2021-08-24

  return format;
}

module.exports = logger;