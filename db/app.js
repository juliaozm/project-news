const express = require('express')
const app = express()
const {
    getTopics,
    getArticles,
    getArticleById,
} = require('../db/controllers/controllers.js')

app.get('/api/topics', getTopics)
app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)


app.use((err, request, response, next) => {
    if (err) {
        console.log(err)
        response.status(err.status).send({message: err.message})
    } else {
        next(err)
    }
})

app.use((err, request, response, next) => {
    console.log(err)
    response.status(500).send({message: 'Ooops something went wrong!'})
})

module.exports = app