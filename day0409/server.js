var http = require("http");
var express = require("express"); //외부-설치
var fs=require("fs");
var ejs =require("ejs"); //외부-설치
var oracledb=require("oracledb");//외부-설치
var app = express();

//이 시점 이후 부터는 conStr변수의 값은 변할 수 없다~~(상수화 시킴)
const conStr={
    user:"node",
    password:"node",
    connectString:"localhost/XE"
};

//게시판 목록 요청 처리 
app.get("/comments/list", function(request, response){
    //클라이언트가 전송한 파라미터 받기!!!
    var currentPage = request.query.currentPage; //클라이언트가 보기를 원하는 페이지수
    
    //게시판의 최초 접속이라면, currentPage정보가 없기 때문에 1페이지로 간주함
    if(currentPage==undefined){ 
        currentPage=1;
    }
    console.log("currentPage ", currentPage);

    oracledb.getConnection(conStr, function(err, con){
        if(err){
            console.log("접속실패",err);
        }else{
            console.log("접속성공");
        }
    }); //오라클 접속 및 접속객체 가져오기

    fs.readFile("./comments/list.ejs", "utf8", function(error, data){
        if(error){
            console.log(error);
        }else{
            var r = ejs.render(data,{
                //ejs에 넘겨줄 데이터 지정 
                param:{
                    page:currentPage
                }
            }); //ejs 해석 및 실행하기!!
            response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
            response.end(r); //실행한 결과 전송하기!!
        }
    });

});

var server = http.createServer(app);
server.listen(8888, function(){
    console.log("The Server with Oracle is running at 8888 port...");
});
