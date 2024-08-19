import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Address,
} from "@stellar/stellar-sdk";
import { userSignTransaction } from "../utils/Freighter";

let rpcUrl = "https://soroban-testnet.stellar.org";

let contractAddress =
  "CBGPKZU7CNVUITUZO5SJXMBIMVHZPU2PIOJAM7MBWBPEITKUY2YLEJRB";

// Convert Account Address to ScVal form
const accountToScVal = (account) => new Address(account).toScVal();

// Convert String to ScVal form
const stringToScValString = (value) => nativeToScVal(value);

// Convert Number to U64 ScVal
const numberToU64 = (value) => nativeToScVal(value, { type: "u64" });

let params = {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
};

// Function to interact with the smart contract
async function contractInt(caller, functName, values) {
  const provider = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
  const sourceAccount = await provider.getAccount(caller);
  const contract = new Contract(contractAddress);
  let buildTx;

  if (values == null) {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName))
      .setTimeout(30)
      .build();
  } else if (Array.isArray(values)) {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName, ...values))
      .setTimeout(30)
      .build();
  } else {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName, values))
      .setTimeout(30)
      .build();
  }

  let _buildTx = await provider.prepareTransaction(buildTx);

  let prepareTx = _buildTx.toXDR(); // Pre-encoding (converting it to XDR format)

  let signedTx = await userSignTransaction(prepareTx, "TESTNET", caller);

  let tx = TransactionBuilder.fromXDR(signedTx, Networks.TESTNET);

  try {
    let sendTx = await provider.sendTransaction(tx).catch(function (err) {
      console.error("Catch-1", err);
      return err;
    });
    if (sendTx.errorResult) {
      throw new Error("Unable to submit transaction");
    }
    if (sendTx.status === "PENDING") {
      let txResponse = await provider.getTransaction(sendTx.hash);
      // Continuously checking the transaction status until it gets successfully added to the blockchain ledger or it gets rejected
      while (txResponse.status === "NOT_FOUND") {
        txResponse = await provider.getTransaction(sendTx.hash);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (txResponse.status === "SUCCESS") {
        let result = txResponse.returnValue;
        return result;
      }
    }
  } catch (err) {
    console.log("Catch-2", err);
    return;
  }
}

async function addPlayer(caller, playerId, playerName, initialScore) {
  let playerIdScVal = numberToU64(playerId);
  let playerNameScVal = stringToScValString(playerName);
  let initialScoreScVal = numberToU64(initialScore);

  const values = [playerIdScVal, playerNameScVal, initialScoreScVal];

  try {
    const result = await contractInt(caller, "add_player", values);
    console.log(`Player ${playerName} with ID ${playerId} has been added!`);
    return result;
  } catch (error) {
    console.log("Unable to add player. Please check the provided details.");
  }
}

async function getPlayerById(caller, playerId) {
  let playerIdScVal = numberToU64(playerId);

  try {
    let result = await contractInt(caller, "get_player_by_id", playerIdScVal);

    let id = Number(result?._value[0]?._attributes?.val?._value);
    let name = result?._value[1]?._attributes?.val?._value?.toString();
    let score = Number(result?._value[2]?._attributes?.val?._value);

    console.log({ id, name, score });

    return { id, name, score };
  } catch (error) {
    console.log("Unable to fetch player details.");
  }
}

async function updateScore(caller, playerId, newScore) {
  let playerIdScVal = numberToU64(playerId);
  let newScoreScVal = numberToU64(newScore);

  const values = [playerIdScVal, newScoreScVal];

  try {
    await contractInt(caller, "update_score", values);
    console.log(`Player ID ${playerId} score has been updated to ${newScore}!`);
  } catch (error) {
    console.log("Unable to update player score.");
  }
}

async function getAllPlayers(caller) {
  try {
    let result = await contractInt(caller, "get_all_players", null);
    let players = result?._value.map((player) => ({
      id: Number(player?._value[0]?._attributes?.val?._value),
      name: player?._value[1]?._attributes?.val?._value?.toString(),
      score: Number(player?._value[2]?._attributes?.val?._value),
    }));

    console.log(players);

    return players;
  } catch (error) {
    console.log("Unable to fetch all players.");
  }
}

async function deletePlayer(caller, playerId) {
  let playerIdScVal = numberToU64(playerId);

  try {
    await contractInt(caller, "delete_player", playerIdScVal);
    console.log(`Player ID ${playerId} has been deleted!`);
  } catch (error) {
    console.log("Unable to delete player. Please ensure the player exists.");
  }
}

export default { addPlayer, getPlayerById, updateScore, getAllPlayers, deletePlayer };
