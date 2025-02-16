# 이번 업데이트로 더 어려워진 ACL에 대하여 총정리
## ACL이 허용 상태로 되려면, 모든 조건에 다 걸려야 하며, 그 조건의 allow가 true여야 한다.
admin 그룹이랑 notice 그룹에 있는 유저가 있다고 가정하자.
이 유저는 이러한 읽기 ACL이 걸려있는 문서를 보려 한다.
{ condition: 'everyone', allow: true },
{ condition: 'group:admin', allow: true }
이때 이 유저는 everyone컨디션을 만족하고(everyone 컨디션은 항상 걸리는 조건) 그 allow가 true이다. 첫번쨰 조건은 참을 반환한다.
이 유저는 admin그룹을 가지고 있기 때문에 2번쨰 조건에도 걸리고 allow가 true라서 2번쨰 조건도 참이다.

두 조건이 모두 참이므로 이 유저는 해당 문서를 볼 수 있다.

notice 그룹에 있는 유저가 있다고 가정하자.
이 유저는 이러한 읽기 ACL이 걸려있는 문서를 보려 한다.
{ condition: 'everyone', allow: true },
{ condition: 'group:admin', allow: true }
이떄 1번은 아까와 같이 만족하지만, 2번의 조건에는 걸리지 않는다. 그러므로 이 유저는 해당 문서를 볼 수 없다.

## 예외적으로 allow가 false인 경우에는 그 조건을 만족하지 __않아야만__ 참이 된다.
## 나중에 추가할 기능이지만 evendough 접두사가 붙으면 or 같은 역할을 한다.
이런식

프로그레밍 문법
!everyone || group == admin

ACL JSON
{ condition: 'everyone', allow: false },
{ condition: 'evendoughgroup:admin', allow: true }


### 예시들
everyone = true
프로그레밍 문법
!everyone || group == admin

ACL JSON
{ condition: 'everyone', allow: false },
{ condition: 'evendoughgroup:admin', allow: true }

프로그레밍 문법
(!everyone || group.includes(admin)) && group.includes(notice)

ACL JSON
{ condition: 'everyone', allow: false },
{ condition: 'evendoughgroup:admin', allow: true }
{ condition: 'group:notice', allow: true }

everyone && group.includes(admin) && group.includes(notice)

ACL JSON
{ condition: 'everyone', allow: true },
{ condition: 'evendoughgroup:admin', allow: true }
{ condition: 'group:notice', allow: true }

뭐 그래도 햇갈리는거 있음 디코 id Duswnsey니까 dm 하면 됨.
instagram
gmail
facebook
같은것들도 닉은 먹었는데 잘 안봄.
햇갈리면 태섭에서 권한요청 해보셈 이게 가장 이해하기 편함 ㅇㅇ