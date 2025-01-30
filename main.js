//.env MUST CONTAIN
//PORT=24879
//DB_HOST="localhost"
//DB_PORT=5432
//DB_USER="postgres"
//DB_PASSWORD="secret"
//DB_DBNAME="wiki"
//WIKINAME="wiki"
//PARSER_SERVER="127.0.0.1:348790/process" This must be same with parser_server's setting 
const {ConnectDB } = require("./ConnectDB");
ConnectDB();
const express = require("express");
const session = require("express-session")
const app = express();
require("dotenv").config();
const document = require("./routes/document");
const raw = require("./routes/raw");
const register = require("./routes/register")
const login = require("./routes/login")
const getuserinfo = require("./routes/getuserinfo")
const setting = require("./routes/setting")

/*const parser = spawn('parser.exe');
parser.stdout.on('data', (data) => {
  console.log(`[parser] ${data}`);
})
parser.stderr.on('data', (data) => {
  console.error(`[parser] ${data}`);
});*/
app.use(session({
  secret:process.env.SECRET,
  cookie:{secure:false},
  saveUninitialized:false,
  resave:false
}))
app.use((req, res, next) => {
  if (req.session.lastAccess != undefined) {
    if (req.session.lastAccess && (Date.now() - req.session.lastAccess > 259200)) { //3일동안 이 세션으로 응답이 가지 않으면 세션을 만료시킴.(자동로그인용)
      req.session.destroy();
    }
  }
  req.session.lastAccess = Date.now();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
})
app.use("/document/", document);
app.use("/raw/", raw)
app.use("/register/", register)
app.use("/login/", login)
app.use("/getuserinfo/", getuserinfo)
app.use("/setting/", setting)
app.listen(process.env.PORT, () => {
  console.log(`App listening on: ${process.env.PORT}`);
});
