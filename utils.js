const jwt = require("jsonwebtoken");

module.exports.generateRefreshToken = async (data) => {
  let token;
  // expires in 1 month
  let options = {
    expiresIn: 30 * 24 * 60 * 60, // 1 month
  };

  try {
    token = jwt.sign(data, "refresh_token_secret", options);
  } catch (e) {
    console.log("[error] generating refresh token -> ", e);
    return null;
  }

  let { iat, exp } = jwt.decode(token);

  return { iat, exp, token };
};

module.exports.generateAccessToken = async (data) => {
  let token;
  let options = {
    expiresIn: 60 * 60, // 1 hour
  };

  try {
    token = jwt.sign(data, "access_token_secret", options);
  } catch (e) {
    console.log("[error] generating access token -> ", e);
    return null;
  }

  let { iat, exp } = jwt.decode(token);

  return { iat, exp, token };
};

module.exports.verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, "access_token_secret");
  } catch (e) {
    console.log("[error] verifying access token -> ", e);
    return null;
  }
};

module.exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, "refresh_token_secret");
  } catch (e) {
    console.log("[error] verifying refresh token -> ", e);
    return null;
  }
};
