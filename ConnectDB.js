require("dotenv").config();
const { json } = require("express");
const mysql = require('mysql');
const sql = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DBNAME
});
async function ConnectDB() {
    try {
        await new Promise((resolve, reject) => {
            sql.connect((err) => {
                if (err) {reject(err); }
                else {
                    console.log("DB에 접속하였습니다.");
                    resolve();
                    HaveCorrectTable("doc", {title: 'text', body: 'text', createdtime: 'timestamp'})
                }
            });
        });
    } catch (err) {
            if (err.errno == 1045) { console.log("DB 로그인에 실패하였습니다. HOST, USER, PASSWORD 등을 확인해 주세요."); }
            if (err.errno == 1049) { console.log("DB 로그인에 실패하였습니다. 테이터베이스가 없습니다."); }
    }
}
function HaveCorrectTable(name, format) {
    const checkTableQuery = `SHOW TABLES LIKE '${name}'`; // 테이블 존재 여부 확인 쿼리
  
    // 테이블이 존재하는지 확인
    sql.query(checkTableQuery, (err, results) => {
      if (err) {
        console.error('테이블 확인 실패:', err.stack);
        process.exit(1); // 에러가 발생하면 종료
      }
  
      if (results.length === 0) {
        // 테이블이 존재하지 않으면 생성
        createTable(name, format);
      } else {
        // 테이블이 존재하면 포맷 확인
        checkTableFormat(name, format);
      }
    });
  }
  
  /**
   * 테이블 포맷이 주어진 포맷과 일치하는지 확인하는 함수
   * @param {string} name 테이블 이름
   * @param {Object} format 테이블 포맷
   */
  function checkTableFormat(name, format) {
    const describeTableQuery = `DESCRIBE ${name}`; // 테이블 구조 확인 쿼리
  
    sql.query(describeTableQuery, (err, results) => {
      if (err) {
        console.error('테이블 구조 조회 실패:', err.stack);
        process.exit(1); // 에러가 발생하면 종료
      }
  
      const currentFormat = {};  // 현재 테이블의 컬럼명과 타입을 담을 객체
  
      results.forEach(row => {
        currentFormat[row.Field] = row.Type;
      });
  
      // 포맷 검증
      for (const column in format) {
        if (!currentFormat[column]) {
          console.error(`Error: '${column}' 컬럼이 존재하지 않습니다.`);
          process.exit(1); // 컬럼이 없으면 종료
        }
  
        if (currentFormat[column] !== format[column]) {
          console.error(`Error: '${column}'의 타입이 '${currentFormat[column]}'입니다. '${format[column]}'이어야 합니다.`);
          process.exit(1); // 타입이 일치하지 않으면 종료
        }
      }
  
      // 포맷이 올바르면 true 반환
      console.log('테이블 포맷이 정확합니다.');
      return true;
    });
  }
  
  /**
   * 테이블이 존재하지 않으면 새로 생성하는 함수
   * @param {string} name 테이블 이름
   * @param {Object} format 테이블 포맷
   */
  function createTable(name, format) {
    let createTableQuery = `CREATE TABLE ${name} (`; // 테이블 생성 쿼리 시작
  
    for (const column in format) {
      createTableQuery += `${column} ${format[column]}, `;
    }
  
    // 마지막 쉼표 제거하고 닫는 괄호 추가
    createTableQuery = createTableQuery.slice(0, -2) + ')';
  
    sql.query(createTableQuery, (err, results) => {
      if (err) {
        console.error('테이블 생성 실패:', err.stack);
        process.exit(1); // 에러가 발생하면 종료
      }
  
      console.log(`테이블 '${name}'이 성공적으로 생성되었습니다.`);
    });
  }
module.exports = {ConnectDB, sql}