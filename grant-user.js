const { sql } = require("./ConnectDB");
const readline = require('readline');

// readline 인터페이스 생성
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question('이름을 입력하세요: ', async (name) => {
    await sql.users.updateMany({
        where:{
            name:name
        },
        data:{
            permission:["owner"]
        }
    })
  rl.close();
});