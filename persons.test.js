const { getPersons } = require("./persons");
const axios = require("axios");
const mockPersons = require("./mockPersons");

describe("Persons API", () => {
  let mockResponse;

  beforeEach(() => {
    mockResponse = {
      limit: 20,
      page: 1,
      orderBy: "modifiedAt:desc, id:asc",
      persons: mockPersons[10001],
    };
  });

  it("should returns array of persons", async () => {
    jest.spyOn(axios, "request").mockResolvedValue({ data: mockResponse });

    const persons = await getPersons("baseUrl", "appKey", "filter");

    expect(persons).toEqual(mockResponse.persons);
  });
});
