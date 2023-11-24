const infobip = require("./infobip");
const mockResponse = require("./mockPersons.json");
const personsApi = require("./persons");

jest.mock("./persons", () => ({
  getPersons: jest.fn(() => mockResponse),
}));

beforeEach(() => {
  jest.clearAllMocks(); // Clear all mocks before each test
});

describe("getPersons", () => {
  it("should mock", async () => {
    // Act
    const result = await personsApi.getPersons();
    // Assert
    expect(result).toEqual(mockResponse);
  });
});

describe("getNumberOrderPair", () => {
  it("should create number order pair", async () => {
    // Arrange
    const orders = [
      {
        customerId: "999888777666555",
        orderId: "11234567890",
      },
    ];
    const expectedPair = [
      {
        number: "61400000000",
        orderId: "11234567890",
      },
    ];

    // Act
    const result = await infobip.getNumberOrderPair(orders);

    // Assert
    expect(result).toEqual(expectedPair);
  });
});
