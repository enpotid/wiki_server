const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const {candowiththisdoc} = require("../usermanager")
app.get(`/:namespace/:docname`, async (req, res) => {
  let docname = req.params.docname;
  let namespace = req.params.namespace;
  const documentinfo = await sql.query(`SELECT * FROM doc WHERE title=$1 AND namespace=$2`, [docname, namespace])
  if (documentinfo.rowCount == 0) {return res.status(404).json({body:"Not Found"});}
  if (req.session.info == undefined) {
    if ((await candowiththisdoc(documentinfo.rows[0].acl, [{"name":"user", "expire":"none"}], req)).watch == true) {
      res.json({
        title: documentinfo.rows[0].title,
        body: documentinfo.rows[0].body,
        createdtime: documentinfo.rows[0].createdtime,
        lastmodifiedtime: documentinfo.rows[0].lastmodifiedtime,
        acl:JSON.stringify(documentinfo.rows[0].acl),
      });
    } else {
      res.json({body:"No perms", acl:JSON.stringify(documentinfo.rows[0].acl)})
    }
  } else {
    if ((await candowiththisdoc(documentinfo.rows[0].acl, req.session.info.user_group, req)).watch == true) {
      res.json({
        title: documentinfo.rows[0].title,
        body: documentinfo.rows[0].body,
        createdtime: documentinfo.rows[0].createdtime,
        lastmodifiedtime: documentinfo.rows[0].lastmodifiedtime,
        acl:JSON.stringify(documentinfo.rows[0].acl),
      });
    } else {
      res.json({body:"No perms", acl:JSON.stringify(documentinfo.rows[0].acl)})
    }
  }
});
module.exports = app;
