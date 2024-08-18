import SnakesGame from "./SnakesGame";
import getAllPlayers from "../src/soroban";

function App() {
  const fetchFeedings = async () => {
    try {      
      const response = await getAllPlayers('GBXEE2WQVDPCQDYWJKDEHPHCFLBIG33IGQQI2AQ47XJ4SZ46BKAEB7BV');
      console.log(response);
    } catch{

    }
  }
  return <><button onClick={()=> fetchFeedings()}>test</button>
  <SnakesGame /></>;
}

export default App;
