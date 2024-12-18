const { ConnectDB, sql } = require('./ConnectDB');
ConnectDB();
const express = require('express');
const app = express();
require("dotenv").config();

app.get(`${process.env.REQ_DOCUMENT}:docname`, (req, res) => {
    let docname = req.params.docname;
    sql.query(`SELECT * FROM doc WHERE title=$1`, [docname], (err, resdb) => {
        if (err) { throw err; }
        res.send(resdb.rows[0])
    })
})

app.listen(process.env.PORT, () => {console.log(`App listening on: ${process.env.PORT}`)})