const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const {candowiththisdoc} = require("../usermanager")
app.use(express.json());
app.get("/:namespace/:document/", async (req, res) => {
    let document = req.params.document;
    let namespace = req.params.namespace;
    const namespaceinfo = await sql.query(`SELECT * FROM namespace WHERE name=$1`, [namespace])
    const documentinfo = await sql.query(`SELECT * FROM doc WHERE namespace=$1 AND title=$2`, [namespace, document])
    
    if (documentinfo.rowCount == 0) {
        res.json({message:"Not Found"})
    } else {
        let documentACL = {}
        Object.entries(namespaceinfo.rows[0].defaultacl).forEach(([action, acl]) => {
            if (documentACL[action] == undefined) {
                documentACL[action] = []
            }
            documentACL[action] = acl
        })
        Object.entries(documentinfo.rows[0].acl).forEach(([action, acl]) => {
            if (documentACL[action] == undefined) {
                documentACL[action] = []
            }
            documentACL[action] = documentACL[action].concat(acl)
        })
        console.log(documentACL)
        if (req.session.info == undefined) {
            res.json(await candowiththisdoc(documentACL, [{"name":"user", "expire":"none"}], req))
        } else {
            res.json(await candowiththisdoc(documentACL, req.session.info.user_group, req))
        }
    }

})
module.exports = app;