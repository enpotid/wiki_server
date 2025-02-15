const {sql} = require("./ConnectDB")
const {parseACL} = require("./aclparser")
async function candowiththisdoc (doc_acl, user_groups, req) {
    const perms = await getuserpermission(user_groups);
    let acl_watch = doc_acl.watch;
    let acl_edit = doc_acl.edit;
    let acl_acl = doc_acl.acl;
    let can_watch = bypassowner(doc_acl.watch);
    let can_edit = bypassowner(doc_acl.edit);
    let can_acl = bypassowner(doc_acl.acl);
    function bypassowner (docacl) {
        if (docacl == undefined || docacl.length == 0) {
            if (perms.includes(" owner ")) {
                return true;
            }
            return false;
        } else {
            if (perms.includes(" owner ")) {
                return true;
            }
            return true;
        }
    }
    if (acl_watch != undefined) {
        acl_watch.map((fuck) => {
            let condition = fuck.condition;
            let allow = fuck.allow;
            if (perms.includes(" owner ")) {
                can_watch = true
            } else if (condition == "everyone") {
                    can_watch = allow && can_watch
            } else {
                if (parseACL(condition, req) == true) {
                    can_watch = allow
                } else {
                    can_watch = !allow && can_watch
                }
            }
        })
    }
    if (acl_edit != undefined) {
        acl_edit.map((fuck) => {
            let condition = fuck.condition;
            let allow = fuck.allow;
            if (perms.includes(" owner ")) {
                can_edit = true
            } else if (condition == "everyone") {
                    can_edit = allow && can_edit
            } else {
                if (parseACL(condition, req) == true) {
                    can_edit = allow && can_edit
                } else {
                    can_edit = !allow && can_edit
                }
            }
        })
    }
    if (acl_acl != undefined) {
        acl_acl.map((fuck) => {
            let condition = fuck.condition;
            let allow = fuck.allow;
            if (perms.includes(" owner ")) {
                can_acl = true
            } else if (condition == "everyone") {
                    can_acl = allow && can_acl
            } else {
                if (parseACL(condition, req) == true) {
                    can_acl = allow && can_acl
                } else {
                    can_acl = !allow && can_acl
                }
            }
        })   
    }
    //더 이상의 예외는 "없다"
    return {
        watch:can_watch,
        edit:can_edit,
        acl:can_acl
    }
}
async function getuserpermission (user_groups) {
    let perms = ""
    for (let index = 0; index < user_groups.length; index++) {
        let groupname = user_groups[index].name;
        const resdb = await sql.query(`SELECT * FROM "groups" WHERE name=$1`, [groupname])
        let permissions = await resdb.rows[0].permissions;
        for (let i = 0; i < permissions.length; i++) {
            if (permissions[i].startsWith("+") && !perms.includes(" "+permissions[i].replace("+", "")+" ")) {
                perms = perms.concat(" "+permissions[i].replace("+", "")+" ")
            } else if (!perms.includes(" "+permissions[i].replace("+", "")+" ")) {
                perms = perms.replace(" "+permissions[i].replace("-", "")+" ", "")
            }
        }
    }
    return perms
}
module.exports = {candowiththisdoc, getuserpermission}