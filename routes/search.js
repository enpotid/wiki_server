const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const { meili } = require("../meili");
app.use(express.json());
app.get(`/:keyword`, async (req, res) => {
  let keyword = req.params.keyword;
  const index = meili.index(process.env.WIKINAME)
  const result = await index.search(keyword)
  res.json({body:result.hits})
});
module.exports = app;
