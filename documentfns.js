const { sql } = require("./ConnectDB")

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
module.exports = {getbroken}