const express = require("express");
const { sql } = require("../ConnectDB");
const { candowiththisns } = require("../usermanager");
const app = express.Router();
app.use(express.json());
app.post(`/:namespace`, async (req, res) => {
    if (req.session.info == undefined) {
        res.send(`no perms`)
    }
    if (req.body.method == "acl") {
        if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("nsacl") || req.session.info.permission.includes("nsmgr")) {
            try {
                const before = await sql.query(`SELECT defaultacl FROM namespace WHERE name=$1`, [req.params.namespace])
                
                sql.query(`UPDATE namespace SET defaultacl=$1 WHERE name=$2`, [req.body.acl, req.params.namespace])
                sql.query(`INSERT INTO log (who, type, time, log) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)`, [
                    req.session.info.name,
                    "nsacl",
                    {before:before.rows[0], after:req.body.acl, log:"test"}
                ])
            } catch (err) {
                console.log(err)
                res.json({message:"not found"}) //다른 예외는 없겠지 뭐,
            }
        } else {
            res.send("no perms")
        }
    }
    if (req.body.method == "create") {
        if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("nsmgr")) {
            try {
                const resp = await sql.query(`SELECT * namespace WHERE name=$1`, [req.params.namespace])
                if (resp.rows[0] == 1) {
                    res.send("nop")
                } else {
                    sql.query(`INSERT INTO namespace (name) VALUES ($1)`, [req.params.namespace])
                    sql.query(`INSERT INTO log (who, type, when, log) VALUES ($1, nsacl, CURRENT_TIMESTAMP, $2)`, [
                        req.session.name,
                        {before:before, after:req.body.acl, log:""}
                    ])
                    res.send("suc")
                }
                
            } catch (err) {
                res.json({message:"not found"}) //다른 예외는 없겠지 뭐,
            }
        } else {
            res.send("no perms")
        }
    }
})
app.get(`/:nsname`, async (req, res) => {
    try {
        const resp = await sql.query(`SELECT * FROM namespace WHERE name=$1`, [req.params.nsname])    
        res.json({acl:resp.rows[0].defaultacl, candowiththisns:await candowiththisns(req.params.nsname, req)})
    } catch(e) {
        res.status(500).send("oops")
    }
    
})
module.exports = app;