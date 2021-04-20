var xmlConverter = require("xml-js");
var fs=require("fs");

fs.readFile("member.xml", "utf8", function(error, data){
    var json = xmlConverter.xml2json(data, {compact:true, spaces:4});
    console.log(json);
});


