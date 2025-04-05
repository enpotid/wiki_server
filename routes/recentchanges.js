const express = require("express");
const { sql } = require("../ConnectDB");
const app = express.Router();
app.get("/:count", async (req, res) => {
    try {
        let count = req.params.count;
        const resp = await sql.history.findMany({
            take:Number(count),
            select:{
                title:true,
                namespace:true,
                hidden:true,
                rev:true,
                log:true,
                modifiedtime:true
            },
            orderBy:{modifiedtime:"desc"}
        })
        res.json({message:"suc", recentchanges:resp})
    } catch (err) {
        throw (err)
        res.status(400).json({message:err})
    }
    
})
module.exports = app;
