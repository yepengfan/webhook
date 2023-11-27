const express = require("express");
const crypto = require("crypto");
const { sendNotifications } = require("./infobip");
const { signPayload } = require("./signature");
const app = express();

app.use(express.json());

const EVENT_TYPE = Object.freeze({
  ORDER_CONFIRMATION: "order.confirmed",
});

app.post("/webapi/webhook/events", async (req, res) => {
  const { event, timestamp, orders } = req.body;
  // TODO: add request schema validation
  const signature = req.headers["x-hook-signature"];
  const requestPayload = JSON.stringify(req.body);
  const expectedSignature = signPayload(requestPayload);

  // Convert to buffers of the same encoding, usually 'hex' or 'base64'
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    res.status(401).send({
      message: "Invalid signature",
    });
    return;
  } else if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    res.status(401).send({
      message: "Invalid signature",
    });
    return;
  }

  if (event === EVENT_TYPE.ORDER_CONFIRMATION) {
    console.log("Order confirmation received:", timestamp);
    const response = await sendNotifications(orders);
    res.status(200).send(response);
  } else {
    res.status(400).send({
      message: "Invalid event type",
    });
  }
});

module.exports = app;
