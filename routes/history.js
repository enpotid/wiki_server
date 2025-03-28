const express = require("express");
const { sql } = require("../ConnectDB");
const { candowiththisdoc } = require("../usermanager");
const { default: axios } = require("axios");
const { getbroken } = require("../documentfns");
const app = express.Router();
app.get(`/:namespace/:document/list/:nums/:pages`, (req, res) => {
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
        let namespace = req.params.namespace;
        let document = req.params.document;
        let gethidden = " AND hidden != true"
        if (req.session.info != undefined) {
            gethidden = (req.session.info.permission.includes("hide_rev") || req.session.info.permission.includes("owner")) ? ("") : (" AND hidden != true")
        }
        const resp = await sql.query(`SELECT hidden,rev,log,modifiedtime,author FROM history WHERE namespace=$1 AND title=$2${gethidden} ORDER BY rev DESC`, [namespace, document])
        if (resp.rowCount == 0) {
            res.status(404).json({message:"not found"})
        } else {
            res.json({message:"suc",history:resp.rows})
        }
    }
})
app.get(`/:namespace/:document/:rev`, async (req, res) => {
    let namespace = req.params.namespace;
    let document = req.params.document;
    let rev = req.params.rev
    const resp = await sql.query(`SELECT * from history WHERE namespace=$1 AND title=$2 AND rev=$3`, [namespace, document, rev])
    const for_acl = await sql.query(`SELECT * from doc WHERE namespace=$1 AND title=$2`, [namespace, document])
    if (resp.rowCount == 0) {
        res.status(404).json({message:"not found"})
    } else {
        if (resp.rows[0].hidden) {
            if (req.session.info != undefined) {
                if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("hide_rev") ) {
                    const broken_link = await getbroken(resp.rows[0].body)
                    const response = await axios.post(
                    process.env.PARSER_SERVER,
                    JSON.parse(
                      `{"contents":${JSON.stringify(resp.rows[0].body).replace('"', '"')},"broken_links":${JSON.stringify(broken_link)},"title":"${document}","namespace":"${namespace}"}`
                    )
                  );
                res.json({message:"suc", body:response.data, log:resp.rows[0].log, modifiedtime:resp.rows[0].modifiedtime,author:resp.rows[0].author})
                } else {
                    res.json({message:"hidden"})
                }
            } else {
                res.json({message:"hidden"})
            }
        } else {
            let candowiththisdic = await candowiththisdoc(for_acl.rows[0].acl, req)
            if (candowiththisdic.watch == true) {
                const broken_link = await getbroken(resp.rows[0].body)
                const response = await axios.post(
                    process.env.PARSER_SERVER,
                    JSON.parse(
                      `{"contents":${JSON.stringify(resp.rows[0].body).replace('"', '"')},"broken_links":${JSON.stringify(broken_link)},"title":"${document}","namespace":"${namespace}"}`
                    )
                  );
                res.json({message:"suc", body:response.data, log:resp.rows[0].log, modifiedtime:resp.rows[0].modifiedtime,author:resp.rows[0].author})
            } else {
                res.json({message:"no perms"})
            }
        }
    }
})
app.get(`/:namespace/:document/:rev/togglehide`, async (req, res) => {
    let namespace = req.params.namespace;
    let document = req.params.document;
    let rev = req.params.rev
    const resp = await sql.query(`SELECT * from history WHERE namespace=$1 AND title=$2 AND rev=$3`, [namespace, document, rev])
    if (resp.rowCount == 0) {
        res.status(404).json({message:"not found"})
    } else {
        if (req.session.info != undefined) {
            if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("hide_rev") ) {
                sql.query(`UPDATE history SET hidden=$1 WHERE title=$2 AND namespace=$3 AND rev=$4`, [!resp.rows[0].hidden, document, namespace, rev])
                res.json({message:"suc"})
            } else {
                res.json({message:"no perm"})
            }
        } else {
            res.json({message:"no perm"})
        }
    }
})
module.exports = app;