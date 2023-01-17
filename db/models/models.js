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

module.exports = {
    fetchTopics,
    fetchArticles,
}