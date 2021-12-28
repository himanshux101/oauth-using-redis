const redis = require("redis");

const redisClient = redis.createClient({
  port: 6379,
  host: "127.0.0.1",
});
redisClient.on("connect", () => {
  console.log("redis connected");
});

module.exports.saveLoginRefreshToken = async (userId, token, exp) => {
  return new Promise((resolve, reject) => {
    redisClient.zadd([userId, exp, token], function (err, result) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
}

module.exports.removeExpiredRefreshToken = async (userId, currentTime) => {
  return new Promise((resolve, reject) => {
    redisClient.zremrangebyscore(
      [userId, 0, currentTime],
      function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  });
}
