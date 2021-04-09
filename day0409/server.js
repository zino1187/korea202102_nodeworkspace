var http = require("http");
var express = require("express");
var fs=require("fs");
var ejs =require("ejs"); 

var app = express();

//게시판 목록 요청 처리 
app.get("/comments/list", function(request, response){

});

var server = http.createServer(app);
server.listen(8888, function(){
    console.log("The Server with Oracle is running at 8888 port...");
});
