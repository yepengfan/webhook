const express = require("express");
const { sendNotifications } = require("./infobip");
const app = express();
const port = 7073;

app.use(express.json());

const EVENT_TYPE = Object.freeze({
  ORDER_CONFIRMATION: "ORDER_CONFIRMATION",
});

app.post("/webapi/notification", async (req, res) => {
  const { event, notifications } = req.body;
  // TODO: add request schema validation

  if (event === EVENT_TYPE.ORDER_CONFIRMATION) {
    console.log("Order confirmation received:", req.body);
    const response = await sendNotifications(notifications);
    res.status(200).send(response);
  } else {
    res.status(400).send("Invalid event type");
  }
});

module.exports = app;
