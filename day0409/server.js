var http = require("http");
var express = require("express"); //외부-설치
var fs=require("fs");
var ejs =require("ejs"); //외부-설치
var oracledb=require("oracledb");//외부-설치
var static = require("serve-static"); //정적자원을 처리하기위한 모듈
var mymodule=require("./lib/mymodule.js");

//커밋을 디폴트로 설정하자!!
oracledb.autoCommit=true; //쿼리문 실행시마다 트랜잭션을 commit으로 처리!!

var app = express();

//미들웨어 등록 
app.use(static(__dirname+"/static")); //정적자원의 루트 디렉토리 등록!!!
app.use(express.urlencoded({extended:true})); //post방식 데이터 처리 

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
            //쿼리문 실행 
            var sql="select * from news order by news_id desc";

            con.execute(sql, function(error, result){
                if(error){
                    console.log(error);
                }else{
                    console.log("result는 ",result);

                    fs.readFile("./comments/list.ejs", "utf8", function(error, data){
                        if(error){
                            console.log(error);
                        }else{
                            var r = ejs.render(data,{
                                //ejs에 넘겨줄 데이터 지정 
                                param:{
                                    page:currentPage,
                                    /*result 는 mysql과 틀리게 json객체의 rows 속성에 
                                    2차원배열에 들어있다..*/
                                    record:result.rows,
                                }
                            }); //ejs 해석 및 실행하기!!
                            response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                            response.end(r); //실행한 결과 전송하기!!
                        }
                    });
                }
                con.close();
            });
        }
    }); //오라클 접속 및 접속객체 가져오기
});


//등록요청 처리 
app.post("/news/regist", function(request, response){
    //파라미터 받기!!! (post)
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;

    //오라클에 넣기 
    oracledb.getConnection(conStr, function(err, con){
        if(err){
            console.log("접속실패", err);
        }else{
            var sql="insert into news(news_id, title, writer, content)";
            sql+=" values(seq_news.nextval, :1, :2, :3)";
            con.execute(sql, [title, writer, content],  function(error, result){
                if(error){ 
                    console.log("등록 중 에러발생", error);
                }else{
                    //여기서도 무조건 등록된다는 보장은 없다...즉 오라클에 반영되었느냐 여부는
                    //result를 통해 또 알아봐야 한다.. 
                    console.log("result 는 ",result);
                    if(result.rowsAffected==0){ //등록실패
                        //status 코드란? http 통신 서버의 상태를 나타내는 기준값코드
                        response.writeHead(500, {"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("등록실패","/news/list"));
                    }else{//등록성공
                        response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("등록성공","/news/list"));
                    }
                }
                con.close(); //oracle 접속해제
            });
        }
    });

    response.end("");
});

var server = http.createServer(app);
server.listen(8888, function(){
    console.log("The Server with Oracle is running at 8888 port...");
});
