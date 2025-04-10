require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express.Router();
const {candowiththisdoc, candowiththisns} = require("../usermanager")
const { sql } = require("../ConnectDB");
const { meili } = require("../meili");
const SHA256 = require("crypto-js/sha256");
const CryptoJS = require("crypto-js");
const { getbroken } = require("../documentfns");
const {v1:uuidv1} = require("uuid")
app.use(express.json({ limit: '50mb' }));
app.get(`/:namespace/:docname`, async (req, res) => {
  const ns = await sql.namespace.findMany({
    where:{
      name:req.params.namespace
    }
  })
  let namespace = (ns.length == 0 ? ("document") : (req.params.namespace));
  let docname = (ns.length == 0 ? (req.params.namespace+":"+req.params.docname) : (req.params.docname));
  const documentinfo = await sql.doc.findMany({
    where:{
      title:docname,
      namespace:namespace
    }
  })
  if (documentinfo.length == 0) {return res.status(404).json({content:"Document not found", candowiththisdoc:
    await candowiththisns(namespace, req),
    acl:{}
  });}
  const document = await sql.history.findMany({
    where:{
      title:docname,
      namespace:namespace,
      rev:documentinfo[0].lastrev
    }
  })
  let cando = (await candowiththisdoc(docname, namespace, req))
  canwatch = cando.watch
  if (canwatch) {
    const broken_link = await getbroken(document[0].body)
    try {
      const response = await axios.post(
        process.env.PARSER_SERVER,
        JSON.parse(
          `{"contents":${JSON.stringify(document[0].body).replace('"', '"')},"broken_links":${JSON.stringify(broken_link)},"title":"${docname}","namespace":"${namespace}"}`
        )
      );
      let content = {content:response.data,candowiththisdoc:cando,acl:documentinfo[0].acl}
      if (namespace == "category") {
        const resp = await sql.backlink.findFirst({
          where:{
            namespace:"category",
            title:docname
          }
        })
        content.backlinks = resp.links
      }
      res.json(content);
    } catch(err) {
      res.json({content:err+"Parser server not working Σ(っ °Д °<span style='color:red;'>;</span>)っ connect to server administrator", acl:documentinfo[0].acl,candowiththisdoc:cando})
    }    
  } else {
    res.json({content:"No perms",acl:documentinfo[0].acl,candowiththisdoc:cando})
  }
});
const index = meili.index(process.env.WIKINAME)
app.post(`/:namespace/:docname`, async (req, res) => {
  let body = req.body;
  const resp = await sql.namespace.findMany({
    where:{
      name:req.params.namespace
    }
  });
  let namespace = (resp.length == 0) ? ("document") : (req.params.namespace);
  let title = (resp.length == 0) ? (req.params.namespace+":"+req.params.docname) : (req.params.docname);;
  const resp2 = await sql.doc.findMany({
    where:{
      title:title,
      namespace:namespace
    }
  })
  let author = ((req.session.info != undefined) ? (req.session.info.name) : (body.author))
  if (resp2.length != 0) {
        if (body.method == "acl") {
          if ((await candowiththisdoc(title, namespace, req)).acl == true) {
            await sql.doc.updateMany({
              where:{
                namespace:namespace,
                title:title,
              },
              data:{
                acl:body.acl,
                lastrev:resp2[0].lastrev+1
              }
            })
            await sql.history.create({
              data:{
                rev:resp2[0].lastrev+1,
                title:title,
                namespace:namespace,
                log:req.body.log,
                hidden:false,
                body:(await sql.history.findFirst({
                  where:{
                    namespace:namespace,
                    title:title,
                    rev:resp2[0].lastrev
                  }
                })).body,
                uuid:uuidv1(),
                author:author
              }
            })
          } else {
            res.send("No Perms")
          }
        } else if (body.method == "edit") {
          if ((await candowiththisdoc(title, namespace, req)).edit == true) {
            await cleanbacklink(JSON.parse(resp2[0].links), namespace, title)
            let links = await parsebacklink(body.body);
            await mkbacklink(links, namespace, title)
            await sql.history.create({
              data:{
                namespace:namespace,
                title:title,
                rev:resp2[0].lastrev+1,
                body:body.body,
                log:body.log,
                author:author,
                uuid:uuidv1(),
                hidden:false
              }
            })
            await sql.doc.updateMany({
              where:{
                namespace:namespace,
                title:title,
              },
              data:{
                links:JSON.stringify(links),
                lastrev:resp2[0].lastrev+1
              }
            })
            res.send(`문서 '${namespace}:${title}'가 성공적으로 업데이트되었습니다.`);
          } else {
            res.send("No Perms");
          }
        }
      } else if (body.method == "acl") {
        await sql.history.create({
          data:{
            namespace:namespace,
            title:title,
            rev:0,
            body:"",
            log:body.log,
            author:author,
            uuid:uuidv1(),
            hidden:false
          }
        })
        await sql.doc.create({
          data:{
            title:title,
            namespace:namespace,
            uuid:uuidv1()
          }
        })
      } else {
        let links = await parsebacklink(body.body);
        await mkbacklink(links, namespace, title);
        // 동일한 title이 없다면 문서 추가
        await sql.history.create({
          data:{
            namespace:namespace,
            title:title,
            body:body.body,
            log:body.log,
            author:author,
            uuid:uuidv1(),
            hidden:false,
          }
        })
        await sql.doc.create({
          data:{
            title:title,
            links:JSON.stringify(links),
            namespace:namespace,
            uuid:uuidv1()
          }
        })
        let id = SHA256(namespace+":"+title).toString(
          CryptoJS.enc.Hex
        );
        await index.addDocuments([{id:id,title:title,namespace:namespace,prettytitle:namespace+":"+title, content:body}])
        res.send(`문서 '${title}'가 성공적으로 추가되었습니다.`);
    }
});
async function parsebacklink (body) {
  let regex = /\[\[(((?!\[\[|\]\]|\n).|\n)*)\]\]/g
  let result = []
  while (regex.test(body) == true) {
    for (let e of body.match(regex)) {
      let ew = e.split("|", 1)
      let ee = ew[0].slice(2, e.length - 2)
      let parsed = ee.split(":")
      let ns = (parsed[1] == undefined ? ("document") : (parsed[0]))
      let title = (parsed[1] == undefined ? (parsed[0]) : (parsed.slice(1).join(":")))
      result.push({namespace:ns,title:title})
      body = body.replace(e, "")
    }
  }
  return result
}
async function mkbacklink (links, ns, title) {
  for (let e of links) {
    const resp = await sql.backlink.findFirst({
      where:{
        namespace:e.namespace,
        title:e.title
      }
    })
    if (resp == null) {
      await sql.backlink.create({
        data:{
          namespace:e.namespace,
          title:e.title,
          links:JSON.stringify([{namespace:ns, title:title}]),
          uuid:uuidv1()
        }
      })
    } else {
      let links = JSON.parse(resp.links)
      if (!links.includes({namespace:ns, title:title})) {
        links.push({namespace:ns, title:title})
        await sql.backlink.updateMany({
          where:{
            namespace:e.namespace,
            title:e.title
          },
          data:{
            links:JSON.stringify(links)
          }
        })
      }
    }
  }
}
async function cleanbacklink(links, ns, title) {
  for (let e of links) {
    const resp = await sql.backlink.findFirst({
      where:{
        namespace:e.namespace,
        title:e.title
      }
    })
    let arr = JSON.parse(resp.links)
    let arrr = []
    arr = arr.filter(item => {
      arrr.push(JSON.stringify(item))
      return !arrr.includes(JSON.stringify(item))});
    console.log(arr)
    await sql.backlink.updateMany({
      where:{
        namespace:e.namespace,
        title:e.title
      },
      data:{
        links:JSON.stringify(arr)
      }
    })
  }
}
module.exports = app;
