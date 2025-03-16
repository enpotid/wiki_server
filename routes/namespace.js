const express = require("express");
const { sql } = require("../ConnectDB");
const app = express.Router();
app.use(express.json());
app.post(`/`, async (req, res) => {
    if (req.session.info != undefined) {
        res.send(`no perms`)
    }
    if (req.body.method == "acl") {
        if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("nsacl") || req.session.info.permission.includes("nsmgr")) {
            try {
                const before = await sql.query(`SELECT defaultacl FROM namespaces WHERE name=$1`, [req.body.name])
                sql.query(`UPDATE namespaces SET defaultacl=$1 WHERE name=$2`, [req.body.acl, req.body.name])
                sql.query(`INSERT INTO log (who, type, when, log) VALUES ($1, nsacl, CURRENT_TIMESTAMP, $2)`, [
                    req.session.name,
                    {before:before, after:req.body.acl, log:""}
                ])
            } catch (err) {
                res.json({message:"not found"}) //다른 예외는 없겠지 뭐,
            }
        } else {
            res.send("no perms")
        }
    }
    if (req.body.method == "create") {
        if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("nsmgr")) {
            try {
                const before = await sql.query(`SELECT defaultacl FROM namespaces WHERE name=$1`, [req.body.name])
                sql.query(`UPDATE namespaces SET defaultacl=$1 WHERE name=$2`, [req.body.acl, req.body.name])
                sql.query(`INSERT INTO log (who, type, when, log) VALUES ($1, nsacl, CURRENT_TIMESTAMP, $2)`, [
                    req.session.name,
                    {before:before, after:req.body.acl, log:""}
                ])
            } catch (err) {
                res.json({message:"not found"}) //다른 예외는 없겠지 뭐,
            }
        } else {
            res.send("no perms")
        }
    }
})
module.exports = app;