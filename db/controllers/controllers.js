
const {
    fetchTopics,
    fetchArticles,
    fetchCommentsByArticleId,
    addNewComment
 } = require('../models/models.js')

const getTopics = (request, response, next) => {
    fetchTopics()
    .then((topics) => {
        response.status(200).send({topics});
    })
    .catch(err => next(err))
}

const getArticles = (request, response, next) => {
    fetchArticles()
    .then(articles => {
        response.status(200).send({articles})
    })
    .catch(err => next(err))
}

const getCommentsByArticleId = (request, response, next) => {
    const {article_id} = request.params;
    fetchCommentsByArticleId(article_id)
    .then((comments) => {
        response.status(200).send({comments})
    })
    .catch(err => next(err))
}

const postCommentByArticleId = (request, response, next) => {
    const {article_id} = request.params;
    const newCommentData = request.body;

    if (Object.keys(newCommentData).length <= 1 || 
        !newCommentData.username || 
        !newCommentData.body
    ) {
        response.status(400).send({message: 'Bad Request'})
        next()
    }
    addNewComment(article_id, newCommentData)
    .then((comment) => {
        response.status(201).send({comment})
    })
    .catch(err => next(err))
}

module.exports = {
    getTopics,
    getArticles,
    getCommentsByArticleId,
    postCommentByArticleId
}