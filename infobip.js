require("dotenv").config();

const querystring = require("querystring");
const axios = require("axios");

const baseUrl = process.env.API_BASE_URL;
const flowUrl = process.env.FLOW_BASE_URL;
const appKey = `App ${process.env.API_KEY}`;

const CUSTOMER_TYPE = "CUSTOMER";
const IDENTIFIER_TYPE = "PHONE";

// TODO: catch error on async functions

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

async function sendMessages(numbers, orderId) {
  const participants = numbers.map((n) => {
    return {
      identifyBy: {
        identifier: n,
        type: IDENTIFIER_TYPE,
      },
      variables: {
        orderId: orderId,
      },
    };
  });

  let data = JSON.stringify({
    participants: participants,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: flowUrl,
    headers: {
      Authorization: appKey,
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  return response.data;
}

async function sendNotifications(customerNumber, orderId) {
  // encode filter query parameters
  const filter = {
    customAttributes: {
      customerNumber: customerNumber,
    },
  };
  const encodedFilter = querystring.stringify({
    filter: JSON.stringify(filter),
  });

  // make api call
  const persons = await getPersons(baseUrl, appKey, encodedFilter);
  console.log(JSON.stringify(persons));

  // filter contact numbers
  const customers = persons.filter((p) => p.type === CUSTOMER_TYPE);
  const phones = customers.map((p) => p.contactInformation.phone);
  const numbers = phones.flat().map((obj) => obj.number);
  console.log(numbers);

  // trigger notification from LINE for the seletect users
  return sendMessages(numbers, orderId);
}

module.exports = {
  sendNotifications,
  sendMessages,
  getPersons,
};
