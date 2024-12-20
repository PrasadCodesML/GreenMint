import logging
import numpy as np
from flask import Flask, request, jsonify
import joblib
from flask_cors import CORS
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

logging.basicConfig(level=logging.DEBUG)

# Load the saved objects (model, encoders, and scaler)
try:
    saved_objects = joblib.load("xgb_model_deployment_Updated_11.joblib")
    xgb_model = saved_objects["model"]
    label_encoders = saved_objects.get("label_encoders", {})  # Ensure label_encoders exist in the saved model
    scaler = saved_objects.get("scaler", None)  # Ensure scaler exists in the saved model

    if not scaler:
        raise ValueError("Scaler is missing from the saved model")

    app.logger.info("Model, label encoders, and scaler successfully loaded.")
except Exception as e:
    app.logger.error(f"Error loading model or preprocessing objects: {str(e)}")
    raise

# Define the prediction route
@app.route('/predict', methods=['POST'])
def predict():
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

        # Define the possible categories for label encoding (from your data preprocessing step)
        label_mapping = {
            "Body Type": ['normal', 'obese', 'overweight', 'underweight'],
            "Sex": ['female', 'male'],
            "Diet": ['omnivore', 'pescatarian', 'vegan', 'vegetarian'],
            "Transport": ['private', 'public', 'walk/bicycle'],
            "Vehicle Type": ['None', 'diesel', 'electric', 'hybrid', 'lpg', 'petrol'],
            "Social Activity": ['never', 'often', 'sometimes'],
            "Frequency of Traveling by Air": ['frequently', 'never', 'rarely', 'very frequently'],
            "Waste Bag Size": ['extra large', 'large', 'medium', 'small'],
        }

        # Preprocess the input data
        processed_input = []
        for column, value in input_data.items():
            if column in label_mapping:
                # Convert categorical value to its corresponding integer encoding based on the mapping
                if value in label_mapping[column]:
                    processed_value = label_mapping[column].index(value)
                else:
                    processed_value = -1  # Handle unseen category
            else:
                # Use the value as is for numerical features
                processed_value = value
            processed_input.append(processed_value)

        # Convert input to numpy array and scale it
        processed_input = np.array(processed_input).reshape(1, -1)
        processed_input = scaler.transform(processed_input)  # Apply scaling

        # Log the processed input
        app.logger.info(f"Processed input array: {processed_input}")

        # Make the prediction
        try:
            prediction = xgb_model.predict(processed_input)
            app.logger.info(f"Prediction: {prediction[0]}")
        except Exception as e:
            app.logger.error(f"Error making prediction: {e}")
            return jsonify({"error": "Error making prediction."}), 400

        # Return the prediction result
        return jsonify({"carbon_footprint": round(float(prediction[0]), 2)})


    except Exception as e:
        app.logger.error("Error in prediction process: %s", str(e))
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
