const request = require("supertest");
const app = require("./app");
jest.mock("./infobip");

const { sendNotifications } = require("./infobip");

describe("/webapi/webhook/events", () => {
  beforeEach(() => {
    sendNotifications.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should respond with 200 for order.confirmed event", async () => {
    const event = {
      event: "order.confirmed",
      timestamp: "2023-01-01T12:00:00Z",
      orders: [
        {
          customerId: "12345",
          orderId: "1010101010",
        },
      ],
    };
    const mockAPIResponse = {
      operationId: "8F78025B-AB9A-475B-A4A3-078BBC4FC237",
    };
    process.env.SECRET_KEY = "shared_secret_key";
    const signature =
      "807080c5f498661fde6da23b4ca450aa2c645a8740555c6b6cb72e8079ab33dd";

    sendNotifications.mockResolvedValue(mockAPIResponse);

    const response = await request(app)
      .post("/webapi/webhook/events")
      .set("x-hook-signature", signature)
      .send(event);

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(JSON.stringify(mockAPIResponse));
    expect(sendNotifications).toHaveBeenCalledWith([
      { customerId: "12345", orderId: "1010101010" },
    ]);
  });

  it("should respond with 400 for invalid event type", async () => {
    const event = {
      event: "INVALID_EVENT",
      orders: [
        {
          customerId: "67890",
          orderId: "vwxyz",
        },
      ],
    };
    process.env.SECRET_KEY = "shared_secret_key";
    const signature =
      "609053f74e2c831556be97911b1fdb382ba91e2224278cd76d9ddf047ab0160e";

    const response = await request(app)
      .post("/webapi/webhook/events")
      .set("x-hook-signature", signature)
      .send(event);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid event type");
  });

  it("should respond with 401 for invalid x-hook-signature", async () => {
    const event = {
      event: "order.confirmed",
      timestamp: "2023-01-01T12:00:00Z",
      orders: [
        {
          customerId: "12345",
          orderId: "1010101010",
        },
      ],
    };

    const mockAPIResponse = {
      operationId: "8F78025B-AB9A-475B-A4A3-078BBC4FC237",
    };
    process.env.SECRET_KEY = "shared_secret_key";
    const signature = "invalid_signature";

    sendNotifications.mockResolvedValue(mockAPIResponse);

    const response = await request(app)
      .post("/webapi/webhook/events")
      .set("x-hook-signature", signature)
      .send(event);

    expect(response.statusCode).toBe(401);
  });
});
