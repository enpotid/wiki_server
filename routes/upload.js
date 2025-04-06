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
app.post('/', upload.single('file'), auth, async (req, res) => {
  let parsed = JSON.parse(req.body.json)
    await sql.doc.create({
      data:{
        title:parsed.title,
        namespace:"file"
      }
    })
    let author = (req.session.info != undefined) ? (req.session.info.name) : (req.body.author)
    await sql.history.create({
      data:{
        namespace:"file",
        title:parsed.title,
        body:parsed.body,
        log:parsed.log,
        author:author
      }
    })
})
async function auth (req, res, next) {
  const resp1 = await sql.doc.findFirst({
    where:{
      namespace:"file",
      title:req.body.json.title
    }
  })
  let acl = undefined
  if (resp1 != null) {
    if (resp1.acl == {}) {
      const resp = await sql.namespace.findFirst({
        where:{
          name:"file"
        }
      })
      acl = resp.acl;
    } else {
      acl = resp1.acl;
    }
  } else {
    const resp = await sql.namespace.findFirst({
      where:{
        name:"file"
      }
    })
    acl = resp.defaultacl
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