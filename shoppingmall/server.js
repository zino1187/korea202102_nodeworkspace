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


//상품 관리 페이지 요청 처리 
app.get("/admin/product/registform", function(request, response){
    var sql="select * from topcategory";

    var con = mysql.createConnection(conStr);
    con.query(sql, function(err, result, fields){
        if(err){
            console.log("상위 카테고리 조회 실패", err);
        }else{
            console.log(result);
            response.render("admin/product/regist", {
                record:result /*배열을 ejs에 전달*/
            });            
        }                 
        con.end();        
    });
});

//선택된 상위카테고리에 소속된 하위카테고리 목록가져오기 
//이 요청은 클라이언트가 비동기로 요청해야 됨...
//그래야, 결과 전달시 하위 카테고리만 전달하면 되니깐...
app.get("/admin/product/sublist", function(request, response){
    
    var topcategory_id = request.query.topcategory_id; //파라미터 받기
    var sql="select * from subcategory where topcategory_id="+topcategory_id;

    //쿼리문 실행~~~~
    var con = mysql.createConnection(conStr);
    con.query(sql, function(err, result, fields){
        if(err){
            console.log("하위목록 가져오기 실패", err);
        }else{
            console.log("result is ", result);
            //어떤 페이지를 보여줘야 하나?
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(JSON.stringify(result));
        }
        con.end();
    });
});

var server = http.createServer(app);
server.listen(9999, function(){
    console.log("Shopping mall is running at 9999 port...");
});
