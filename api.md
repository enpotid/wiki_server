# Wiki_server API 문서
라우터가 등록된 순서대로 서술합니다.
## 세션의 계념
세션이 존제한다는 것은, 요청의 해더에 Cookie 항목에 connect.sid라는 쿠키가 존제하고, 현제 파괴되지 않은 세션의 id가 그 쿠키의 값과 일치한다는 것을 말한다. 세션이 곂칠 확률은 16^256승정도 되고, 보안 관련해서 신경도 썼으니 걱정은 필요 없다.
## GET /document/{namespace}/{document}/
해당하는 이름 공간에 있는 문서의 내용을 파서 서버에 넘긴 후, 나오는 리턴값을 반환한다. 세션이 존제하면 유저의 그룹을 통해 권한을 얻어오고, 문서의 ACL을 분석하여, 유저가 이 문서를 볼 수 있는지 확인한다. <br />
IP사용자는 user그룹의 권한을 가진다.<br />
만약 권한 이 있을 시,
```
{렌더링된 문서의 내용}
```
이러한 내용이 반환된다. 참고로 application/json이 아닌 plain/text이다. (나중에 더 추가 예정)
만약 권한이 없으면
```
No perms
```
이 반환된다.
## POST /document/{namespace}/{document}/
```
fetch (`BACKEND/document/{namespace}/{document}/`, {
    method:"POST",
    headers:{
        "content":"application/json" <- 좋은 라이브러리를 쓴다면 문제가 없지만 fetch같은 경우는 필요하다.
        "Cookie":"connect.sid={session_id}",
    },
    body:{
        body:{body}
    }
})
```
body의 내용을 토대로 문서를 만든다. 문서가 존제하면 있는 문서를 수정하고, 존제하지 않으면, 새로 만든다. 만약 해당하는 이름공간이 존제하지 않으면 위키의 이름이랑 같은 이름공간에 저장된다.
## GET /raw/{namespace}/{document}/
문서의 원본 문법을 확인할 수 있는 곳(인데 누군가는 이미 바뀐 JSON을 집어넣는(...) )
문서가 존제한다면
```
{
    title: {title},
    body: {body},
    createdtime: {createdtime}, <- 이거 그냥 히스토리 뒤져서 찾으면 되지 않나?
    lastmodifiedtime: {lastmodifiedtime},
}
```
이러한 내용이 반환되고, 문서가 없으면 404 상태코드와 함꺠
```
{body:"Not Found"}
```
가 반환된다. 참고로 응답 타잎은 application/json.
## POST /register/
```
fetch (`BACKEND/register/`, {
    method:"POST",
    headers:{
        "content":"application/json" <- 좋은 라이브러리를 쓴다면 문제가 없지만 fetch같은 경우는 필요하다.
    },
    body:{
        name:{name},
        password:{password}
    }
})
```
이름이 이미 쓰였다면 상태 코드 200(참고로 이거는 기본값이다.)와 함깨
```
name already used
```
(plain/text)가 반환된다.
회원가입에 성공 하였다면
```
suc
```
<s>k</s>가 반환된다. (suc<s>k</s>cess의 약자)
## POST /login/
```
fetch (`BACKEND/login/`, {
    method:"POST",
    headers:{
        "content":"application/json" <- 좋은 라이브러리를 쓴다면 문제가 없지만 fetch같은 경우는 필요하다.
    },
    body:{
        name:{name},
        password:{password}
    }
})
```
Session을 만든다.
로그인을 성공하면
```
suc
```
을 반환하고,
실패하면
```
wrong
```
을 반환한다. <s>성공하면 썩, 실페하면 롱 아입니까??!</s>
그러나 이 API는 응답의 text보다 header가 더 중요하다.
Set-Cookie 해더에는 connect.sid가 들어 있는데 이 값은 나중에 유저 정보를 얻을 때, 세션 id로 사용해야 한다.
## GET /getuserinfo/
```
fetch (`BACKEND/getuserinfo/`, {
    headers:{
        "Cookie":"connect.sid={session_id}", <- 세션 id가 필요하다.
    },
})
```
이런 요청을 보내면
```
{
    info:{
        name:"test",
        password:"Salted And Tasty Hashed Password",
        ...(자세한 내용은 당신의 db의 user 테이블 참고)
    }
}
```
이러한 응답이 나온다.<s>놀랍게도 해쉬가 되어있긴 하지만 비밀번호도 나온다!</s>
## GET /search/{keyword}
만든 사람이 뭐 더 잘 알겠지. (일단 원래 있던걸 위키 기본 검색엔진으로 쓰고 검색 서버는 옵션으로 추가할 예정.)
## POST /setting/
```
const express = require("express");
const app = express.Router();
const { sql } = require("../ConnectDB")
app.use(express.json());
app.post(`/`, async (req, res) => {
    let body = req.body;
    if (req.session.info == undefined) {
        res.send("not login")
    } else {
        let name = req.session.info.name;
        await sql.query(`UPDATE users SET setting=$1 WHERE name=$2`, [body, name])
        req.session.info.setting = body
        res.send("changed")
    }
})
module.exports = app;
```
셋팅 바꾸는 API

docker run -it --rm -p 7700:7700 -e MEILI_ENV='development' -v ${pwd}/meili_data:/meili_data getmeili/meilisearch:v1.12