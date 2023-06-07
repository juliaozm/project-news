const isPositiveInteger = (...params) => {
  for (const param of params) {
    if (isNaN(param) || param <= 0 || !Number.isInteger(Number(param))) {
      return Promise.reject({
        status: 400,
        message: `${param} value is invalid`,
      });
    }
  }
};

const isEmailValid = (email) => {
  const emailPattern =
    /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})+$/;
  if (!emailPattern.test(email)) {
    return Promise.reject({ status: 400, message: "Invalid email" });
  }
};

const isUsernameValid = (username) => {
  const usernamePattern = /^(?![_])([a-z0-9_]{8,})$/;
  if (!usernamePattern.test(username)) {
    return Promise.reject({ status: 400, message: "Invalid username" });
  }
};

const isPasswordValid = (password) => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
  if (!passwordPattern.test(password)) {
    return Promise.reject({ status: 400, message: "Invalid password" });
  }
};

module.exports = {
  isPositiveInteger,
  isEmailValid,
  isUsernameValid,
  isPasswordValid,
};
