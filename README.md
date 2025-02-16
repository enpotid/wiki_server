# How To RUN
> npm install
> nodemon main.js
> or
> npm main.js
> cd parser
> cargo r
# meilisearch (검색엔진)
윈도우에서는 도커 쓰면 되는데 왠만하면 리눅스 쓰는 걸 추천함.
> docker run -it --rm -p 7700:7700 -e MEILI_MASTER_KET='your master key' -v ${pwd}/meili_data:/meili_data getmeili/meilisearch:v1.12
# .env
PORT=24879
DB_HOST="localhost"
DB_PORT=5432
DB_USER="postgres"
DB_PASSWORD="secret"
WIKINAME="caki"
DB_DBNAME="ILYKIWI"
SECRET="#248790ISTHEBESTCOLORTHATI'VEEVERSEEN(This IS SALT!)"
PARSER_SERVER="http://127.248.79.0:34879/process"
MEILISEARCH_API_KEY="caki"