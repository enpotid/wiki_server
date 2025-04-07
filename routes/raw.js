const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const {candowiththisdoc} = require("../usermanager")
app.get(`/:namespace/:docname/`, async (req, res) => {
  let docname = req.params.docname;
  let namespace = req.params.namespace;
  const for_acl = await sql.doc.findFirst({
    where:{
      title:docname,
      namespace:namespace
    }
  })
  if (for_acl == null) {return res.status(404).json({body:"Not Found"});}
  const documentinfo = await sql.history.findFirst({
    where:{
      title:docname,
      namespace:namespace,
      rev:for_acl.lastrev
    }
  })
  if (req.session.info == undefined) {
    if ((await candowiththisdoc(docname, namespace, req)).watch == true) {
      res.json({
        title: for_acl.title,
        body: documentinfo.body,
        acl:JSON.stringify(documentinfo.acl),
      });
    } else {
      res.json({body:"No perms", acl:JSON.stringify(for_acl.acl)})
    }
  } else {
    if ((await candowiththisdoc(docname, namespace, req)).watch == true) {
      res.json({
        title: documentinfo.title,
        body: documentinfo.body,
        acl:JSON.stringify(documentinfo.acl),
      });
    } else {
      res.json({body:"No perms", acl:JSON.stringify(for_acl.acl)})
    }
  }
});
module.exports = app;
