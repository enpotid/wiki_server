const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const { meili } = require("../meili");
app.use(express.json());
app.get(`/:keyword`, async (req, res) => {
  let keyword = req.params.keyword;
  const index = meili.index(process.env.WIKINAME)
  index.updateSearchableAttributes(["prettytitle", "title"])
  const results = await index.search(keyword);
  res.json({body:results.hits})
});
module.exports = app;
