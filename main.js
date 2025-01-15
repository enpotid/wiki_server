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
const helmet = require("helmet");
const document = require("./routes/document");
app.use("/document/", document);

app.listen(process.env.PORT, () => {
  console.log(`App listening on: ${process.env.PORT}`);
});
