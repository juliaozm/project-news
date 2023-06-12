const jwt = require("jsonwebtoken");

const jwtTokens = ({ email, username, avatar_url }) => {
  const user = { email, username, avatar_url };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "3m",
  });
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return { accessToken, refreshToken };
};
module.exports = jwtTokens;
