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

const fetchCommentsByArticleId = (article_id) => {
    const sqlString = 
    `
        SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC;
    `
    return db.query(sqlString, [article_id])
    .then(({rowCount, rows}) => {
        if (rowCount === 0) {
            return Promise.reject({status: 404, message: 'Not Found'})
        } else {
            return rows
        }
    })
}

const addNewComment = (article_id, newCommentData) => {
    if (Object.keys(newCommentData).length <= 1 || 
        !newCommentData.username || 
        !newCommentData.body
    ) {
        return Promise.reject({status: 400, message: 'Bad Request'})
    }

    const {username, body, votes = 0} = newCommentData

    // checking if the username exists in the users database
    const userString =  
    `
        SELECT * FROM users
        WHERE username = $1;
    
    `
    return db.query(userString, [username])
    .then(({rowCount, rows}) => {
        if (rowCount === 0) {
            // user doesn't exist
            return Promise.reject({status: 404, message: 'This user does not exist'})
        } else {
            // user exists
            return rows[0]
        }
    })
    .then(user => {
        // adding a comment to the comments database
        const created_at = new Date()
        const commentString = 
        `
            INSERT INTO comments
                (article_id, author, body, votes, created_at)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING *;
        `
        return db.query(commentString, [article_id, user.username, body, votes, created_at])
        .then(({rows : [comment]}) => {
            comment.created_at = Date.parse(comment.created_at)
            return comment
        })
    })
}

const changeVotesOnArticle = (inc_votes, article_id) => {
    if (!inc_votes || typeof inc_votes !== 'number') {
        return Promise.reject({status: 400, message: 'Bad Request'})
    }
    const sqlString = 
    `
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;
    `
    return db.query(sqlString, [inc_votes, article_id])
    .then(({rowCount, rows}) =>{
        if (rowCount === 0) {
            return Promise.reject({status: 404, message: 'This article does not exist'})
        } else {
            let [article] = rows
            article.created_at = Date.parse(article.created_at)
            return article
        }
    })
}

const fetchUsers = () => {
    const sqlString = 
    `
        SELECT * FROM users;
    `
    return db.query(sqlString)
    .then(({rows}) => rows)
}


module.exports = {
    fetchTopics,
    fetchArticles,
    fetchUsers,
    fetchCommentsByArticleId,
    addNewComment,
    changeVotesOnArticle
}