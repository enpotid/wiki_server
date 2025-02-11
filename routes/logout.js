const express = require("express");
const app = express.Router();
//원래 post로 만들려고 했는데 귀찮 ㅎ
app.get("/", (req, res) => {
    req.session.destroy()
    res.json(JSON.stringify({message:"Umm"}))
})
module.exports = app