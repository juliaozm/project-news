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
module.exports = { isPositiveInteger };
