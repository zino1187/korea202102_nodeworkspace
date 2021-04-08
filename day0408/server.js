var http=require("http");
//클라이언트가 업로드 한 바이너리 데이터 처리를 위한 모듈 
var multer=require("multer"); //외부
//var oracledb = require("oracledb");//외부
var mysql=require("mysql");
var mymodule = require("./lib/mymodule.js");

var express = require("express");

var app = express();//express객체 생성 

//필요한 각종 미들웨어 적용 
app.use(express.static(__dirname+"/static"));

//업로드 모듈을 이용한 업로드 처리  destination:저장할 곳,  filename:저장할 이름
var upload = multer({
    storage: multer.diskStorage({
        destination:function(request, file, cb){
            cb(null, __dirname+"/static/upload");
        },
        filename:function(request, file, cb){
            console.log("file is ", file);
            //업로드한 파일에 따라서 파일 확장자는 틀려진다..프로그래밍적으로 정보를 추출해야 한다!!
            cb(null, file.originalname);
        }
    })    
});

//mysql 접속 정보 
var conStr={
    url:"localhost:3306",
    user:"root",
    password:"1234",
    database:"nodejs"
};

//글등록 요청 처리 
app.post("/gallery/regist", upload.single("pic") , function(request , response){
    //파라미터 받기 
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    var filename=request.file.filename;//multer를 이용했기 때문에 기존의 request객체에 추가된 것임!!

    console.log("filename 는 ", filename);

    var con=mysql.createConnection(conStr);
    var sql="insert into gallery(title, writer, content, filename) values(?,?,?,?)";
    con.query(sql, [title, writer, content, filename] , function(error, fields){
        if(error){
            console.log(error);
        }else{
            response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("등록완료", "/gallery/list"));
        }
        con.end(); //mysql 접속 해제
    });
});

var server = http.createServer(app); //기본 모듈에 express 모듈 연결 
server.listen(9999, function(){
    console.log("Gallery Server is running at 9999 port...");
});