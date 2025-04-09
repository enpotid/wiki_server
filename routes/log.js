const express = require("express");
const { sql } = require("../ConnectDB");
const app = express.Router();
//원래 post로 만들려고 했는데 귀찮 ㅎ
app.get("/", async (req, res) => {
    const resp = await sql.log.findMany({
        where:{
            type:{
                not:"login_history"
            }
        },
        orderBy:{
            time:"desc"
        }
    })
    res.send(resp)
})
module.exports = app