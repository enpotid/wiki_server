const express = require("express");
const { sql } = require("../ConnectDB");
const { candowiththisdoc } = require("../usermanager");
const { default: axios } = require("axios");
const { getbroken } = require("../documentfns");
const app = express.Router();
app.get(`/:namespace/:document/list/:nums/:pages`, (req, res) => {
    let nums = req.params.nums
    let pages = req.params.pages;
    if (nums > 100) {
        res.status(400).send("Too lot.")
    } else if (isNaN(Number(nums))) {
        res.status(400).send("Bad Request")
    } else {
        if (nums > 100) {
            res.status(400).send("Too lot.")
        } else if (isNaN(Number(nums))) {
            res.status(400).send("Bad Request")
        } else {
            process(req, res, nums)
        }
    }
    async function process(req, res, nums) {
        let namespace = req.params.namespace;
        let document = req.params.document;
        let gethidden = false;
        let where = {
            namespace:namespace,
            title:document,
        }
        if (req.session.info != undefined) {
            gethidden = (req.session.info.permission.includes("hide_rev") || req.session.info.permission.includes("owner")) ? (true) : (false)
        }
        if (gethidden == true) {
            where.OR = [{hidden:true}, {hidden:false}]
        } else {
            where.hidden = false
        }
        const resp = await sql.history.findMany({
            select:{
                hidden:true,
                rev:true,
                log:true,
                modifiedtime:true,
                author:true
            },
            where:where,
            orderBy:{
                rev:"desc"
            }
        })
        if (resp.length == 0) {
            res.status(404).json({message:"not found"})
        } else {
            res.json({message:"suc",history:resp})
        }
    }
})
app.get(`/:namespace/:document/:rev`, async (req, res) => {
    let namespace = req.params.namespace;
    let document = req.params.document;
    let rev = req.params.rev
    const resp = await sql.history.findFirst({
        where:{
            namespace:namespace,
            title:document,
            rev:Number(rev)
        }
    })
    if (resp == null) {
        res.status(404).json({message:"not found"})
    } else {
        if (resp.hidden) {
            if (req.session.info != undefined) {
                if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("hide_rev") ) {
                    res.json({message:"make log"})
                } else {
                    res.json({message:"hidden"})
                }
            } else {
                res.json({message:"hidden"})
            }
        } else {
            let candowiththisdic = await candowiththisdoc(document, namespace, req)
            if (candowiththisdic.watch == true) {
                try {
                    const broken_link = await getbroken(resp.body)
                    const response = await axios.post(
                        process.env.PARSER_SERVER,
                        JSON.parse(
                          `{"contents":${JSON.stringify(resp.body).replace('"', '"')},"broken_links":${JSON.stringify(broken_link)},"title":"${document}","namespace":"${namespace}"}`
                        )
                      );
                    res.json({message:"suc", body:response.data, log:resp.log, modifiedtime:resp.modifiedtime,author:resp.author})
                } catch (err) {
                   res.json({message:"suc", body:JSON.stringify(err), log:resp.log, modifiedtime:resp.modifiedtime,author:resp.author}) 
                }
            } else {
                res.json({message:"no perms"})
            }
        }
    }
})
app.post(`/:namespace/:document/:rev`, async (req, res) => {
    let namespace = req.params.namespace;
    let title = req.params.document;
    let rev = req.params.rev;
    if ((await candowiththisdoc(title, namespace, req)).watch) {
        if (req.session.info == undefined) {
            res.send("nop")
        } else if (
            req.session.info.permission.includes("owner"),
            req.session.info.permission.includes("hide_rev")
        ) {
            await sql.log.create({
                data:{
                    who:req.session.info.name,
                    type:"watch_hidden_rev" //그런데 togglehide기능으로 보면 되는거 아닌가.
                    //음 그러면 설정으로 끄 킴 가능하게 하고, 이 기능이 켜져있으면 togglehide에도 로그 남기게?
                    ,log:{namespace:namespace,title:title,rev:rev,log:req.body.log}
                }
            })
            const resp = await sql.history.findFirst({
                where:{
                    title:title,
                    namespace:namespace,
                    rev:rev
                }
            })
            const broken_link = await getbroken(resp.body)
                    const response = await axios.post(
                    process.env.PARSER_SERVER,
                    JSON.parse(
                      `{"contents":${JSON.stringify(resp.body).replace('"', '"')},"broken_links":${JSON.stringify(broken_link)},"title":"${document}","namespace":"${namespace}"}`
                    )
                  );
                res.json({message:"suc", body:response.data, log:resp.log, modifiedtime:resp.modifiedtime,author:resp.author})
            res.send()
        } else {
            res.send("nop")
        }
    } else {
        res.send("nop")
    }
})
app.get(`/:namespace/:document/:rev/togglehide`, async (req, res) => {
    let namespace = req.params.namespace;
    let document = req.params.document;
    let rev = req.params.rev
    const resp = await sql.history.findFirst({
        where:{
            namespace:namespace,
            title:document,
            rev:Number(rev)
        }
    })
    if (resp == null) {
        res.status(404).json({message:"not found"})
    } else {
        if (req.session.info != undefined) {
            if (req.session.info.permission.includes("owner") || req.session.info.permission.includes("hide_rev") ) {
                await sql.history.updateMany({
                    data:{
                        hidden:!resp.hidden,
                    },
                    where:{
                        title:document,
                        namespace:namespace,
                        rev:Number(rev)
                    }
                })
                res.json({message:"suc"})
            } else {
                res.json({message:"no perm"})
            }
        } else {
            res.json({message:"no perm"})
        }
    }
})
module.exports = app;