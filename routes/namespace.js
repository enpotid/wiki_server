const express = require("express");
const { sql } = require("../ConnectDB");
const { candowiththisns } = require("../usermanager");
const { Prisma, PrismaClient } = require("@prisma/client");
const app = express.Router();
app.use(express.json());
app.post(`/:namespace`, async (req, res) => {
    if (req.session.info == undefined) {
        res.send(`no perms`)
    }
    if (req.body.method == "acl") {
        if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("nsacl") || req.session.info.permission.includes("nsmgr")) {
            try {
                const before = await sql.namespace.findFirst({
                    where:{
                        name:req.params.namespace
                    }
                })
                await sql.namespace.update({
                    data:{
                        defaultacl:req.body.acl
                    },
                    where:{
                        name:req.params.namespace
                    }
                })
                await sql.log.create({
                    data:{
                        who:req.session.info.name,
                        type:"nsacl",
                        log:{
                            before:before.defaultacl,
                            after:req.body.acl,
                            log:req.body.log
                        }
                    }
                })
            } catch (err) {
                console.log(err)
                res.json({message:"not found"}) //다른 예외는 없겠지 뭐,
            }
        } else {
            res.send("no perms")
        }
    }
    if (req.body.method == "create") {
        if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("nsmgr")) {
            try {
                const resp = await sql.namespace.findFirst({
                    where:{name:req.params.namespace}
                })
                if (resp != null) {
                    res.send("nop")
                } else {
                    sql.namespace.create({
                        data:{name:req.params.namespace}
                    })
                    sql.log.create({
                        data:{
                            who:req.session.name,
                            type:"mkns",
                            log:{
                                before:before,
                                after:req.body.acl,
                                log:"not made"
                            }
                        }
                    })
                    res.send("suc")
                }
            } catch (err) {
                res.json({message:"not found"}) //다른 예외는 없겠지 뭐,
            }
        } else {
            res.send("no perms")
        }
    }
})
app.get(`/:nsname`, async (req, res) => {
    try {
        const resp = await sql.namespace.findFirst({
            where:{
                name:req.params.nsname
            }
        })
        res.json({acl:resp.defaultacl, candowiththisns:await candowiththisns(req.params.nsname, req)})
    } catch(e) {
        res.status(500).send("oops")
    }
    
})
app.get(`/`, async (req, res) => {
    try {
        const resp = await sql.namespace.findMany();    
        res.json(resp)
    } catch(e) {
        res.status(500).send("oops")
    }
    
})
module.exports = app;