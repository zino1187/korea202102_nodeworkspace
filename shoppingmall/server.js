/*쇼핑몰 개발환경 구축 먼저 하자 */
var http = require("http");
var express=require("express");
var static = require("serve-static");//정적자원 처리를 위한 외부모듈 (설치)

var app = express();
app.use(static(__dirname+"/static")); //정적자원의 최상위 루트를 설정 

//템플릿 뷰 엔진 등록 (서버 스크립트의 위치 등록)
app.set("view engine","ejs"); //등록 후엔 자동으로 무도건 views 라는 디렉토리 하위에서
//ejs를 찾아나선다.따라서 views라는 정해진 디렉토리를 무조건 존재시켜야 한다!!


var server = http.createServer(app);
server.listen(9999, function(){
    console.log("Shopping mall is running at 9999 port...");
});
