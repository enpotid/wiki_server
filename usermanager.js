const { sql } = require("./ConnectDB");
const {parseACL} = require("./aclparser")
async function candowiththisdoc (docname, ns, req) {
    const resp = await sql.query(`SELECT acl from doc WHERE title=$1 AND namespace=$2`, 
        [docname, ns]
    )
    let doc_acl;
    if (resp.rowCount == 0) {
        const resp = await sql.query(`SELECT defaultacl from namespace WHERE name=$1`, 
            [ns]
        )
        doc_acl = resp.rows[0].defaultacl
    } else if (Object.keys(resp.rows[0].acl).length == 0) {
        const resp = await sql.query(`SELECT defaultacl from namespace WHERE name=$1`, 
            [ns]
        )
        doc_acl = resp.rows[0].defaultacl
    } else {
        doc_acl = resp.rows[0].acl
        
    }
    return cando_old(doc_acl, req)
}
async function candowiththisns (ns, req) {
    const resp = await sql.query(`SELECT defaultacl from namespace WHERE name=$1`, 
        [ns]
    )
    return cando_old(resp.rows[0].defaultacl, req)
}
function cando_old (doc_acl, req) {
    const perms = (req.session.info == undefined) ? ([]) : (req.session.info.permission)
    let acl_watch = doc_acl.watch;
    let acl_edit = doc_acl.edit;
    let acl_acl = doc_acl.acl; //fuck
    let acl_make_talk = doc_acl.make_talk;
    if (perms.includes("owner")) {
        return {watch:true, edit:true, acl:true, make_talk:true}
    } else {
        return {
            watch:acl(acl_watch),
            edit:acl(acl_edit),
            acl:acl(acl_acl),
            make_talk:acl(acl_make_talk)
        }
    }
    function acl(acl) {
        let alloww = false;
        if (acl != undefined) {
            acl.map((fuck) => {
                
                let condition = fuck.condition;
                let allow = fuck.allow;
                alloww = allow && (parseACL(condition, req) == true)
            })
        }
        return alloww;
    }
}
    
module.exports = {candowiththisdoc, cando_old, candowiththisns}