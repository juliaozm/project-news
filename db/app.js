const express = require('express')
const app = express()
const {
    getTopics,
    getArticles,
} = require('../db/controllers/controllers.js')

app.get('/api/topics', getTopics)
app.get('/api/articles', getArticles)

app.use((err, request, response, next) => {
    console.log(err)
    response.status(500).send({message: 'Ooops something went wrong!'})
})

module.exports = app