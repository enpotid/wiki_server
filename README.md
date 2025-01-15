# How To RUN
> npm install
> nodemon main.js
> or
> npm main.js
> cd parser
> cargo r
# .env
PORT=24879
DB_HOST="localhost"
DB_PORT=5432
DB_USER="postgres"
DB_PASSWORD="secret"
WIKINAME="wikiname"
DB_DBNAME="dbname"
# API
ip:port/document/namespace/document => get -> 문서 내용이 html로 파스된 상태
ip:port/documtnt/namespace/document => post -> 문서 내용을 더하거나 수정

# test API with https://reqbin.com/ using extension