var http=require("http");
//클라이언트가 업로드 한 바이너리 데이터 처리를 위한 모듈 
var multer=require("multer"); //외부
//var oracledb = require("oracledb");//외부
var mysql=require("mysql");
var mymodule = require("./lib/mymodule.js");
var fs=require("fs");
var ejs=require("ejs");
var path=require("path"); //파일의 경로와 관련되어 유용한 기능을 보유한 모듈, 확장자를 추출하는 기능포함
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
            //path.extname(file.originalname)  의 결과는 jpg, png...
            console.log("업로드된 파일의 확장자는 ", path.extname(file.originalname));
            cb(null, new Date().valueOf()+path.extname(file.originalname));
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

//글목록 요청 처리 
app.get("/gallery/list", function(request, response){
    var con = mysql.createConnection(conStr); //접속 

    var sql="select * from gallery order by gallery_id desc"; //내림차순 
    con.query(sql, function(err, result, fields){
        if(err){
            console.log(err);
        }else{
            //ejs렌더링..
            fs.readFile("./gallery/list.ejs", "utf8", function(error, data){
                if(error){
                    console.log(error);
                }else{
                    response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                    response.end(ejs.render(data, {
                        galleryList:result, 
                        lib:mymodule
                    }));//ejs렌더링해서 넣기
                }
            });
        }
        con.end();
    }); 

});

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

//상세보기 요청 
app.get("/gallery/detail", function(request, response){
    var con=mysql.createConnection(conStr);
    var gallery_id=request.query.gallery_id;
    var sql="select * from gallery where gallery_id="+gallery_id;

    //쿼리문 수행
    con.query(sql, function(err, result, fields){   
        if(err){
            console.log(err);
        }else{
            //상세페이지 보여주기 
            fs.readFile("./gallery/detail.ejs", "utf8", function(error, data){
                if(error){
                    console.log(error);
                }else{
                    var d=ejs.render(data, {
                        gallery:result[0]  // result가 한건의 데이터만 담고 있다고 하더라도, 배열이므로...
                    });  
                    response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                    response.end(d);
                }
                con.end(); //mysql close
            });               
        }        
    });
});

//삭제 요청 처리  ( DB삭제 + 이미지삭제 ) 
app.get("/gallery/del", function(request, response){
    
    var gallery_id=request.query.gallery_id;
    var filename=request.query.filename;
    
    fs.unlink(__dirname+"/static/upload/"+filename, function(err){
        console.log("삭제완료");

    });
    
    //var gallery_id = request.body.gallery_id; //post방식의 파라미터 추출 

    //var sql="delete from gallery where gallery_id="+gallery_id;    
    response.end("");
});


var server = http.createServer(app); //기본 모듈에 express 모듈 연결 
server.listen(9999, function(){
    console.log("Gallery Server is running at 9999 port...");
});