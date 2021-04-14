/*쇼핑몰 개발환경 구축 먼저 하자 */
var http = require("http");
var express=require("express");
var static = require("serve-static");//정적자원 처리를 위한 외부모듈 (설치)
var ejs=require("ejs"); //설치
var mysql=require("mysql"); //설치
var mymodule=require("./lib/mymodule.js");

const conStr={
    url:"localhost",
    user:"root",
    password:"1234",
    database:"shoppingmall"
};

var app = express();

app.use(static(__dirname+"/static")); //정적자원의 최상위 루트를 설정 
app.use(express.urlencoded({
    extended:true
}));//post 요청의 파라미터 받기위함

//템플릿 뷰 엔진 등록 (서버 스크립트의 위치 등록)
app.set("view engine","ejs"); //등록 후엔 자동으로 무도건 views 라는 디렉토리 하위에서
//ejs를 찾아나선다.따라서 views라는 정해진 디렉토리를 무조건 존재시켜야 한다!!

//관리자모드 로그인 폼 요청 
app.get("/admin/loginform", function(request, response){
    response.render("admin/login");
});

//관리자 로그인 요청 처리 
app.post("/admin/login", function(request, response){
    var master_id=request.body.master_id;
    var master_pass=request.body.master_pass;
    console.log(master_id);
    console.log(master_pass);

    var sql="select * from admin where master_id=? and master_pass=?";

    var con=mysql.createConnection(conStr);
    con.query(sql, [master_id, master_pass] , function(err,  result , fields){
        if(err){
            console.log("조회 실패", err);
        }else{
            //console.log("result는 ",result);
            //로그인이 일치 하는지 않하는지? 
            
            if(result.length <1){
                console.log("로그인 실패");
                //이전 화면으로 강제로 되돌리기  history.back()
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(mymodule.getMsgBack("로그인 정보가 올바르지 않습니다"));
            }else{
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(mymodule.getMsgUrl("로그인성공","/admin/main"));
            }
        }
        con.end();
    });
});

//관리자 모드 메인 요청 처리 
app.get("/admin/main", function(request, response){
    response.render("admin/main");
});

var server = http.createServer(app);
server.listen(9999, function(){
    console.log("Shopping mall is running at 9999 port...");
});
