import { HIGH_SCORE_KEY } from "./SnakesGame";
import { updateScore, getAllPlayers } from "../utils/Soroban";
import { useState, useEffect } from "react";

interface GameOverModalProps {
  finalScore: number;
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setJustStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

interface Player {
  id: number;
  name: string;
  score: number;
}

export default function GameOverModal({
  finalScore,
  setIsGameOver,
  setIsPlaying,
  setJustStarted,
  setScore,
}: GameOverModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  // Determine if the high score has been beaten
  const currentHighScore = Number(localStorage.getItem(HIGH_SCORE_KEY));
  const highScoreBeaten = finalScore > currentHighScore;

  const handleGameReset = () => {
    setIsGameOver(false);
    setIsPlaying(true);
    setJustStarted(true);
    setScore(0);
  };

  const handleScoreUpdate = async () => {
    if (highScoreBeaten) {
      try {
        setIsLoading(true); // Start loading

        // Get player data from local storage
        const playerData = localStorage.getItem("player");
        if (playerData) {
          const { pubKey, id, score } = JSON.parse(playerData);

          // Update the high score in local storage
          localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());

          // If the final score is higher than the stored score, update it
          if (finalScore > score) {
            await updateScore(pubKey, id, finalScore);

            // Update the player object in local storage with the new score
            const updatedPlayerData = {
              ...JSON.parse(playerData),
              score: finalScore,
            };
            localStorage.setItem("player", JSON.stringify(updatedPlayerData));
          }

          // Fetch all players after updating the score
          const players: any = await getAllPlayers(pubKey);

          // Sort players by score in descending order
          const sortedPlayers = players.sort(
            (a: Player, b: Player) => b.score - a.score
          );
          setAllPlayers(sortedPlayers); // Store sorted players data in state
        } else {
          console.error("No player data found in local storage.");
        }
      } catch (error) {
        console.error("Failed to update score or fetch players:", error);
      } finally {
        setIsLoading(false); // End loading
      }
    } else {
      try {
        setIsLoading(true);
        const pubKey = localStorage.getItem("publicKey");

        if (!pubKey) {
          alert("Please connect your Freighter wallet.");
          setIsLoading(false);
          return;
        }
        // Fetch all players after updating the score
        const players: any = await getAllPlayers(pubKey);

        // Sort players by score in descending order
        const sortedPlayers = players.sort(
          (a: Player, b: Player) => b.score - a.score
        );
        setAllPlayers(sortedPlayers); // Store sorted players data in state
        setIsLoading(false); // End loading
      } catch (error) {
        console.error("Failed to Fetch all players:", error);
      } finally {
        setIsLoading(false); // End loading
      }
    }
  };

  useEffect(() => {
    handleScoreUpdate();
  }, []); // Run the score update logic when the component mounts

  return (
    <div id="game-over-modal-container" onClick={handleGameReset}>
      <div id="game-over-modal">
        <h2>Game Over</h2>
        <p className="final-score">
          Your Final Score: <span>{finalScore}</span>
        </p>
        {isLoading && <p>Loading...</p>} {/* Loader */}
        {!isLoading && highScoreBeaten && finalScore > 0 && (
          <p className="congratulate">🏆 You beat the high score! 🏆</p>
        )}
        <p className="click-dir">(Click anywhere to continue)</p>
        {/* Display all players in a table sorted by score */}
        {allPlayers.length > 0 && (
            <table id="players">
              <caption>All players</caption>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {allPlayers.map((player) => (
                  <tr key={player.id}>
                    <td>{player.id}</td>
                    <td>{player.name}</td>
                    <td>{player.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
