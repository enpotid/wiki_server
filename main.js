const { insertDoc, updateDoc, ConnectDB, sql } = require('./ConnectDB');
ConnectDB();
const express = require('express');
const app = express();
require("dotenv").config();

app.get(`/document/:docname`, (req, res) => {
    let docname = req.params.docname;
    sql.query(`SELECT * FROM doc WHERE title=$1`, [docname], (err, resdb) => {
        if (err) { 
            throw err; 
        }
        if (resdb.rows.length === 0) {
            return res.status(404).send({ error: "Document not found" });
        }
        res.send(resdb.rows[0]);
    });
});

app.get(`/documentmake/:title/:body`, (req, res) => {
    try {
        if (insertDoc(req.params.title, req.params.body)) {
            res.send('Document created successfully');
        }else{
            res.status(500).send('Error inserting document');
        }
    } catch (err) {
        res.status(500).send('Error inserting document');
    }
})

app.get(`/documentupdate/:title/:body`, (req, res) => {
    try {
        if (updateDoc(req.params.title, req.params.body)) {
            res.send('Document updated successfully');
        }else{
            res.status(500).send('Error inserting document');
        }
    } catch (err) {
        res.status(500).send('Error inserting document');
    }
})

app.listen(process.env.PORT, () => {console.log(`App listening on: ${process.env.PORT}`)})