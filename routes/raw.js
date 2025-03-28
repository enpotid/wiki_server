const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const {candowiththisdoc} = require("../usermanager")
app.get(`/:namespace/:docname/`, async (req, res) => {
  let docname = req.params.docname;
  let namespace = req.params.namespace;
  const for_acl = await sql.query(`SELECT * FROM doc WHERE title=$1 AND namespace=$2`, [docname, namespace])
  if (for_acl.rowCount == 0) {return res.status(404).json({body:"Not Found"});}
  const documentinfo = await sql.query(`SELECT * FROM history WHERE title=$1 AND namespace=$2 AND rev=$3`, [docname, namespace, for_acl.rows[0].lastrev])
  if (req.session.info == undefined) {
    if ((await candowiththisdoc(docname, namespace, req)).watch == true) {
      res.json({
        title: for_acl.rows[0].title,
        body: documentinfo.rows[0].body,
        acl:JSON.stringify(documentinfo.rows[0].acl),
      });
    } else {
      res.json({body:"No perms", acl:JSON.stringify(for_acl.rows[0].acl)})
    }
  } else {
    if ((await candowiththisdoc(docname, namespace, req)).watch == true) {
      res.json({
        title: documentinfo.rows[0].title,
        body: documentinfo.rows[0].body,
        acl:JSON.stringify(documentinfo.rows[0].acl),
      });
    } else {
      res.json({body:"No pedrms", acl:JSON.stringify(for_acl.rows[0].acl)})
    }
  }
});
module.exports = app;
