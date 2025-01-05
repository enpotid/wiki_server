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
