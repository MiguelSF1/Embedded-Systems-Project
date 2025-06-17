#include <Keypad.h>

const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {2, 3, 4, 5};
byte colPins[COLS] = {6, 7, 8, 9};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

String receivedCode = "";
String inputCode = "";
bool waitingForCode = false;

const int greenLED = 12;
const int redLED = 11;

void setup() {
  Serial.begin(9600);
  Serial.println("Ready. Press '#' to request code.");

  pinMode(greenLED, OUTPUT);
  pinMode(redLED, OUTPUT);

  digitalWrite(greenLED, HIGH);
  digitalWrite(redLED, LOW);
}

void loop() {
  // Read incoming code from Python (PC)
  while (Serial.available()) {
    char c = Serial.read();

    if (waitingForCode && c >= '0' && c <= '9') {
      receivedCode += c;
      if (receivedCode.length() >= 4) {
        receivedCode = receivedCode.substring(0, 4);
        waitingForCode = false;
        Serial.print("Code received: ");
        Serial.println(receivedCode);
      }
    }
  }

  char key = keypad.getKey();
  if (key) {
    if(key == '*') {
      inputCode = "";
    }
    else if (key == '#') {
      Serial.println("GET_CODE");   // Request code from Python
      receivedCode = "";
      inputCode = "";
      waitingForCode = true;
      Serial.println("Waiting for code from PC...");
    }
    else if (key >= '0' && key <= '9') {
      inputCode += key;
      Serial.print(key);

      if (inputCode.length() == 4) {
        Serial.println();
        Serial.print("Entered: "); Serial.println(inputCode);
        Serial.print("Expected: "); Serial.println(receivedCode);

        if (inputCode == receivedCode) {
          Serial.println("✅ Code correct!");
          Serial.println("CORRECT");  // Send result to Python
          digitalWrite(greenLED, LOW);
          delay(5000);
          digitalWrite(greenLED, HIGH);
        } else {
          Serial.println("❌ Code incorrect.");
          Serial.println("INCORRECT"); // Send result to Python
          digitalWrite(redLED, HIGH);
          delay(5000);
          digitalWrite(redLED, LOW);
        }

        inputCode = "";
        Serial.println("Try again:");
      }
    }
  }
}
