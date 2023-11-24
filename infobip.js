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

async function getNumberOrderPair(orders) {
  const pairArray = [];

  for (const order of orders) {
    const filter = {
      customAttributes: {
        customerNumber: order.customerId,
      },
    };
    const encodedFilter = querystring.stringify({
      filter: JSON.stringify(filter),
    });
    const persons = await getPersons(baseUrl, appKey, encodedFilter);

    const arr = persons
      .filter((p) => p.type === CUSTOMER_TYPE)
      .flatMap((p) =>
        p.contactInformation.phone.map((phone) => ({
          number: phone.number,
          orderId: order.orderId,
        }))
      );

    pairArray.push(...arr);
  }

  return pairArray;
}

async function sendNotifications(orders) {
  // prepare phone number and order id object array
  const numberOrderPair = await getNumberOrderPair(orders);
  // trigger notification from LINE for the seletect users
  return sendMessages(numberOrderPair);
}

module.exports = {
  sendNotifications,
  getNumberOrderPair,
  sendMessages,
  getPersons,
};
