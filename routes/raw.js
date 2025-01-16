const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB")
app.get(`/:namespace/:docname`, (req, res) => {
    let docname = req.params.docname;
    let namespace = req.params.namespace;
    sql.query(`SELECT * FROM doc WHERE title=$1 AND namespace=$2`, [docname, namespace], async (err, resdb) => {
        if (err) {throw err;}
        if (resdb.rows.length === 0) {
        return res.status(404).send("Document not found");
      }
      res.send(resdb.rows[0].body);
    });
});
module.exports = app;