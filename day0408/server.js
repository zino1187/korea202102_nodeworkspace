var http=require("http");
var express = require("express");

var app = express();//express객체 생성 

//필요한 각종 미들웨어 적용 
app.use(express.static(__dirname+"/static"));

var server = http.createServer(app); //기본 모듈에 express 모듈 연결 
server.listen(9999, function(){
    console.log("Gallery Server is running at 9999 port...");
});