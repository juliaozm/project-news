const db = require('../db/connection.js')

const fetchTopics = () => {
    const sqlString = 
    `
        SELECT * FROM topics;
    `
    return db.query(sqlString).then(({rows}) => {
        return rows
    })
}

const fetchArticles = () => {
    const sqlString = 
    `
        SELECT articles.*, COUNT(comments.comment_id) as comment_count
        FROM articles
        LEFT JOIN comments
        ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY created_at DESC;
    `
    return db.query(sqlString)
    .then(({rows}) => rows)
}

const fetchArticleById = (article_id) => {
    const sqlString = 
    `
        SELECT * FROM articles
        WHERE article_id = $1;
    `
    return db.query(sqlString, [article_id])
    .then(({rows: [article]}) => {
        if (!article) {
            return Promise.reject({status: 404, message: 'Not Found'})
        } else {
            return article
        }
    })
}

module.exports = {
    fetchTopics,
    fetchArticles,
    fetchArticleById
}