const express = require("express");
const app = express.Router();
app.use(express.json());
app.get(`/`, async (req, res) => {
    if (req.session.info == undefined) {
        res.send(JSON.stringify({message:"not logined"}))
    } else {
        res.send({info:req.session.info})
    }
});
module.exports = app;