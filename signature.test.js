require("dotenv").config();

const crypto = require("crypto");
const { signPayload } = require("./signature");

describe("signPayload", () => {
  it("should return a valid signature", () => {
    // Arrange
    const payload = {
      event: "INVALID_EVENT",
      orders: [
        {
          customerId: "67890",
          orderId: "vwxyz",
        },
      ],
    };

    const HASH_ALGO = "sha256"; // TODO: choose an appropriate algorithm
    const payloadString = JSON.stringify(payload);
    const secret = process.env.SECRET_KEY;
    const expectedSignature = crypto
      .createHmac(HASH_ALGO, secret)
      .update(payloadString)
      .digest("hex");

    // Act
    const actualSignature = signPayload(payloadString, secret);

    // Assert
    expect(actualSignature).toEqual(expectedSignature);
  });
});
