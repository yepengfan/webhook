const request = require("supertest");
const app = require("./app");
jest.mock("./Infobip");

const { sendNotifications } = require("./infobip");

describe("/webapi/webhook/events", () => {
  beforeEach(() => {
    sendNotifications.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should respond with 200 for order.confirmed event", async () => {
    const mockEvent = {
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

    sendNotifications.mockResolvedValue(mockAPIResponse);

    const response = await request(app)
      .post("/webapi/webhook/events")
      .send(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe(JSON.stringify(mockAPIResponse));
    expect(sendNotifications).toHaveBeenCalledWith([
      { customerId: "12345", orderId: "1010101010" },
    ]);
  });

  it("should respond with 400 for invalid event type", async () => {
    const mockEvent = {
      event: "INVALID_EVENT",
      orders: [
        {
          customerId: "67890",
          orderId: "vwxyz",
        },
      ],
    };

    const response = await request(app)
      .post("/webapi/webhook/events")
      .send(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid event type");
  });
});
