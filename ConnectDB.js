const { PrismaClient } = require("@prisma/client");

const sql = new PrismaClient();
function ConnectDB () {
    let dafaultns = ["file", "user", process.env.WIKINAME, "category"] 
    dafaultns.map(async (e) => {
        const ns = await sql.namespace.findUnique({
            where:{
                name:e
            }
        })
        if (ns == null) {
            console.log("위키 기본 이름공간 미존제. 생성하겠음")
            await sql.namespace.create({
                data: {
                    name:e
                }
            })
        }
    })
}
module.exports = {sql, ConnectDB}