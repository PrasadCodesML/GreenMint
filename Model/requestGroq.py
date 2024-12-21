from groq import Groq
from flask_cors import CORS
from flask import Flask, request, jsonify
import logging

client = Groq()
app = Flask(__name__)
CORS(app) 

logging.basicConfig(level=logging.DEBUG)

@app.route('/set_price', methods=['POST'])
def set_price():
    try:
        app.logger.info("Received request data: %s", request.json)
        
        # Ensure the request contains JSON data
        if not request.json:
            app.logger.error("No JSON data received.")
            return jsonify({"error": "No JSON data received."}), 400

        input_data = request.json
        
        # Ensure input data is not empty
        if not input_data:
            app.logger.error("Received empty input data.")
            return jsonify({"error": "Empty input data."}), 400
    except Exception as e:
        app.logger.error("Error in prediction process: %s", str(e))
        return jsonify({"error": str(e)}), 400

    completion = client.chat.completions.create(
        model="llama-3.2-11b-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "you are an expert at setting price of an nft. For the given nft what should be the price of the nft on the marketplace strictly return price in ETH only and only float (eg. putput: '0.01 ETH' is wrong, but eg. output : '0.04' is correct)"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": input_data
                        }
                    }
                ]
            }
        ],
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
    )

    print(completion.choices[0].message)

if __name__ == '__main__':
    app.run(debug=True)