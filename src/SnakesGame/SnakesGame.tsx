import { useState, useEffect } from "react";
import SnakeBoard from "./SnakesBoard";
import GameOverModal from "./GameOverModal";
import PausedModal from "./PausedModal";
import { checkConnection, retrievePublicKey } from "../utils/Freighter"; // Import functions from freighter module
import "./styles.css";

// Key used to access high-score value from local storage
export const HIGH_SCORE_KEY = "high-score";

export default function SnakesGame() {
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [justStarted, setJustStarted] = useState(true);
  const [connected, setConnected] = useState(false); // State to track if the user is connected
  const [publicKey, setPublicKey] = useState(null); // State to store the public key
  const [isConnecting, setIsConnecting] = useState(false); // State to track if the connection is in progress

  if (localStorage.getItem(HIGH_SCORE_KEY) === null) {
    localStorage.setItem(HIGH_SCORE_KEY, "0");
  }
  const highScore = Number(localStorage.getItem(HIGH_SCORE_KEY));

  useEffect(() => {
    connect(); // Automatically try to connect when the component mounts
  }, []);

  const handleBodyClick = () => {
    if (justStarted) {
      setIsPlaying(true);
      setJustStarted(false);
      setScore(0);
      return;
    }
    !isGameOver && setIsPlaying(!isPlaying);
  };

  async function connect() {
    setIsConnecting(true); // Set isConnecting to true when connection process starts
    try {
      // Check if connection to Freighter is established
      if (await checkConnection()) {
        // Retrieve public key from Freighter
        const publicKey: any = await retrievePublicKey();
        if (publicKey) {
          setPublicKey(publicKey); // Set the retrieved public key
          setConnected(true); // Set connected state to true
          localStorage.setItem("publicKey", publicKey); // Store the public key in local storage
        }
      }
    } catch (error) {
      console.error("Error connecting to Freighter:", error); // Log any errors during the connection process
    } finally {
      setIsConnecting(false); // Set isConnecting to false when connection process ends
    }
  }

  return (
    <div id="snakes-game-container" onClick={handleBodyClick}>
      {/* <div></div> */}
      <h1 id="game-title">
        Snake Game
        <button
          onClick={connect} // Call the connect function when the button is clicked
          className="connect-btn"
          disabled={isConnecting} // Disable the button if the connection is in progress
        >
          {isConnecting
            ? "Connecting..."
            : connected
            ? publicKey
            : "Connect to Freighter"}
        </button>
      </h1>
      <p className="high-score">High Score: {highScore}</p>

      {justStarted ? (
        <p className="new-game-hint">Click anywhere to start</p>
      ) : (
        <>
          <p className="score">
            <span>Score</span>
            <span>{score}</span>
          </p>
          <p className="pause-hint">
            <strong>PAUSE:</strong> Click Anywhere or Press <kbd>esc</kbd>
          </p>
        </>
      )}

      {!isGameOver && !justStarted && (
        <SnakeBoard
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          externalScore={score}
          setScore={setScore}
          setIsGameOver={setIsGameOver}
        />
      )}

      {isGameOver && (
        <GameOverModal
          setIsGameOver={setIsGameOver}
          setIsPlaying={setIsPlaying}
          finalScore={score}
          setJustStarted={setJustStarted}
          setScore={setScore}
        />
      )}

      {justStarted
        ? ""
        : !isGameOver &&
          !isPlaying && <PausedModal setIsPlaying={setIsPlaying} />}
    </div>
  );
}
