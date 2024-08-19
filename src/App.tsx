import { useState, useEffect } from 'react';
import SnakesGame from './SnakesGame';
import { addPlayer, getAllPlayers } from './utils/Soroban';
import Modal from './SnakesGame/Modal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch feedings and add player when the modal is submitted
  const addPlayers = async (playerName: string) => {
    setIsLoading(true); // Start loading
    try {
      const pubKey = localStorage.getItem('publicKey');
      
      if (!pubKey) {
        alert('Please connect your Freighter wallet.');
        setIsLoading(false);
        return;
      }

      // Assume addPlayer returns an object with the player's ID
      const response: any = await addPlayer(pubKey, playerName, 0);
      const playerId = response;

      // Create the player object
      const playerObject = {
        id: playerId,
        playerName: playerName,
        pubKey: pubKey,
        score: 0,
      };

      // Store the player object in local storage
      localStorage.setItem('player', JSON.stringify(playerObject));

      // Fetch all players (or any other relevant data)
      await getAllPlayers(pubKey);

      // Show success alert
      alert(`Player ${playerName} with ID ${playerId} has been created!`);
    } catch (error) {
      console.error('Failed to add player:', error);
      alert('Failed to add player. Please try again later.');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleModalSubmit = (playerName: string) => {
    addPlayers(playerName);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const player = localStorage.getItem('player');
    if (!player) {
      setIsModalOpen(true); // Open modal if no player object is set
    }
  }, []);

  return (
    <>
      {isLoading && <div className="loader">Loading...</div>} {/* Loader */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
      <SnakesGame />
    </>
  );
}

export default App;
