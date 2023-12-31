const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

app.use(bodyParser.json());

// Define the username and password for Basic Authentication
const authUsername = "ahmadmedoan1@gmail.com";
const authPassword = "Voda@3389";

// Define the middleware function to check Basic Authentication
const checkBasicAuth = (req, res, next) => {
  // Check if the Authorization header is present
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.set("WWW-Authenticate", 'Basic realm="Dialogflow"');
    return res.status(401).send("Unauthorized");
  }

  // Check if the Authorization header contains the expected credentials
  const expectedAuthHeader =
    "Basic " +
    Buffer.from(`${authUsername}:${authPassword}`).toString("base64");
  if (authHeader !== expectedAuthHeader) {
    res.set("WWW-Authenticate", 'Basic realm="Dialogflow"');
    return res.status(401).send("Unauthorized");
  }

  // If the credentials are valid, call the next middleware function
  next();
};

// Apply the checkBasicAuth middleware to all routes
app.use(checkBasicAuth);

// Handle GET requests to the /webhook endpoint
app.get("/webhook", (req, res) => {
  res.send("Webhook endpoint is working!");
});

app.post("/webhook", (req, res) => {
  // Get the stock symbol from the user request
  const stockSymbol = req.body.queryResult.parameters["Stock"];

  // Set the API key for the Alpha Vantage API
  const apiKey = "GS9NB1XP4WAP8TNS";

  // Construct the URL to call the Alpha Vantage API
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`;

  // Call the Alpha Vantage API to get the stock price information
  request(url, (error, response, body) => {
    // Handle errors by returning an error response to Dialogflow
    if (error) {
      console.error("Error:", error);
      return res.json({
        fulfillmentText:
          "Sorry, there was an error processing your request. Please try again later.",
      });
    }

    // Parse the response body as JSON
    const data = JSON.parse(body);

    // Check if the response contains any errors
    if (data["Error Message"]) {
      return res.json({
        fulfillmentText: `Sorry, I could not find any information for ${stockSymbol}. Please try a different symbol.`,
      });
    }

    // Get the stock price and other information from the response
    const stockPrice = data["Global Quote"]["05. price"];
    const companyName = data["Global Quote"]["01. symbol"];

    // Generate the personalized response using the user input
    const responseText = `The current stock price for ${companyName} (${stockSymbol}) is ${stockPrice} dollars`;

    // Construct the custom payload response with the stock information
    const payload = {
      type: "stock",
      symbol: stockSymbol,
      price: stockPrice,
      change: null,
      chart_url: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`,
      chart_alt_text: `Price chart for ${companyName} (${stockSymbol})`,
    };

    // Return the response to Dialogflow with the custom payload
    return res.json({
      fulfillmentText: responseText,
      payload: payload,
    });
  });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Webhook server is listening");
});
