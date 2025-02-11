const {sql} = require("./ConnectDB")
const {parseACL} = require("./aclparser")
async function candowiththisdoc (doc_acl, user_groups, req) {
    let can_watch = false;
    let can_edit = false;
    let can_acl = false;
    const perms = await getuserpermission(user_groups);
    let acl_watch = doc_acl.watch; //음 난 조졌다.
    let acl_edit = doc_acl.edit;
    let acl_acl = doc_acl.acl;
    if (acl_watch == undefined) {
        if (perms.includes(" owner ")) {
            can_watch = true;
        } else {
            can_watch = false;
        }
    } else if (acl_edit == undefined) {
        if (perms.includes(" owner ")) {
            can_edit = true;
        } else {
            can_edit = false;
        }
    } else if (acl_acl == undefined) {
        if (perms.includes(" owner ")) {
            can_acl = true;
        } else {
            can_acl = false
        }
    }
    if (acl_watch != undefined) {
        acl_watch.map((fuck) => {
            let condition = fuck.condition;
            let allow = fuck.allow;
            if (perms.includes(" owner ")) {
                can_watch = true
            } else if (condition == "everyone") {
                    can_watch = allow
            } else {
                if (parseACL(condition, req) == true) {
                    can_watch = allow
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
                    can_edit = allow
            } else {
                if (parseACL(condition, req) == true) {
                    can_edit = allow
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
                    can_acl = allow
            } else {
                if (parseACL(condition, req) == true) {
                    can_edit = allow
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