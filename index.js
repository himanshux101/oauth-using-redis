const express = require("express");
const jwt = require("jsonwebtoken");
const redis = require("redis");

const utils = require("./utils");
const service = require("./service");

const app = express();
const port = 3000;

const redisClient = redis.createClient({
  port: 6379,
  host: "127.0.0.1",
});
redisClient.on("connect", () => {
  console.log("redis connected");
});

// todo: add body parser

app.get("/", (req, res) => {
  res.send("Authentication APIs");
});

/**
 * Route: /auth
 * generates new refesh and access token with credentials
 */
app.get("/auth", (req, res, next) => {
  try {
    let body = req.body || {};

    if (!body.email || !body.key) {
      // todo: throw error
      return;
    }

    let user = _authenticateLoginUser(body.email, body.key);

    if (!user) {
      // todo: throw error
      return;
    }

    let { accessToken, refreshToken } = await _generateLoginTokens(user);

    await _saveLoginRefreshTokenInCache(user._id, refreshToken.token);

    await _removeAllExpiredRefreshToken(user._id);

    res.send({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (e) {
    console.error("[error] [/auth] ", e);
  }
});

function _authenticateLoginUser(email, key) {
  let user = {
    _id: "123456789",
    email: "test@test.com",
    key: "test",
    country: "au",
    language: "en",
  };

  if (user.email === email && user.key === key) return user;
  else return null;
}

async function _generateLoginTokens(user) {
  try {
    let accessToken = await utils.generateAccessToken(user);
    let refreshToken = await utils.generateRefreshToken(user);

    return { accessToken, refreshToken };
  } catch (err) {
    console.log("error in genrating token -> ", err);
    return null;
  }
}

async function _saveLoginRefreshTokenInCache(userId, refreshToken) {
  // let currentTime = moment.utc().unix()
  let currentTime = moment.utc().add(1, "M").unix();
  userId = userId.toString();

  let res;
  try {
    res = await service.saveLoginRefreshToken(
      userId,
      refreshToken,
      currentTime
    );
  } catch (err) {
    console.log("error while saving refresh token -> ", err);
  }
  console.log("response from saving refresh token is -> ", res);

  if (!res) {
    throw "error while saving refresh token";
  }
}

async function _removeAllExpiredRefreshToken(userId) {
  let currentTime = moment.utc().unix();
  console.log("current time is -> ", currentTime);
  userId = userId.toString();

  try {
    await _removeExpiredRefreshToken(userId, currentTime);
  } catch (err) {
    console.log("error while removing all expired refresh tokens -> ", err);
  }
}

/**
 * Route: /logout
 * logouts the user and deletes the token from cache
 */
app.get("/logout", (req, res) => {
  try {
    let reqData = req.body || {};

    if (!reqData.refreshToken) {
      // todo: throw error
      return;
    }

    let userData = await this._verifyRefreshToken(reqData.refreshToken);

    console.log("user data from refresh token is -> ", userData);

    if (!userData) {
      // todo: throw error
      return;
    }

    let result = await this._removeRefreshTokenFromCache(
      userData._id,
      reqData.refreshToken
    );
  } catch (e) {
    console.error("[error] [/logout] ", e);
  }
});

/**
 * Route: /refresh
 * refreshes the expired token
 */
app.get("/refresh", (req, res) => {
  try {
  } catch (e) {
    console.error("[error] [/refresh] ", e);
  }
});

app.listen(port, () => {
  // todo: setup the init redis functions here
  console.log(`Example app listening at http://localhost:${port}`);
});
