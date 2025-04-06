const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB")
app.use(express.json());
app.post(`/`, async (req, res) => {
    let body = req.body;
    if (req.session.info == undefined) {
        res.send("not login")
    } else {
        let name = req.session.info.name;
        await sql.users.update({
            where:{
                name:name
            },
            data:{
                setting:body
            }
        })
        req.session.info.setting = body
        res.send("changed")
    }
})
module.exports = app;