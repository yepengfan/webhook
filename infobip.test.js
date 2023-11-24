const infobip = require("./infobip");
const mockResponse = require("./mockPersons");

jest.mock("./persons", () => ({
  getPersons: jest.fn((baseUrl, appKey, encodedFilter) => {
    if (
      encodedFilter ===
      `filter=${encodeURIComponent(
        JSON.stringify({
          customAttributes: {
            customerNumber: "10000",
          },
        })
      )}`
    ) {
      return mockResponse[10000];
    } else if (
      encodedFilter ===
      `filter=${encodeURIComponent(
        JSON.stringify({
          customAttributes: {
            customerNumber: "10001",
          },
        })
      )}`
    ) {
      return mockResponse[10001];
    }
  }),
}));

beforeEach(() => {
  jest.clearAllMocks(); // Clear all mocks before each test
});

describe("getNumberOrderPair", () => {
  it("should create number order pair", async () => {
    // Arrange
    const orders = [
      {
        customerId: "10000",
        orderId: "20000",
      },
      {
        customerId: "10001",
        orderId: "20001",
      },
    ];
    const expectedPair = [
      {
        number: "61400000000",
        orderId: "20000",
      },
      {
        number: "61400000001",
        orderId: "20001",
      },
      {
        number: "61400000002",
        orderId: "20001",
      },
    ];

    // Act
    const result = await infobip.getNumberOrderPair(orders);

    // Assert
    expect(result).toEqual(expectedPair);
  });
});
