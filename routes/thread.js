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
    const for_exist = await sql.doc.findFirst({
        where:{
            title:decodeURIComponent(document),
            namespace:decodeURIComponent(namespace)
        }
    })
    if (for_exist == null) {
        res.status(404).send("not found")
    } else if (cando.make_talk == true) {
        let talkid = uuidv1()
        await sql.talks.create({
            data:{
                namespace:namespace,
                title:document,
                talkid:talkid,
                talktitle:req.body.talktitle,
                status:"open" //???:fbi!!! open the door!
            }
        })
        await sql.talk.create({
            data:{
                talkid:talkid,
                type:"thread",
                body:req.body.body,
                author:author
            }
        })
        res.send(talkid)
    } else {
        res.send("no perms")
    }
})
app.post(`/:chatid`, async (req, res) => {
    try {
        let author = (req.session.info == undefined ? (req.body.author) : (req.session.info.name))
        const talk = await sql.talks.findFirst({
            where:{
                talkid:req.params.chatid
            }
        })
        if (talk == null) {
            res.send("not found L")
        }
        let cando = await candowiththisdoc(talk.title, talk.namespace, req)
        if (cando.make_talk == true) {
            await sql.talk.create({
                data:{
                    talkid:req.params.chatid,
                    type:"thread",
                    body:req.body.body,
                    author:author
                }
            })
        }
    } catch (err) {
        res.send([{body:"not found", author:"system"}])
    }
})
app.get(`/:chatid`, async (req, res) => {
    try {
        let viewer = (req.session.info == undefined ? (req.body.author) : (req.session.info.name))
        const chats = await sql.talk.findMany({
            where:{
                talkid:req.params.chatid
            }
        })
        if (chats.length == 0) {
            res.send("not found L")
        }
        res.send(chats)
    } catch (err) {
        res.send([{body:"not found", author:"system"}])
    }
    
})
app.get(`/:namespace/:title`, async (req, res) => {
    let viewer = (req.session.info == undefined ? (req.body.author) : (req.session.info.name))
    const chats = await sql.talks.findMany({
        where:{
            namespace:req.params.namespace,
            title:req.params.title
        }
    })
    if (chats.length == 0) {
        res.send([])
    } else {
        res.send(chats)
    }
})
module.exports = app