const express = require("express");
const multer = require("multer");
const app = express.Router()
const path = require("path");
const { candowiththisdoc, cando_old } = require("../usermanager");
const { sql } = require("../ConnectDB");
const  fs  = require("fs");
app.use(express.json())
const storage = multer.diskStorage({
    destination: (req, file, cibal) => {
      cibal(null, "temp/");
    },
    filename: (req, file, cibal) => {
      cibal(null, file.originalname);
    }
  });
  const upload = multer({storage:storage})
app.post('/', upload.single('file'), auth, (req, res) => {
  let parsed = JSON.parse(req.body.json)
    sql.query(`INSERT INTO doc (title, namespace) VALUES ($1, $2)`, [parsed.title, "file"]);
    let author = (req.session.info != undefined) ? (req.session.info.name) : (req.body.author)
    sql.query(`INSERT INTO history (namespace, title, body, log, author) VALUES ($1, $2, $3, $4, $5)`, [
      "file",
      parsed.title,
      parsed.body,
      parsed.log,
      author //프론트랑 API Key로 연동할꺼라서 변조 걱정 ㄴㄴ
    ]);
})
async function auth (req, res, next) {
  const resp1 = await sql.query(`SELECT * FROM namespace WHERE name=$1`, [req.body.json.title])
  let acl = undefined
  if (resp1.rowCount != 0) {
    if (resp1.rows[0].acl == {}) {
      const resp = await sql.query(`SELECT * FROM namespace WHERE name=$1`, ["file"])
      acl = resp.rows[0].acl;
    } else {
      acl = resp1.rows[0].acl;
    }
  } else {
    const resp = await sql.query(`SELECT * FROM namespace WHERE name=$1`, ["file"])
    acl = resp.rows[0].defaultacl
  }
  const cando = cando_old(acl, req);
    if (cando.edit == true) {
        const filename = JSON.parse(req.body.json).title;
        const filepath = path.join(__dirname, "../temp", req.file.originalname);
        const newfilepath = path.join(__dirname, "../img", filename);
        fs.access(newfilepath, fs.constants.F_OK, (err) => {
          if (err) {
            fs.rename(filepath, newfilepath, (err) => {
              if (err) {console.error(err)}});
            next();
          } else {
            res.send("already exist")
          }
        })
    } else {
        res.send("no perms")
    }
}
module.exports = app