const express = require("express");
const app = express.Router();
const session = require("express-session")
const { sql } = require("../ConnectDB")
const CryptoJS = require("crypto-js")
const SHA256 = require("crypto-js/sha256")
app.use(express.json());
app.get(`/`, async (req, res) => {
    if (req.session.info == undefined) {
        console.log("not login")
        res.send(JSON.stringify({message:"not logined"}))
    } else {
        res.send({name:req.session.info.name, createdtime:req.session.info.createdtime})
    }
});
module.exports = app;