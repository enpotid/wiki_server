const {parseACL} = require("./aclparser")
async function candowiththisdoc (doc_acl, req) {
    const perms = (req.session.info == undefined) ? ([]) : (req.session.info.permission)
    let acl_watch = doc_acl.watch;
    let acl_edit = doc_acl.edit;
    let acl_acl = doc_acl.acl; //fuck
    let acl_make_talk = doc_acl.make_talk;
    let can_watch = false;
    let can_edit = false;
    let can_acl = false
    let can_make_talk = false
    if (perms.includes("owner")) {
        return {watch:true, edit:true, acl:true, make_talk:true}
    } else {
        if (acl_watch != undefined) {
            acl_watch.map((fuck) => {
                let condition = fuck.condition;
                let allow = fuck.allow;
                can_watch = (parseACL(condition, req) == true) ? (allow) : (can_watch)
            })
        }
        if (acl_edit != undefined) {
            acl_edit.map((fuck) => {
                let condition = fuck.condition;
                let allow = fuck.allow;
                can_edit = (parseACL(condition, req) == true) ? (allow) : (can_edit)
            })
        }
        if (acl_acl != undefined) {
            acl_acl.map((fuck) => {
                let condition = fuck.condition;
                let allow = fuck.allow;
                can_acl = allow && (parseACL(condition, req) == true)
            })   
        }
        if (acl_make_talk != undefined) {
            acl_make_talk.map((fuck) => {
                let condition = fuck.condition;
                let allow = fuck.allow;
                can_make_talk = allow && (parseACL(condition, req) == true)
            })   
        }
        //더 이상의 예외는 "없다"
        return {
            watch:can_watch,
            edit:can_edit,
            acl:can_acl,
            make_talk:can_make_talk
        }
    }
}
module.exports = {candowiththisdoc}