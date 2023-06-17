const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    const symbol = req.body.queryResult.parameters['symbol'];
    const apiKey = 'GS9NB1XP4WAP8TNS';

    const url = `https://api.example.com/stockprice?symbol=${symbol}&apikey=${apiKey}`;

    request(url, (error, response, body) => {
        if (error) {
            console.error('Error:', error);
            return res.json({
                fulfillmentText: 'Sorry, there was an error processing your request. Please try again later.'
            });
        }

        const data = JSON.parse(body);

        if (!data['price']) {
            return res.json({
                fulfillmentText: `Sorry, I could not find any information for ${symbol}. Please try a different symbol.`
            });
        }

        const price = data['price'];
        const companyName = data['companyName'];

        return res.json({
            fulfillmentText: `The current price of ${companyName} (${symbol}) is ${price} dollars.`
        });
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Webhook server is listening');
});