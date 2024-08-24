const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
require('dotenv')

const app = express();
app.use(bodyParser.json());

const secret = process.env.STRIKE_API_KEY
app.post('/webhook', (req, res) => {
    const signature = req.headers['x-signature'];
    const payload = JSON.stringify(req.body);
    
    const hash = crypto.createHmac('sha256', secret)
                       .update(payload)
                       .digest('hex');
  
    if (signature === hash) {
      // Signature verified
      const eventType = req.body.eventType;
      const data = req.body.data;
  
      // Process the webhook
      console.log('Received webhook:', eventType, data);
  
      // Respond with 2xx status code
      res.status(200).send('Webhook received');
    } else {
      // Signature mismatch
      res.status(400).send('Invalid signature');
    }
  });
  
  app.listen(3000, () => {
    console.log('Listening for webhooks on port 3000');
  });