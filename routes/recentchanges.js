const express = require("express");
const { sql } = require("../ConnectDB");
const app = express.Router();
app.get("/:count", async (req, res) => {
    try {
        let count = req.params.count;
        const resp = await sql.query(`SELECT title,namespace,hidden,rev,log,modifiedtime,author FROM history ORDER BY modifiedtime DESC LIMIT $1`, [count])
        res.json({message:"suc", recentchanges:resp.rows})
    } catch (err) {
        res.status(400).json({message:err})
    }
    
})
module.exports = app;
