// 환경변수가 없으면 기본값 설정
require('dotenv').config();
const dbHost = process.env.DB_HOST || 'localhost';  // DB_HOST가 없으면 'localhost' 사용
const dbPort = process.env.DB_PORT || 5432;        // DB_PORT가 없으면 5432 사용
const dbUser = process.env.DB_USER || 'defaultUser'; // DB_USER가 없으면 'defaultUser' 사용
const dbPassword = process.env.DB_PASSWORD || 'defaultPassword'; // DB_PASSWORD가 없으면 'defaultPassword' 사용
const dbName = process.env.DB_DBNAME || 'defaultDatabase'; // DB_DBNAME이 없으면 'defaultDatabase' 사용
const { Pool } = require('pg');
const sql = new Pool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName
});

async function ConnectDB() {
    try {
        await sql.connect();
        console.log("DB에 접속하였습니다.");
        await HaveCorrectTable("doc", {
          columns: {
              title: 'text',
              body: 'text',
              createdtime: 'timestamp with time zone'
          },
          primaryKey: ['title'],  // Primary Key 설정
          default: {
              createdtime: 'CURRENT_TIMESTAMP'  // createdtime 컬럼의 기본값을 현재 시각으로 설정
          }
      });
    } catch (err) {
        console.log("err:" + err.message);
    }
}

// 테이블 존재 여부 확인 및 생성
async function HaveCorrectTable(name, options) {
  const checkTableQuery = `SELECT table_name FROM information_schema.tables WHERE table_name = $1`; // 테이블 존재 여부 확인 쿼리
  
  try {
      const res = await sql.query(checkTableQuery, [name]);

      if (res.rows.length === 0) {
          // 테이블이 존재하지 않으면 생성
          await createTable(name, options);
      } else {
          // 테이블이 존재하면 포맷 확인
          await checkTableFormat(name, options);
      }
  } catch (err) {
      console.error('테이블 확인 실패:', err.stack);
      process.exit(1); // 에러가 발생하면 종료
  }
}

// 테이블 포맷 확인 (컬럼 및 제약 조건 포함)
async function checkTableFormat(name, options) {
    const describeTableQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
    `;
    
    try {
        const res = await sql.query(describeTableQuery, [name]);
        const currentFormat = {};  // 현재 테이블의 컬럼명과 타입을 담을 객체
        
        res.rows.forEach(row => {
            currentFormat[row.column_name] = row.data_type;
        });

        // 컬럼 포맷 검증
        for (const column in options.columns) {
            if (!currentFormat[column]) {
                console.error(`Error: '${column}' 컬럼이 존재하지 않습니다.`);
                process.exit(1); 
            }

            if (currentFormat[column] !== options.columns[column]) {
                console.error(`Error: '${column}'의 타입이 '${currentFormat[column]}'입니다. '${options.columns[column]}'이어야 합니다.`);
                process.exit(1); 
            }
        }

        // 제약 조건 검증
        await checkConstraints(name, options);

        console.log('테이블 포맷이 정확합니다.');
    } catch (err) {
        console.error('테이블 구조 조회 실패:', err.stack);
        process.exit(1); 
    }
}

// 제약 조건 확인
async function checkConstraints(name, options) {
    const describeConstraintsQuery = `
        SELECT conname, contype, conkey
        FROM pg_constraint
        WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = $1)
    `;
    
    try {
        const res = await sql.query(describeConstraintsQuery, [name]);
        const constraints = res.rows.map(row => ({
            name: row.conname,
            type: row.contype,
            columns: row.conkey
        }));

        // Primary Key 체크
        if (options.primaryKey) {
            const primaryKey = constraints.filter(c => c.type === 'p')[0];
            if (!primaryKey) {
                console.error(`Primary Key가 설정되지 않았습니다.`);
                process.exit(1);
            }

            // OID 값을 실제 컬럼 이름으로 매핑
            const primaryKeyColumns = await getColumnsByOid(primaryKey.columns);

            // Primary Key 컬럼 비교
            if (JSON.stringify(primaryKeyColumns) !== JSON.stringify(options.primaryKey)) {
                console.error(`Primary Key가 예상과 다릅니다.`);
                console.error(`예상: ${JSON.stringify(options.primaryKey)}`);
                console.error(`실제: ${JSON.stringify(primaryKeyColumns)}`);
                process.exit(1);
            }
        }

        // Unique, Not Null 제약 체크 (필요시 추가 검증)

    } catch (err) {
        console.error('제약 조건 조회 실패:', err.stack);
        process.exit(1); 
    }
}

// OID를 컬럼명으로 변환하는 함수
async function getColumnsByOid(oidArray) {
    const oidQuery = `
        SELECT attname
        FROM pg_attribute
        WHERE attnum = ANY($1) AND attrelid = (SELECT oid FROM pg_class WHERE relname = 'doc')
    `;
    try {
        const res = await sql.query(oidQuery, [oidArray]);
        return res.rows.map(row => row.attname);
    } catch (err) {
        console.error('OID 변환 실패:', err.stack);
        process.exit(1);
    }
}

// 테이블 생성 함수 (제약 조건 포함)
async function createTable(name, options) {
  let createTableQuery = `CREATE TABLE ${name} (`;

  // 컬럼 정의
  for (const column in options.columns) {
      createTableQuery += `${column} ${options.columns[column]}`;

      // `NOT NULL` 제약이 있을 경우
      if (options.notNull && options.notNull.includes(column)) {
          createTableQuery += ' NOT NULL';
      }

      // 기본값 설정
      if (options.default && options.default[column]) {
          createTableQuery += ` DEFAULT ${options.default[column]}`;
      }

      createTableQuery += ', ';  // 각 컬럼 정의 후 쉼표 추가
  }

  // Primary Key 추가
  if (options.primaryKey && options.primaryKey.length > 0) {
      createTableQuery += `PRIMARY KEY (${options.primaryKey.join(', ')}), `;
  }

  // 마지막 쉼표 제거 후 닫는 괄호 추가
  createTableQuery = createTableQuery.slice(0, -2) + ')';

  try {
      await sql.query(createTableQuery);
      console.log(`테이블 '${name}'이 성공적으로 생성되었습니다.`);
  } catch (err) {
      console.error('테이블 생성 실패:', err.stack);
      process.exit(1); // 에러가 발생하면 종료
  }
}

module.exports = { ConnectDB, sql };
