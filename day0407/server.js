/*
Node.js의 기본 모듈만으로는, 서버를 구축할 수 는 있으나, 개발자가 처리해야할 업무가 너무 많고 
효율성이 떨어진다..따라서 기본 모듈외에, http모듈을 좀더 개선한 express모듈을 사용해보자!!
주의) http 기본 모듈이 사용되지 않는 것이 아니라, 이 기본 모듈에 express 모듈을 추가해서 사용한다

[ express 모듈의 특징 ]
1) 정적자원에 대한 처리가 이미 지원된다...즉 개발자가 각 자원마다 1:1대응하는 코드를 작성할 필요가 없다
    html, image, css, sound, mp4, js(클라이언트 측), txt 서버에서 실행되지 않는 모든 리소스~!!!!
2) Get / Post 등의 http요청에 대한 파라미터 처리가 쉽다
3) 미들웨어라 불리는 use() 메서드를 통해 기능을 확장한다!!
*/
var http=require("http");
var express = require("express");
var static=require("serve-static"); //정적자원을 쉽게 접근하기 위한 미들웨어 추가 
var fs=require("fs");//file system 모듈 가져오기
var ejs=require("ejs");//서버 측 스크립트인 ejs 관련된 모듈!!
var mysql = require("mysql");
var mymodule=require("./lib/mymodule.js");

var app = express();//express 모듈통해 객체 생성 

//mysql 접속 정보 
var conStr={
    url:"localhost:3306",
    user:"root",
    password:"1234",
    database:"nodejs"        
};

//서버의 정적자원에 접근을 위해 static() 미들웨어를 사용해본다!!  <--> dynamic(동적)
//__dirname 전역변수는?  현지 실행중인 js 파일의 디렉토리 위치를 반환
//즉 현재 실행중인 server.js 의 디렉토리를 반환!!
app.use(static(__dirname+"/static")); //static을 정적자원이 있는 루트로 지정
app.use(express.urlencoded({
    extended:true
})); //post방식의 데이터를 처리할 수 있도록

/*-----------------------------------------------------------------------
클라이언트의 요청 처리!!!! 요청url 에 대한 조건문X, 정적자원에 대한 처리필요X
DML업무를 CRUD로 얘기하기도 함
Create(=insert), Read(=select), Update, Delete  
-----------------------------------------------------------------------*/
app.get("/notice/list", function(request, response){

    var con = mysql.createConnection(conStr);//접속시도 후, Connection 객체 반환
    //select 문 수행하자!!
    con.query("select * from notice order by notice_id desc", function(error, result, fields){
        if(error){
            console.log(error);//에러 분석을 위해 콘솔화면에 로그를 남김
        }else{
            //console.log("result는 ", result);
            //console.log("fields ", fields);

            fs.readFile("./notice/list.ejs","utf8", function(err, data){
                response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                //읽기만 하는게 아니라, 서버에서 실행까지 해야 하므로, render() 메서드를 이용하여 %%영역을
                //클라이언트에게 보내기 전에, 서버측에서 먼저 실행을 해버리자!!
                response.end(ejs.render(data,{
                    noticeList:result,
                    lib:mymodule
                }));
            });
        }
        con.end();//mysql 접속 끊기
    });
});

//지정한 url의 post 방식으로 클라이언트의 요청을 받음
app.post("/notice/regist", function(request ,response){
    //1) 클라이언트가 전송한 파라미터들을 받자!!!
    console.log(request.body);
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;

    //2) mysql 접속 후  connection객체 반환
    var con=mysql.createConnection(conStr);

    //3) 쿼리실행 
    /*
    var sql="insert into notice(title, writer, content) ";
    sql+=" values('"+title+"','"+writer+"','"+content+"')";
    */
    //바인드 변수를 이용하면, 따옴표문제를 고민하지 않아도 됨. 단 주의!!
    //바인드 변수의 사용목적은 따옴표 때문이 아니라, DB의 성능과 관련있다..(java시간에...)
    var sql="insert into notice(title, writer, content) values(?,?,?)";

    con.query(sql, [title, writer, content], function(err, fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
            response.end("<script>alert('등록성공');location.href='/notice/list';</script>");
        }
        con.end();//mysql 접속 끊기
    });
});

//목록요청  처리 
app.get("/notice/detail", function(request, response){
    
    var sql="select * from notice where notice_id="+변수; 

});


var server = http.createServer(app);//http 서버에 expess모듈을 적용
server.listen(8989, function(){
    console.log("The server using Express module is running at 8989...");
});
