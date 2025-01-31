const {sql} = require("./ConnectDB")
async function candowiththisdoc (doc_acl, user_groups) {
    let can_watch = false;
    let can_edit = false;
    const perms = await getuserpermission(user_groups);
    let acl_watch = doc_acl.watch; //음 난 조졌다.
    let acl_edit = doc_acl.edit;
    acl_watch.map((fuck) => {
        let condition = fuck.condition;
        let allow = fuck.allow;
        if (condition == "everyone") {
            if (perms.includes(" watch ")) {
                can_watch = allow
            }
        } else {

        }
    })
    acl_edit.map((fuck) => {
        let condition = fuck.condition;
        let allow = fuck.allow;
        if (condition == "everyone") {
            if (perms.includes("edit")) {
                can_edit = allow
            }
        } else {
            
        }
    })
    return {
        watch:can_watch,
        edit:can_edit
    }
}
async function getuserpermission (user_groups) {
    let perms = ""
    console.log(user_groups)
    for (let index = 0; index < user_groups.length; index++) {
        let groupname = user_groups[index].name;
        const resdb = await sql.query(`SELECT * FROM "groups" WHERE name=$1`, [groupname])
        let permissions = await resdb.rows[0].permissions;
        for (let i = 0; i < permissions.length; i++) {
            if (permissions[i].startsWith("+") && !perms.includes(" "+permissions[i].replace("+", "")+" ")) {
                perms = perms.concat(" "+permissions[i].replace("+", "")+" ")
            } else if (!perms.includes(" "+permissions[i].replace("+", "")+" ")) {
                console.log("a")
                perms = perms.replace(" "+permissions[i].replace("-", "")+" ", "")
            }
        }
        console.log(perms)
    }
    return perms
}
module.exports = {candowiththisdoc}