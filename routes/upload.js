const express = require("express");
const multer = require("multer");
const app = express.Router()
const path = require("path");
const { candowiththisdoc } = require("../usermanager");
const { sql } = require("../ConnectDB");
const storage = multer.diskStorage({
    destination: (req, file, cibal) => {
      cibal(null, "img/");
    },
    filename: (req, file, cibal) => {
      cibal(null, file.originalname);
    }
  });
  const upload = multer({storage:storage})
  app.use(express.static("img"))
app.post('/', auth, upload.single('file'), (req, res) => {
    res.send("wowimperson")
})
async function auth (req, res, next) {
    const resp = await sql.query(`SELECT * FROM namespace WHERE name=$1`, ["file"])
    const cando = await candowiththisdoc(resp.rows[0].defaultacl, req);
    if (cando.edit == true) {
        next();
    } else {
        res.send("no perms")
    }
}
module.exports = app