//ACL parser made with js. Simple;;
//group:admin
//perm:watch
//everyone
//
function parseACL (cond, req) {
    let arr = cond.split(":",2);
    let condition = arr[0];
    let value = arr[1]
    console.log(`${condition}, ${value}`)
    if (condition == "group") {
        if (req.session.info == undefined) {
            if (value == "ip") {
                return true
            } else {
                console.log("a")
                return false
            }
        } else {
            for (let i = 0; i < req.session.info.user_group.length; i++) {
                if (req.session.info.user_group[i].name == value) {
                    return true
                }
            }
            return false
        }
    } else if (condition == "perms") {
        if (req.session.info == undefined) {
            if (" watch  edit ".contains(` ${value} `)) {
                return true;
            } else {
                return false;
            }
        } else {
            if (req.session.perms.contains(` ${value} `)) {
                return true;
            } else {
                return false;
            } 
        }
    }
}
module.exports = { parseACL }