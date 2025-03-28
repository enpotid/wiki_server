const express = require("express")
const { sql } = require("../ConnectDB")
const { candowiththisdoc } = require("../usermanager")
const app = express.Router()
const {v1:uuidv1} = require("uuid")
app.use(express.json())
app.post(`/new/:namespace/:document`, async (req, res) => {
    if (req.body.body == undefined) {
        res.status(400).send("bad request 😂")
    }
    let namespace = req.params.namespace;
    let document = req.params.document;
    let author = (req.session.info == undefined ? (req.body.author) : (req.session.info.name))
    let cando = await candowiththisdoc(document, namespace, req)
    const for_acl = await sql.query(`SELECT * FROM doc WHERE title=$1 AND namespace=$2`, [decodeURIComponent(document), decodeURIComponent(namespace)])
    if (for_acl.rowCount == 0) {
        res.status(404).send("not found")
    } else if (cando.make_talk == true) {
        let talkid = uuidv1()
        await sql.query(`INSERT INTO talks (namespace, title, talkid, talktitle, status) VALUES ($1, $2, $3, $4, $5)`, [namespace, document, talkid, req.body.talktitle, "open"])
        await sql.query(`INSERT INTO talk (talkid, type, body, author) VALUES ($1, $2, $3, $4)`, [talkid, "thread", req.body.body, author])
        res.send(talkid)
    } else {
        res.send("no perms")
    }
})
app.post(`/:chatid`, async (req, res) => {
    try {
        let author = (req.session.info == undefined ? (req.body.author) : (req.session.info.name))
        const talk = await sql.query(`SELECT * FROM talks WHERE talkid=$1`, [req.params.chatid])
        if (talk.rowCount == 0) {
            res.send("not found L")
        }
        let cando = await candowiththisdoc(talk.rows[0].title, talk.rows[0].namespace, req)
        if (cando.make_talk == true) {
            sql.query(`INSERT INTO talk (talkid, type, body, author) VALUES ($1, $2, $3, $4)`, [req.params.chatid, "thread", req.body.body, author])
        }
    } catch (err) {
        res.send([{body:"not found", author:"system"}])
    }
})
app.get(`/:chatid`, async (req, res) => {
    try {
        let viewer = (req.session.info == undefined ? (req.body.author) : (req.session.info.name))
    const chats = await sql.query(`SELECT * FROM talk WHERE talkid=$1`, [req.params.chatid])
    if (chats.rowCount == 0) {
        res.send("not found L")
    }
    res.send(chats.rows)
    } catch (err) {
        res.send([{body:"not found", author:"system"}])
    }
    
})
app.get(`/:namespace/:title`, async (req, res) => {
    let viewer = (req.session.info == undefined ? (req.body.author) : (req.session.info.name))
    const chats = await sql.query(`SELECT * FROM talks WHERE namespace=$1 AND title=$2`, [req.params.namespace, req.params.title])
    if (chats.rowCount == 0) {
        res.send([])
    } else {
        res.send(chats.rows)
    }
})
module.exports = app