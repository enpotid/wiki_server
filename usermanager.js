const { sql } = require("./ConnectDB");
const {parseACL} = require("./aclparser")
async function candowiththisdoc (docname, ns, req) {
    const resp = await sql.doc.findFirst({
        where:{
            title:docname,
            namespace:ns
        }
    })
    let doc_acl;
    if (resp == null) {
        const resp = await sql.namespace.findFirst({
            where:{
                name:ns
            },
            select:{
                defaultacl:true
            }
        })
        doc_acl = resp.defaultacl
    } else if (Object.keys(resp.acl).length == 0) {
        const resp = await sql.namespace.findFirst({
            where:{
                name:ns
            },
            select:{
                defaultacl:true
            }
        })
        doc_acl = resp.defaultacl
    } else {
        doc_acl = resp.acl
        
    }
    return cando_old(doc_acl, req)
}
async function candowiththisns (ns, req) {
    const resp = await sql.namespace.findFirst({
        where:{
            name:ns
        }
    })
    return cando_old(resp.defaultacl, req)
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