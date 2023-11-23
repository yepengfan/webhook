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

async function sendMessages(pairArray) {
  const participants = pairArray.map((e) => {
    return {
      identifyBy: {
        identifier: e.number,
        type: IDENTIFIER_TYPE,
      },
      variables: {
        orderId: e.orderId,
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

async function getNumberOrderPair(notifications) {
  const pairArray = [];
  for (const notification of notifications) {
    const { customerId, orderId } = notification;
    const filter = {
      customAttributes: {
        customerNumber: customerId,
      },
    };
    const encodedFilter = querystring.stringify({
      filter: JSON.stringify(filter),
    });

    const persons = await getPersons(baseUrl, appKey, encodedFilter);
    console.log(JSON.stringify(persons));

    const customers = persons.filter((p) => p.type === CUSTOMER_TYPE);
    const phones = customers.flatMap((p) => p.contactInformation.phone);
    const numbers = phones.map((obj) => obj.number);
    console.log(numbers);

    const arr = numbers.map((n) => {
      return {
        number: n,
        orderId: orderId,
      };
    });

    pairArray.push(arr);
  }

  const flattenArray = pairArray.flat();
  return flattenArray;
}

async function sendNotifications(notifications) {
  // prepare phone number and order id object array
  const numberOrderPair = await getNumberOrderPair(notifications);
  // trigger notification from LINE for the seletect users
  return sendMessages(numberOrderPair);
}

module.exports = {
  sendNotifications,
  getNumberOrderPair,
  sendMessages,
  getPersons,
};
