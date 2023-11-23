const express = require("express");
const { sendNotifications } = require("./infobip");
const app = express();

app.use(express.json());

const EVENT_TYPE = Object.freeze({
  ORDER_CONFIRMATION: "order.confirmed",
});

app.post("/webapi/webhook/events", async (req, res) => {
  const { event, timestamp, orders } = req.body;
  // TODO: add request schema validation

  if (event === EVENT_TYPE.ORDER_CONFIRMATION) {
    console.log("Order confirmation received:", timestamp);
    const response = await sendNotifications(orders);
    res.status(200).send(response);
  } else {
    res.status(400).send("Invalid event type");
  }
});

module.exports = app;
