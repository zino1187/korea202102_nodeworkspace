/*쇼핑몰 개발환경 구축 먼저 하자 */
var http = require("http");
var express=require("express");
var static = require("serve-static");//정적자원 처리를 위한 외부모듈 (설치)
var ejs=require("ejs"); //설치
var mysql=require("mysql"); //설치
var path = require("path"); //확장자 추출 등 파일경로와 관련된 처리 모듈
var multer = require("multer"); //파일업로드 처리 모듈
                                              //이 모듈이 기존의 순수한 request  객체를 분석해서
                                              //파일, 파라미터 등을 처리해놓았다!!
                                              //따라서 클라이언트가 파일을 전송하기 위한 인코딩타입인
                                              //multipart/form-data를 명시하는 순간부터는, 순수한   
                                              //request로는 파일처리 및 파라미터를 받을수 없으며 
                                              //업로드 모듈을 통해 업무를 처리해야 한다..
                                              //jsp, php, asp 등등 언어도 원히가 동일하다..
var mymodule=require("./lib/mymodule.js");

const conStr={
    url:"localhost",
    user:"root",
    password:"1234",
    database:"shoppingmall"
};

//기존의 순수 요청 정보를 담고있는 request 객체를 multer에게 전달해주자
//그러면 multer가 요청을 분석을 해준다
var upload = multer({
    storage: multer.diskStorage({
        destination:function(request, file, cb){
            cb(null, __dirname+"/static/product");
        },
        filename:function(request, file, cb){
            cb(null, new Date().valueOf()+path.extname(file.originalname));
        }
    })    
});

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


//상품 등록 요청 처리 
app.post("/admin/product/regist", upload.single("product_img") ,function(request, response){
    //상품 정보 파라미터들 받기!!!
    //upload.single() 을 명시하면, multer 를 이용하여 파라미터를 받을 수 있게 된다..
    var subcategory_id=request.body.subcategory_id; 
    var product_name = request.body.product_name;
    var price=request.body.price;
    var brand=request.body.brand;
    var detail=request.body.detail;
    var filename=request.file.filename;

    var sql="insert into product(subcategory_id, product_name, price, brand, detail, filename)";    
    sql+=" values(?,?,?,?,?,?)";
    var con = mysql.createConnection(conStr);

    con.query(sql, [subcategory_id, 
        product_name, 
        price, 
        brand, 
        detail, 
        filename]  , function(err, fields){
            if(err){
                console.log("등록중 에러", err);
            }else{
                //클라이언트로 하여금 지정한 url로 재접속을 유도함
                response.redirect("/admin/product/list");
            }
            con.end();
    });    
});

//상품 목록 요청 처리
app.get("/admin/product/list", function(request, response){
    var currentPage = 1; //기본적인 페이지 디폴트 값은 1로 한다..

    //누군가가 페이지 아래 링크를 눌렀다면,, currentPaget 파라미터가 넘어온다..
    if(request.query.currentPage!=undefined){
        currentPage=request.query.currentPage;
    }
    response.render("admin/product/list", {
        param:{
            "currentPage":currentPage
        }
    });
});

var server = http.createServer(app);
server.listen(9999, function(){
    console.log("Shopping mall is running at 9999 port...");
});
