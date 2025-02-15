const express = require("express");
const { sql } = require("../ConnectDB");
const { candowiththisdoc } = require("../usermanager");
const app = express.Router();
app.get(`/:namespace/:document/:rev`, async (req, res) => {
    let namespace = req.params.namespace;
    let document = req.params.document;
    let rev = req.params.rev
    const resp = await sql.query(`SELECT * from history WHERE namespace=$1 AND document=$2 AMD rev=$3`, [namespace, document, rev])
    const for_acl = await sql.query(`SELECT * from doc WHERE namespace=$1 AND document=$2`, [namespace, document])
    if (resp.rowCount == 0) {
        res.send("not found")
    } else {
        if (req.session.info != undefined) {
            if (resp.rows[0].hidden) {
                if (req.session.info.perms.includes(" owner ") || req.session.info.perms.includes(" hide_rev ") ) {
                    res.json({message:"suc", body:resp.rows[0].body, log:resp.rows[0].log, hidden:resp.rows[0].log, modifiedtime:resp.rows[0].modifiedtime})
                } else {
                    res.json({message:"no perms"})
                }
            } else {
                let candowiththisdic = await candowiththisdoc(for_acl.rows[0].acl, req.session.info.user_group)
                if (candowiththisdic.watch == true) {
                    res.json({message:"suc", body:resp.rows[0].body, log:resp.rows[0].log, hidden:resp.rows[0].log, modifiedtime:resp.rows[0].modifiedtime})
                } else {
                    res.json({message:"no perms"})
                }
            }
        } else {
            let candowiththisdoc = await candowiththisdoc(for_acl.rows[0].acl, [{"name":"user", "expire":"none"}])
            if (candowiththisdoc.watch == true) {
                res.json({message:"suc", body:resp.rows[0].body, log:resp.rows[0].log, hidden:resp.rows[0].log, modifiedtime:resp.rows[0].modifiedtime})
            } else {
                res.json({message:"no perms"})
            }
        }
    }
})
app.get(`/:namespace/:document/list/:nums/:pages`, (req, res) => {
    let namespace = req.params.namespace;
    let document = req.params.document;
    let nums = req.params.nums
    let pages = req.params.pages;
    if (nums > 100) {
        res.status(400).send("Too lot.")
    } else if (isNaN(Number(nums))) {
        res.status(400).send("Bad Request")
    } else {
        if (nums > 100) {
            res.status(400).send("Too lot.")
        } else if (isNaN(Number(nums))) {
            res.status(400).send("Bad Request")
        } else {
            process(req, res, nums)
        }
    }
    async function process(req, res, nums) {
        sql.query(`SELECT $1 FROM history `)
    }
})
module.exports = app;