
const {
    fetchTopics,
    fetchArticles,
    fetchCommentsByArticleId,
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

module.exports = {
    getTopics,
    getArticles,
    getCommentsByArticleId
}