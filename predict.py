import sys
import json
import joblib
import numpy as np

def predict(input_features):
    try:
        model = joblib.load('model/cancer_prediction_model.pkl')

        input_array = np.array([input_features])

        prediction = model.predict_proba(input_array)

        output = '{0:.{1}f}'.format(prediction[0][1], 2)

        probability_percentage = int(float(output) * 100)

        return probability_percentage

    except Exception as e:
        print("Error making prediction:" + e)
        return None

if __name__ == "__main__":
    input_array = json.loads(sys.argv[1])

    prediction = predict(input_array)

    print(json.dumps(prediction))
