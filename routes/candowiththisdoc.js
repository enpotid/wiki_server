const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const {candowiththisdoc} = require("../usermanager")
app.use(express.json());
app.get("/:namespace/:document/", async (req, res) => {
    let document = req.params.document;
    let namespace = req.params.namespace;
    const documentinfo = await sql.query(`SELECT * FROM doc WHERE namespace=$1 AND title=$2`, [namespace, document])
    if (documentinfo.rowCount == 0) {
        res.json({message:"Not Found"})
    } else {
        let documentACL = documentinfo.rows[0].acl
        if (req.session.info == undefined) {
            res.json(await candowiththisdoc(documentACL, [{"name":"user", "expire":"none"}], req))
        } else {
            res.json(await candowiththisdoc(documentACL, req.session.info.user_group, req))
        }
    }

})
module.exports = app;