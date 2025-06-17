import serial
import requests
import time

# Open serial connection
ser = serial.Serial('/dev/ttyACM0', 9600)
time.sleep(2)  # Wait for Arduino to reset

while True:
    if ser.in_waiting:
        line = ser.readline().decode().strip()

        if line == "GET_CODE":
            print("Arduino requested code. Fetching from server...")

            try:
                #response = requests.get('http://172.17.16.112:5000/next_client/A1')
                response = requests.get('http://localhost:5000/next_client/A1')
                data = response.json()
                code = data.get("code", "").strip()[:4]

                if code:
                    print(f"Code from server: {code}")
                    ser.write((code + "\n").encode())  # Send with newline

                else:
                    print("No 'code' found in server response.")

            except Exception as e:
                print("Failed to get code:", e)

        elif line == "CORRECT":
            print("Arduino: Code correct!")

        elif line == "INCORRECT":
            print("Arduino: Code incorrect.")
