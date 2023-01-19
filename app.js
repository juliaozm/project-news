const express = require('express')
const app = express()
const {
    getTopics,
    getArticles,
    getUsers,
    getArticleById,
    getCommentsByArticleId,
    postCommentByArticleId,
    updateArticle,
} = require('./controllers/controllers.js')

app.use(express.json())

app.get('/api/topics', getTopics)
app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)
app.get('/api/articles/:article_id/comments', getCommentsByArticleId)
app.post('/api/articles/:article_id/comments', postCommentByArticleId)
app.patch('/api/articles/:article_id', updateArticle)
app.get('/api/users', getUsers)

app.use((err, request, response, next) => {
    if (err.status && err.message) {
        response.status(err.status).send({message: err.message})
    } else {
        next(err)
    }
})

app.use((err, request, response, next) => {
    if (err.code === '22P02' || err.code === '42601') {
        response.status(400).send({message: 'Bad Request'});
    } else if (err.code === '42703') {
        response.status(404).send({message: 'Not Found'});
    }
     else {
        next(err)
    }
})

app.use((err, request, response, next) => {
    console.log(err)
    response.status(500).send({message: 'Ooops something went wrong!'});
})

module.exports = app