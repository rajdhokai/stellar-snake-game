// import SnakesGame from "./SnakesGame";
// import getAllPlayers from "../src/soroban";

// function App() {
//   const fetchFeedings = async () => {
//     try {      
//       const response = await getAllPlayers('GBXEE2WQVDPCQDYWJKDEHPHCFLBIG33IGQQI2AQ47XJ4SZ46BKAEB7BV');
//       console.log(response);
//     } catch{

//     }
//   }
//   return <><button onClick={()=> fetchFeedings()}>test</button>
//   <SnakesGame /></>;
// }

// export default App;
import React, { useState, useEffect } from 'react';
import SnakesGame from './SnakesGame';
import { addPlayer, getAllPlayers } from './soroban';
import Modal from './SnakesGame/Modal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false); // Initially set to false

  // Fetch feedings when the modal is submitted
  const addPlayers = async (playerName: string) => {
    try {
      await addPlayer('GBXEE2WQVDPCQDYWJKDEHPHCFLBIG33IGQQI2AQ47XJ4SZ46BKAEB7BV', playerName, 0);
      await getAllPlayers('GBXEE2WQVDPCQDYWJKDEHPHCFLBIG33IGQQI2AQ47XJ4SZ46BKAEB7BV');
    } catch (error) {
      console.error('Failed to fetch feedings:', error);
    }
  };

  const handleModalSubmit = (playerName: string) => {
    addPlayers(playerName);
    setIsModalOpen(false);
  };

  // Check local storage for player name on component mount
  useEffect(() => {
    const playerName = localStorage.getItem('playerName');
    if (!playerName) {
      setIsModalOpen(true); // Open modal if no player name is set
    }
  }, []);

  return (
    <>
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
