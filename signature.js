require("dotenv").config();

const crypto = require("crypto");
const secret = process.env.SECRET_KEY;
const HASH_ALGO = "sha256"; // TODO: choose an appropriate algorithm

function signPayload(payloadString) {
  return (signature = crypto
    .createHmac(HASH_ALGO, secret)
    .update(payloadString)
    .digest("hex"));
}

module.exports = {
  signPayload,
};
