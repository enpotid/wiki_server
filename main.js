//.env MUST CONTAIN
//PORT=24879
//DB_HOST="localhost"
//DB_PORT=5432
//DB_USER="postgres"
//DB_PASSWORD="secret"
//DB_DBNAME="wiki"
//WIKINAME="wiki"
//PARSER_SERVER="127.0.0.1:348790/process" This must be same with parser_server's setting
const { insertDoc, updateDoc, ConnectDB, sql } = require("./ConnectDB");
const { initmeili } = require("./meili");
ConnectDB();
initmeili();
const express = require("express");
const session = require("express-session");
const app = express();
require("dotenv").config();
const document = require("./routes/document");
const raw = require("./routes/raw");
const register = require("./routes/register");
const search = require("./routes/search");
const setting = require("./routes/setting");
const login = require("./routes/login");
const getuserinfo = require("./routes/getuserinfo");
const random = require("./routes/random");
const logout = require("./routes/logout");
const history = require("./routes/history");
const recentchanges = require("./routes/recentchanges")
const { spawn } = require("child_process");
/*const parser = spawn('parser.exe');
parser.stdout.on('data', (data) => {
  console.log(`[parser] ${data}`);
})
parser.stderr.on('data', (data) => {
  console.error(`[parser] ${data}`);
});*/
app.use(
  session({
    secret: process.env.SECRET,
    cookie: { secure: false, maxAge: 6000000 },
    saveUninitialized: false,
    resave: false,
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
app.use("/document/", document);
app.use("/raw/", raw);
app.use("/register/", register);
app.use("/login/", login);
app.use("/getuserinfo/", getuserinfo);
app.use("/search/", search);
app.use("/setting/", setting);
app.use("/random/", random)
app.use("/logout/", logout)
app.use("/history/", history)
app.use("/recentchanges/", recentchanges)
app.listen(process.env.PORT, () => {
  console.log(`App listening on: ${process.env.PORT}`);
});
