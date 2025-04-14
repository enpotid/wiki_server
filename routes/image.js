const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const { meili } = require("../meili");
const { candowiththisdoc } = require("../usermanager");
const path = require("path")
const fs = require("fs")
app.use(express.json());
app.get(`/*`, async (req, res) => {
  const exist = await sql.doc.findFirst({
    where:{
      namespace:"file",
      title:req.params["0"]
    }
  })
  if (exist==null) {
    res.status(404).send("not found🤔")
  } else {
    if ((await candowiththisdoc(req.params["0"], "file", req)).watch == true) {
        const read = path.join(__dirname, `../img/${req.params["0"]}`)
        res.send(fs.readFileSync(read))
    } else {
        res.status(400).send("forbidden")
    }
  }
  
});
module.exports = app;
