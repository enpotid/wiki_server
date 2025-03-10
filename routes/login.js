const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
const CryptoJS = require("crypto-js");
const SHA256 = require("crypto-js/sha256");
const { getuserpermission } = require("../usermanager")
app.use(express.json());
app.post(`/`, async (req, res) => {
  let password = SHA256(req.body.password + process.env.SECRET).toString(
    CryptoJS.enc.Hex
  );
  const resp = await sql.query(
    `SELECT * FROM users WHERE name=$1 AND password=$2`,
    [req.body.name, password]
  );
  if (resp.rowCount != 1) {
    res.send("wrong");
  } else {
    req.session.info = resp.rows[0];
    req.session.save((err) => {if (err) {throw err;}})
    res.send("suc");
  }
});
module.exports = app;
