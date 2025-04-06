const express = require("express");
const SHA256 = require("crypto-js/sha256");
const CryptoJS = require("crypto-js");
const app = express.Router();
const { sql } = require("../ConnectDB");
app.use(express.json());
app.post(`/`, async (req, res) => {
  let body = req.body;
  let password = SHA256(body.password + process.env.SECRET).toString(
    CryptoJS.enc.Hex
  );
  const resp = await sql.users.findFirst({
    where:{
      name:body.name
    }
  })
  if (resp != null) {
    res.send("name already used");
  } else {
    await sql.users.create({
      data:{
        name:body.name,
        password:password
      }
    })
    res.send("suc");
  }
});
module.exports = app;
