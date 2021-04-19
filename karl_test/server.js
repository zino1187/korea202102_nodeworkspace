var http=require("http");
var fs=require("fs");
var ejs=require("ejs");
var static = require("serve-static");
var express=require("express");
var expressSession = require("express-session");
var mymodule=require("./lib/mymodule.js");

var app=express();

//미들웨어 등록 
app.use(static(__dirname+"/static"));
app.use(express.urlencoded({
    extended:true
}));
app.set("view engine","ejs"); // 이때 부터 ejs는 views 디렉토리에서 참조함

app.use(expressSession({
    secret: "key secret",
    resave: true,
    saveUninitialized:true
}));


/*
app.get("/main", function(request , response){
    fs.readFile("./shop/index.ejs", "utf8", function(err, data){
        if(err){
            console.log("읽기실패", err);
        }else{
            var renderData = ejs.render(data, {
            });
            response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
            response.end(renderData);
        }
    });
});
*/

app.get("/", function(request ,response){
    response.render("./shop/index", {
        user:request.session.user
    });
});

app.get("/admin/loginform", function(request ,response){
    console.log(request.query);

    response.render("./admin/login");
});

app.get("/admin/main", function(request ,response){
    if(checkAuth(request)){
        response.render("./admin/main");
    }else{
        response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
        response.end(mymodule.getMsgUrl("관리자 인증이 필요한 서비스입니다","/admin/loginform"));
    }
});

app.post("/admin/login", function(request ,response){
    console.log(request.body);
    
    var admin_id=request.body.admin_id;
    var admin_pass=request.body.admin_pass;

    if(admin_id=="admin" && admin_pass=="1234"){
        request.session.user={
            admin_id:"admin",
            name:"minzino"
        };
        console.log("my session is ", request.session.user);
        response.redirect("/admin/main");
    }else{
        response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
        response.end(mymodule.getMsgBack("로그인 정보가 올바르지 않습니다"));
    }
    
});

function checkAuth(request){
    var result=false;
    if(request.session.user){
        result=true;
    }
    return result;
}

var server = http.createServer(app);
server.listen(9999, function(){
    console.log("Shopping mall Server is running at 9999...");
});
