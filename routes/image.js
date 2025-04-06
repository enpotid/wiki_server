const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const { meili } = require("../meili");
const { candowiththisdoc } = require("../usermanager");
const path = require("path")
const fs = require("fs")
app.use(express.json());
app.get(`/:imagename`, async (req, res) => {
  const exist = await sql.doc.findFirst({
    where:{
      namespace:"file",
      title:req.params.imagename
    }
  })
  if (exist==null) {
    res.status(404).send("not found🤔")
  } else {
    if ((await candowiththisdoc(req.params.imagename, "file", req)).watch == true) {
        const read = path.join(__dirname, `../img/${req.params.imagename}`)
        res.send(fs.readFileSync(read))
    } else {
        res.status(400).send("forbidden")
    }
  }
  
});
module.exports = app;
