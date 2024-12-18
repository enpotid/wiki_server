const fs = require('fs');
const path = require('path');
const defaultEnvContent = `
DB_HOST=localhost
DB_PORT=5432
DB_USER=myuser
DB_PASSWORD=mypassword
DB_DBNAME=mydatabase
PORT=24879
`;

// .env 파일 경로
const envFilePath = path.join(__dirname, '.env');

// .env 파일이 존재하지 않으면 기본값으로 생성
if (!fs.existsSync(envFilePath)) {
    console.log('.env 파일이 없습니다. 기본값을 생성합니다.');
    fs.writeFileSync(envFilePath, defaultEnvContent, 'utf8');
    console.log('.env 파일이 생성되었습니다.');
    process.exit(1);
} else {
    console.log('.env 파일이 이미 존재합니다.');
}
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