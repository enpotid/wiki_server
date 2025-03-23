require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express.Router();
const {candowiththisdoc} = require("../usermanager")
const { sql } = require("../ConnectDB");
const { meili } = require("../meili");
const SHA256 = require("crypto-js/sha256");
const CryptoJS = require("crypto-js");
app.use(express.json({ limit: '50mb' }));
app.get(`/:namespace/:docname`, async (req, res) => {
  let docname = req.params.docname;
  let namespace = req.params.namespace;
  const documentinfo = await sql.query(`SELECT * FROM doc WHERE title=$1 AND namespace=$2`, [docname, namespace])
  if (documentinfo.rowCount === 0) {return res.status(404).json({content:"Document not found", candowiththisdoc:{edit:false, watch:false, acl:false}});}
  const document = await sql.query(`SELECT * FROM history WHERE title=$1 AND namespace=$2 AND rev=$3`, [docname, namespace, documentinfo.rows[0].lastrev])
  let cando = (await candowiththisdoc(documentinfo.rows[0].acl, req))
  canwatch = cando.watch
  if (canwatch) {
    const broken_link = await getbroken(document.rows[0].body)
    console.log(JSON.stringify(broken_link))
    try {
      const response = await axios.post(
        process.env.PARSER_SERVER,
        JSON.parse(
          `{"contents":${JSON.stringify(document.rows[0].body).replace('"', '"')},"broken_links":${JSON.stringify(broken_link)}}`
        )
      );
      res.json({content:response.data,candowiththisdoc:cando,acl:documentinfo.rows[0].acl});
    } catch(err) {
      res.json({content:err+"Parser server not working Σ(っ °Д °<span style='color:red;'>;</span>)っ connect to server administrator", acl:documentinfo.rows[0].acl,candowiththisdoc:cando})
    }    
  } else {
    res.json({content:"No perms",acl:documentinfo.rows[0].acl,candowiththisdoc:cando})
  }
});
const index = meili.index(process.env.WIKINAME)
app.post(`/:namespace/:docname`, async (req, res) => {
  let title = req.params.docname;
  let body = req.body;
  const resp = await sql.query(`SELECT * FROM namespace WHERE name=$1`, [req.params.namespace,]);
  let namespace = (resp.rowCount == 0) ? ("document") : (req.params.namespace);
  const resp2 = await sql.query(`SELECT * FROM doc WHERE title=$1 AND namespace=$2`, [title, namespace])
  let author = ((req.session.info != undefined) ? (req.session.info.name) : (body.author))
  if (resp2.rows.length != 0) {
        if (body.method == "acl") {
          if ((await candowiththisdoc(resp2.rows[0].acl, req)).acl == true) {
            sql.query(`UPDATE doc SET acl=$3 WHERE namespace=$1 AND title=$2`, [
              namespace,
              title,
              body.acl
            ])
          } else {
            res.send("No Perms")
          }
        } else if (body.method == "edit") {
          if ((await candowiththisdoc(resp2.rows[0].acl, req)).edit == true) {
            sql.query(`INSERT INTO history (namespace, title, rev, body, log, author) VALUES ($1, $2, $3, $4, $5, $6)`, [
              namespace,
              title,
              resp2.rows[0].lastrev+1,
              body.body,
              body.log,
              author
            ])
            sql.query(`UPDATE doc SET lastrev=$1 WHERE namespace=$2 AND title=$3`, [
              resp2.rows[0].lastrev + 1,
              namespace,
              title
            ])
            res.send(`문서 '${namespace}:${title}'가 성공적으로 업데이트되었습니다.`);
          } else {
            res.send("No Perms");
          }
        }
      } else {
        // 동일한 title이 없다면 문서 추가
        sql.query(`INSERT INTO history (namespace, title, body, log, author) VALUES ($1, $2, $3, $4, $5)`, [
          namespace,
          title,
          body.body,
          body.log,
          author //프론트랑 API Key로 연동할꺼라서 변조 걱정 ㄴㄴ
        ]);
        sql.query(`INSERT INTO doc (title,namespace) VALUES ($1, $2)`, [
          title,
          namespace
        ])
        let id = SHA256(namespace+":"+title).toString(
          CryptoJS.enc.Hex
        );
        await index.addDocuments([{id:id,title:title,namespace:namespace,prettytitle:namespace+":"+title, content:body}])
        res.send(`문서 '${title}'가 성공적으로 추가되었습니다.`);
    }
});
async function getbroken (body) {
  let regex = /\[\[(((?!\[\[|\]\]|\n).|\n)*)\]\]/g
  let result = []
  while (regex.test(body) == true) {
    for (let e of body.match(regex)) {
      let ew = e.split("|", 1)
      let ee = ew[0].slice(2, e.length - 2)
      let parsed = ee.split(":")
      let ns = (parsed[1] == undefined ? ("document") : (parsed[0]))
      let title = (parsed[1] == undefined ? (parsed[0]) : (parsed.slice(1).join(":")))
      const resp = await sql.query(`SELECT * FROM doc WHERE namespace=$1 AND title=$2`, [ns, title])
      if (resp.rowCount == 1) {
        result.push(true)
      } else {
        result.push(false)
      }
      body = body.replace(e, "")
    }
  }
  return result
}


module.exports = app;
