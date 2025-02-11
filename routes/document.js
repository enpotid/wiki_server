require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express.Router();
const {candowiththisdoc} = require("../usermanager")
const { sql } = require("../ConnectDB");
app.use(express.json());
app.get(`/:namespace/:docname`, async (req, res) => {
  let docname = req.params.docname;
  let namespace = req.params.namespace;
  let canwatch = false;
  const documentinfo = await sql.query(`SELECT * FROM doc WHERE title=$1 AND namespace=$2`, [docname, namespace])
  if (documentinfo.rowCount === 0) {return res.status(404).send("Document not found");}
  let documentACL = documentinfo.rows[0].acl;
  if (req.session.info == undefined) {
    console.log("not login")
    canwatch = await candowiththisdoc(documentACL, [{"name":"user", "expire":"none"}], req)
  } else {
    canwatch = await candowiththisdoc(documentACL, req.session.info.user_group, req)
  }
  if (canwatch.watch) {
        const response = await axios.post(
          process.env.PARSER_SERVER,
          JSON.parse(
            `{"contents":${JSON.stringify(documentinfo.rows[0].body).replace('"', '"')}}`
          )
        );
        res.send(response.data);
  } else {
    res.send("No perms")
  }
  
});

app.post(`/:namespace/:docname`, async (req, res) => {
  let title = req.params.docname;
  let namespace = req.params.namespace;
  let body = req.body.body;
  let user_groups = [{name:"user"}];
  if (req.session.info != undefined) {
    user_groups = req.session.info.user_group
  }
  const resp = await sql.query(`SELECT 1 FROM namespace WHERE name=$1`, [
    namespace,
  ]);
  if (resp.rowCount == 0) {
    namespace = process.env.WIKINAME;
  }
  const checkQuery = `SELECT * FROM doc WHERE title = $1 AND namespace=$2`; // 동일한 title이 있는지 확인하는 쿼리
  const insertQuery = `INSERT INTO doc (title, body, namespace) VALUES ($1, $2, $3)`; // 새로운 문서 추가 쿼리
  const updateQuery = `UPDATE doc SET body = $2, lastmodifiedtime = CURRENT_TIMESTAMP WHERE title = $1 AND namespace = $3`;
  try {
    // 동일한 title이 존재하는지 확인
    sql.query(checkQuery, [title, namespace], async (err, docinfo) => {
      if (err) {
        res.send("Failed to get Document");
      }
      if (docinfo.rows.length != 0) {
        if (req.body.acl != undefined) {
          if ((await candowiththisdoc(docinfo.rows[0].acl, user_groups, req)).acl == true) {
            sql.query(`UPDATE doc SET acl = $1 WHERE title = $2 AND namespace = $3`, [req.body.acl, title, namespace])
          } else {
            res.send("No Perms")
          }
        } else {
          if ((await candowiththisdoc(docinfo.rows[0].acl, user_groups, req)).edit == true) {
            sql.query(updateQuery, [title, body, namespace], (err, _res) => {
              if (err) {
                res.send("Failed To Update Doc");
              }
              res.send(
                `문서 '${namespace}:${title}'가 성공적으로 업데이트되었습니다.`
              );
            });
          } else {
            res.send("No Perms");
          }
        }
      } else {
        // 동일한 title이 없다면 문서 추가
        sql.query(insertQuery, [title, body, namespace]);
        res.send(`문서 '${title}'가 성공적으로 추가되었습니다.`);
      }
    });
    // 동일한 title이 존재하면 그 문서 업데이트
  } catch (err) {
    console.error("문서 추가 실패:", err.stack);
  }
});

module.exports = app;
