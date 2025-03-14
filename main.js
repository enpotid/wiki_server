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
const { WebSocketServer } = require("ws");
const http = require("http");
const { error } = require("console");
/*const parser = spawn('parser.exe');
parser.stdout.on('data', (data) => {
  console.log(`[parser] ${data}`);
})
parser.stderr.on('data', (data) => {
  console.error(`[parser] ${data}`);
});*/
const serv = http.createServer(app);
const sess = session({
  secret: process.env.SECRET,
  cookie: { secure: false, maxAge: 6000000 },
  saveUninitialized: false,
  resave: false,
})
const wss = new WebSocketServer({ clientTracking: false, noServer: true })
app.use(
  sess
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
function onSocketError(err) {
  console.error(err);
}
serv.on('upgrade', function (request, socket, head) {
  socket.on('error', onSocketError);

  let name = request.socket.remoteAddress

  sess(request, {}, () => {
    if (request.session.info != undefined) {
      name = request.session.info.name
    }

    socket.removeListener('error', onSocketError);

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request, name);
    });
  });
});

wss.on('connection', function (ws, request, name) {
  ws.on('error', console.error);

  ws.on('message', function (message) {
    console.log(`Received message ${message} from user ${name}`);
  });

  ws.on('close', function () {
  });
});

//
// Start the server.
//
serv.listen(process.env.PORT, function () {
  console.log('Listening on http://localhost:8080');
});
module.exports = {session}