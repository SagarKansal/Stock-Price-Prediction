# Stock Price Prediction Using LSTM

A stock price prediction system built using Deep Neural Networks(LSTM).

## Dataset

Source - [NSE TATAMOTORS Historical Data](https://www1.nseindia.com/live_market/dynaContent/live_watch/get_quote/GetQuote.jsp?symbol=TATAMOTORS)

The dataset used contains data for TataMotors (Symbol: TATAMOTORS) from 16 July 2006 to 15 July 2022 (3974 entries).

### Dataset Columns

- Symbol
- Series
- Date (Used for prediction)
- Prev Close
- Open Price
- High Price
- Low Price
- Last Price
- Close Price (Used for prediction)
- Average Price
- Total Traded Quantity
- Turnover
- No. of Trades

## Model used:

### LSTM - Long Short Term Memory
\
<image src="https://editor.analyticsvidhya.com/uploads/16127Screenshot%202021-01-19%20at%2011.50.55%20PM.png" alt="LSTM Architecture" width=700>

## Results
### Predicted Data vs Ground Truth
<image src="./Images/Results.png" alt="Prediction Results" width=700>

## Contributors 👨‍💻

- [Mohammed Gaiban Khan](https://github.com/Gaiban-Khan/)
- Kaustubh Upadhayaya


## Farmer Engagement Game

A lightweight offline browser game for village visits is available at `farmer-engagement-game/index.html`.
It helps staff explain product importance through short crop-decision rounds and instant learning feedback.


### How to Play

1. Open `farmer-engagement-game/index.html` on a laptop/tablet browser (works offline).
2. Read each scenario aloud and ask farmers to choose one option as a group.
3. Click the selected option to reveal instant feedback and a practical learning point.
4. Continue through all 6 rounds using **Next Round**.
5. At the end, discuss the score, trust level, and final tips with the group.


### Run the game on your device

You can run the game in two easy ways:

**Option 1 (fastest): open file directly**
1. Go to the project folder.
2. Open `farmer-engagement-game/index.html` in your browser.

**Option 2 (recommended): run local server**
1. In terminal, go to project root.
2. Run: `./run-farmer-game.sh`
3. Open: `http://localhost:8080/farmer-engagement-game/index.html`

Use a different port if needed:
- `./run-farmer-game.sh 9000`
- Then open: `http://localhost:9000/farmer-engagement-game/index.html`

