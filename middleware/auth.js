const jwt = require("jsonwebtoken");

const authToken = (request, response, next) => {
  const authHeader = request.headers.authorization; //Bearer TOKEN
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return response.status(401).json({ error: "Null token" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return response.status(403).json({ error: error.message });
    request.user = user;
    next();
  });
};
module.exports = authToken;
