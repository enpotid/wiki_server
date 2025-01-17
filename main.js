//.env MUST CONTAIN
//PORT=24879
//DB_HOST="localhost"
//DB_PORT=5432
//DB_USER="postgres"
//DB_PASSWORD="secret"
//DB_DBNAME="wiki"
//WIKINAME="wiki"
const { insertDoc, updateDoc, ConnectDB, sql } = require("./ConnectDB");
ConnectDB();
const express = require("express");
const app = express();
require("dotenv").config();
const document = require("./routes/document");
const raw = require("./routes/raw");
const { spawn } = require('child_process')
const parser = spawn('parser.exe');
parser.stdout.on('data', (data) => {
  console.log(`[parser] ${data}`);
})
parser.stderr.on('data', (data) => {
  console.error(`[parser] ${data}`);
});
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
})
app.use("/document/", document);
app.use("/raw/", raw)

app.listen(process.env.PORT, () => {
  console.log(`App listening on: ${process.env.PORT}`);
});
