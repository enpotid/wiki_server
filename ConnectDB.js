// 환경변수가 없으면 기본값 설정
require('dotenv').config();
const dbHost = process.env.DB_HOST || 'localhost';  // DB_HOST가 없으면 'localhost' 사용
const dbPort = process.env.DB_PORT || 5432;        // DB_PORT가 없으면 5432 사용
const dbUser = process.env.DB_USER || 'defaultUser'; // DB_USER가 없으면 'defaultUser' 사용
const dbPassword = process.env.DB_PASSWORD || 'defaultPassword'; // DB_PASSWORD가 없으면 'defaultPassword' 사용
const dbName = process.env.DB_DBNAME || 'defaultDatabase'; // DB_DBNAME이 없으면 'defaultDatabase' 사용
const { Pool } = require('pg');
const sql = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME
});

async function ConnectDB() {
    try {
        await sql.connect();
        await ChkDocTable();
    } catch (err) {
        throw err;
    }
}
async function ChkDocTable() {
    let tablelist = [
        doc: {
            type : "text",

        }
    ];
        if (await IsTableExist()) {}
}
async function IsTableExist(tablename) {
    sql.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = '$1'", [tablename], (err, tables) => {
        if (tables === undefined) {console.log("Doc이라는 이름이 붙은 테이블이 존제하지 않습니다."); return false;}
        else {return true;}
    })
}
module.exports = {sql, ConnectDB}