const express = require("express");
const SHA256 = require("crypto-js/sha256")
const CryptoJS = require("crypto-js")
const app = express.Router();
const { sql } = require("../ConnectDB")
app.use(express.json());
app.post(`/`, async (req, res) => {
    console.log(process.env.SECRET)
    let body = req.body;
    let password = SHA256(body.password+process.env.SECRET).toString(CryptoJS.enc.Hex)
    const resp = await sql.query(`SELECT * FROM users WHERE name=$1`, [body.name])
    if (resp.rowCount != 0) {
        res.send("name already used")
    } else {
        sql.query(`INSERT INTO users (name, password) VALUES ($1, $2)`, [body.name, password])
        res.send("suc")
    }
    
    
});
module.exports = app;