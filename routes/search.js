const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
app.use(express.json());
app.get(`/:keyword`, async (req, res) => {
  let keyword = req.params.keyword;

  await sql.query(`SELECT title FROM doc`, async (err, resdb) => {
    if (err) {
      throw err;
    }
    if (resdb.rows.length === 0) {
      return res.status(404).send("No document");
    }
    let slist = [];
    for (let i of resdb.rows) {
      let ir = i.title.replace(/\s+/g, "").toLowerCase();
      let kr = keyword.replace(/\s+/g, "").toLowerCase();
      if (ir.includes(kr)) {
        slist.push(i.title);
      }
    }
    res.json({ body: slist });
  });
});
module.exports = app;
