const { MeiliSearch } = require('meilisearch')
const meili = new MeiliSearch({
  host: 'http://localhost:7700', // Meilisearch 서버 주소
  apiKey: process.env.MEILISEARCH_API_KEY         // Meilisearch API 키 (필요한 경우)
})
function initmeili() {
  const index = meili.index(process.env.WIKINAME)
  meili.createIndex(process.env.WIKINAME)
}
module.exports = { meili, initmeili };