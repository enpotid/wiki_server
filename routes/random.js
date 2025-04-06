const express = require("express");
const app = express.Router();
const {sql} = require("../ConnectDB")
app.get("/:nums", (req, res) => {
    let nums = req.params.nums
    if (nums > 100) {
        res.status(400).send("Too lot.")
    } else if (isNaN(Number(nums))) {
        res.status(400).send("Bad Request")
    } else {
        process(req, res, nums)
    }

    //음 쿼리 쓸수 있게 만들어야하는데
    //const pages = await sql.query(`SELECT * FROM doc ORDER BY RANDOM() LIMIT ${nums}}`)
})
async function process(req, res, nums) {
    let doc = [];
    const docs = await sql.$queryRaw`SELECT * FROM doc ORDER BY RANDOM() LIMIT ${Number(nums)}`
    docs.map((docinfo) => {
        doc.push({namespace:docinfo.namespace,title:docinfo.title})
    })
    res.json(doc)
}
module.exports = app;