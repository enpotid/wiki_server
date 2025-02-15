
function initmeili() {
    const client = new MeiliSearch({ host: 'http://localhost:7700', apiKey: process.env.MEILISEARCH_API_KEY })
    console.log(client.getIndexes({ limit: 3 }))
}

module.exports = { client, initmeili };
