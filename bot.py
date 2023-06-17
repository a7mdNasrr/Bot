import requests
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/stock/<symbol>', methods=['GET'])
def get_stock_price(symbol):
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey=GS9NB1XP4WAP8TNS'
    response = requests.get(url)
    data = response.json()
    price = data['Global Quote']['05. price']
    return jsonify({'symbol': symbol, 'price': price})

if __name__ == '__main__':
    app.run()