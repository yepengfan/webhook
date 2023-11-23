const request = require("supertest");
const app = require("./handler");
jest.mock("./Infobip");

const { sendNotifications } = require("./infobip");

describe("/webapi/notification", () => {
  beforeEach(() => {
    sendNotifications.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should respond with 200 for ORDER_CONFIRMATION event", async () => {
    const mockEvent = {
      event: "ORDER_CONFIRMATION",
      notifications: [
        {
          customerId: "12345",
          orderId: "1010101010",
        },
      ],
    };
    const mockAPIResponse = {
      operationId: "8F78025B-AB9A-475B-A4A3-078BBC4FC237",
    };

    sendNotifications.mockResolvedValue(mockAPIResponse);

    const response = await request(app)
      .post("/webapi/notification")
      .send(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(JSON.stringify(mockAPIResponse));
    expect(sendNotifications).toHaveBeenCalledWith("12345", "1010101010");
  });

  test("should respond with 400 for invalid event type", async () => {
    const mockEvent = {
      event: "INVALID_EVENT",
      notifications: [
        {
          customerId: "67890",
          orderId: "vwxyz",
        },
      ],
    };

    const response = await request(app)
      .post("/webapi/notification")
      .send(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid event type");
  });
});
