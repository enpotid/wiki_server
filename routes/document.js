require("dotenv").config();
const axios = require('axios');
const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB");
app.use(express.json());
app.get(`/:namespace/:docname`, (req, res) => {
  let docname = req.params.docname;
  let namespace = req.params.namespace;
  sql.query(`SELECT * FROM doc WHERE title=$1 AND namespace=$2`, [docname, namespace], async (err, resdb) => {
    if (err) {
      throw err;
    }

    if (resdb.rows.length === 0) {
      return res.status(404).send({ error: "Document not found" });
    }
    const response = await axios.post('http://127.0.0.1:34879/process', JSON.parse(`{"contents":${JSON.stringify(resdb.rows[0].body).replace('"', '\"')}}`));
    res.send(response.data);
  });
});

app.post(`/:namespace/:docname`, async (req, res) => {
  let title = req.params.docname;
  let namespace = req.params.namespace;
  const resp = await sql.query(`SELECT 1 FROM namespace WHERE name=$1`, [namespace],);
  if (resp.rowCount == 0) {
    namespace = process.env.WIKINAME;
  }
  let body = req.body.body;
  const checkQuery = `SELECT 1 FROM doc WHERE title = $1 AND namespace=$2`; // 동일한 title이 있는지 확인하는 쿼리
  const insertQuery = `INSERT INTO doc (title, body, namespace) VALUES ($1, $2, $3)`; // 새로운 문서 추가 쿼리
  const updateQuery = `UPDATE doc SET body = $2, lastmodifiedtime = CURRENT_TIMESTAMP WHERE title = $1 AND namespace = $3`;
  try {
    // 동일한 title이 존재하는지 확인
    sql.query(checkQuery, [title, namespace], (err, docinfo) => {
      if (err) {
        res.send("Failed to get Document");
      }
      if (docinfo.rows.length != 0) {
        sql.query(updateQuery, [title, body, namespace], (err, _res) => {
          if (err) {
            res.send("Failed To Update Doc");
          }
          res.send(`문서 '${namespace}:${title}'가 성공적으로 업데이트되었습니다.`);
        });
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
