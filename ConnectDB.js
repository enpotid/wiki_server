// 환경변수가 없으면 기본값 설정
require("dotenv").config();
const { Pool } = require("pg");
const sql = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
});

async function ConnectDB() {
  try {
    await sql.connect();
    await ChkTables();
    await ChkDB();
  } catch (err) {
    throw err;
  }
}
async function ChkTables() {
  let tables = [
    { name: "namespace",
      colums: [
        { name: "name", type: "text", keys: ["primary"], notnull: true},
        { name: "defaultacl", type: "json", default: "'{\"watch\":[\"everyone\"], \"edit\":[\"everyone\"]}'::json"}
      ]
    },
    {
      name: "doc",
      colums: [
        { name: "title", type: "text", notnull: true },
        { name: "body", type: "text", notnull: true },
        { name: "namespace", type: "text", notnull: true},
        {
          name: "createdtime",
          type: "timestamp with time zone",
          default: "CURRENT_TIMESTAMP",
        },
        {
          name: "lastmodifiedtime",
          type: "timestamp with time zone",
          default: "CURRENT_TIMESTAMP",
        },
        { name: "acl", type: "json", default: "'{\"watch\":[{\"condition\":\"everyone\",\"allow\":true}], \"edit\":[{\"condition\":\"everyone\",\"allow\":true}]}'::json" },
      ],
    },
    {
      name: "users",
      colums: [
        { name: "name", type: "text", keys: ["primary"], notnull: true },
        { name: "password", type: "text", notnull: true },
        {
          name: "createdtime",
          type: "timestamp with time zone",
          default: "CURRENT_TIMESTAMP",
        },
        { name: "user_group", type: "json", default:`'[{"name":"user", "expire":"none"}]'::json` },
        { name: "setting", type: "json", default:`'{}'::json` },
      ],
    },
    {
      name: "groups",
      colums: [
        { name:"name", type:"text", keys: ["primary"], notnull:true },
        { name:"permissions", type:"json", default:`'["+edit", "+watch"]'::json`}
      ]
    }
  ];
  await Chk_logic(tables);
}

/////////////////////////////////////////////////
//이 밑에 있는 코드는 꽤나 복잡한 코드이므로 내림//
/////////////////////////////////////////////////
async function Chk_logic(tables) {
  //주어진 테이블들이 있는지 확인.
  tables.map(async (tableinfo) => {
    //테이블이 있으면
    if (await IsTableExist(tableinfo.name)) {
      /*포멧이 올바른지 확인*/ await Chk_format(tableinfo);
    }
    //없으면
    else {
      console.log(
        `${tableinfo.name}테이블이 존제하지 않습니다. 테이블을 만들겠습니다.`,
      );
      //해당 테이블 정보를 바탕으로 쿼리문을 생성해 실행
      console.log(Mk_tableQuery(tableinfo))
      sql.query(Mk_tableQuery(tableinfo));
    }
  });
}
async function IsTableExist(tablename) {
  //파라미터에서 주어진 테이블 이름을 가진 테이블이 있는 지 확인
  const tables = await sql.query(
    "SELECT * FROM information_schema.tables WHERE table_name = $1",
    [tablename],
  );
  if (tables.rows.length === 0) {
    return false;
  } else {
    return true;
  }
}
async function IsColumnExist(tablename, columnname) {
  const tables = await sql.query(
    "SELECT * FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
    [tablename, columnname],
  );
  if (tables.rows.length === 0) {
    console.log(
      `${columnname}이라는 이름이 붙은 칼럼이 ${tablename}테이블 안에 존제하지 않습니다.`,
    );
    return false;
  } else {
    return tables.rows;
  }
}
async function Chk_format(tableformat) {
  let tablename = tableformat.name;
  tableformat.colums.map(async (columnformat) => {
    let Column = await IsColumnExist(tablename, columnformat.name);
    realtype = Column[0].data_type;
    corrtype = "";
    if (columnformat.type.includes("[]")) {
      corrtype = "ARRAY";
    } else {
      corrtype = columnformat.type;
    }
    if (Column != false) {
      if (!columnformat.type) {
        console.log("컬럼의 타잎 관련 셋팅이 잘못되었습니다");
        process.exit(1);
      } else if (realtype != corrtype) {
        console.log(
          `${columnformat.name} 컬럼의 주어진 컬럼 데이터 타잎은 ${corrtype}지만 실제 타잎은 ${Column[0].data_type}이랍니다.`,
        );
        process.exit(1);
      }
      if (columnformat.keys) {
        const keys = await sql.query(
          "SELECT conname, a.attname, c.relname FROM pg_constraint con JOIN pg_attribute a ON a.attnum = ANY(con.conkey) JOIN pg_class c ON c.oid = con.conrelid WHERE a.attname = $1 AND c.relname = $2 AND con.contype IN ('p', 'u')",
          [columnformat.name, tablename],
        );
        if (keys.rows[0] === undefined) {
          console.log("Key가 잘못되었습니다.");
          process.exit(1);
        }
      }
      if (columnformat.notnull) {
        if (Column[0].is_nullable === "YES") {
          console.log(
            `${columnformat.name}은 NOTNULL이 TRUE인 컬럼이여야 합니다.`,
          );
          process.exit(1);
        }
      }
      if (columnformat.default) {
        if (Column[0].column_default != columnformat.default) {
          console.log(
            `${columnformat.name}의 기본값은 ${columnformat.default}여야 한다. 현제 값:${Column[0].column_default}`,
          );
          process.exit(1);
        }
      }
    } else {
      process.exit(1);
    }
  });
}
function Mk_tableQuery(table) {
  let createTableSQL = `CREATE TABLE "${table.name}" (\n`;

  let columnSQL = table.colums
    .map((column) => {
      let columnDefinition = `${column.name} ${column.type}`;

      // NOT NULL 제약 조건 추가
      if (column.notnull) {
        columnDefinition += " NOT NULL";
      }

      // 기본값 추가
      if (column.default) {
        columnDefinition += ` DEFAULT ${column.default.replace("::json", "")}`;
      }

      // PRIMARY KEY 제약 조건 추가
      if (column.keys && column.keys.includes("primary")) {
        columnDefinition += " PRIMARY KEY";
      }
      return columnDefinition;
    })
    .join(",\n");

  createTableSQL += columnSQL + "\n)";
  return createTableSQL;
}
async function ChkDB() {
  const res = await sql.query(`SELECT 1 FROM namespace WHERE name=$1`, [process.env.WIKINAME])
  if (res.rowCount != 1) {
    console.log("위키의 기본 이름공간이 존제하지 않습니다. 기본 이름공간을 만들겠습니다.")
    await sql.query(`INSERT INTO namespace (name) VALUES ($1)`, [process.env.WIKINAME])
  }
  const res4 = await sql.query(`SELECT 1 FROM namespace WHERE name=$1`, ["사용자"])
  if (res4.rowCount != 1) {
    console.log("위키의 기본 이름공간이 존제하지 않습니다. 기본 이름공간을 만들겠습니다.")
    await sql.query(`INSERT INTO namespace (name) VALUES ($1)`, ["사용자"])
  }
  const res2 = await sql.query(`SELECT 1 FROM groups WHERE name=$1`, ["owner"])
  if (res2.rowCount != 1) {
    console.log("위키의 기본 사용자 그룹이 존제하지 않습니다. 기본 사용자 그룹을 만들겠습니다.")
    await sql.query(`INSERT INTO groups (name, permissions) VALUES ($1, $2)`, ["owner", "[\"owner\"]"])
    console.log(`위키를 처음 시작하시나요? http://localhost:${process.env.port}/config 에 접속하세요`)
  }
  const res3 = await sql.query(`SELECT 1 FROM groups WHERE name=$1`, ["user"])
  if (res3.rowCount != 1) {
    console.log("위키의 기본 사용자 그룹이 존제하지 않습니다. 기본 사용자 그룹을 만들겠습니다.")
    await sql.query(`INSERT INTO groups (name, permissions) VALUES ($1, $2)`, ["user", "[\"edit\", \"watch\"]"])
    console.log(`위키를 처음 시작하시나요? http://localhost:${process.env.port}/config 에 접속하세요`)
  }
}
module.exports = { sql, ConnectDB };
