const axios = require("axios");

async function getPersons(baseUrl, appKey, encodedFilter) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${baseUrl}/people/2/persons?${encodedFilter}`,
    headers: {
      Authorization: appKey,
    },
  };
  const response = await axios.request(config);
  return response.data.persons; // TODO: iterate to the last page
}

module.exports = {
  getPersons,
};
