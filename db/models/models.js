const { response } = require('../../app.js')
const db = require('../connection.js')

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

const fetchCommentsByArticleId = (article_id) => {
    // check that this article exists in the articles database
    const articleString = 
    `
        SELECT * FROM articles
        WHERE article_id = $1;
    `
    return db.query(articleString, [article_id])
    .then(({rowCount, rows}) => {
        if (rowCount === 0) {
            // article doesn't exist
            return Promise.reject({status: 404, message: 'This article does not exist'})
        } else {
            // article exists
            return rows[0]
        }
    })
    .then((article) => {
        // fetch comments
        const commentSQL = 
        `
            SELECT * FROM comments
            WHERE article_id = $1
            ORDER BY created_at DESC;
        `
        return db.query(commentSQL, [article.article_id])
        .then(({rowCount, rows}) => {
            if (rowCount === 0) {
                // no comments 
                return [{
                    message: 'No comments associated with this article',
                    comments: []
                }]
            } else {
                // comments exist 
                return rows
            }
        })
    })
}

module.exports = {
    fetchTopics,
    fetchArticles,
    fetchCommentsByArticleId
}