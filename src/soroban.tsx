import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Address,
  xdr,
  Transaction,
} from "@stellar/stellar-sdk";
import { userSignTransaction } from "../src/Freighter";

const rpcUrl = "https://soroban-testnet.stellar.org";

const contractAddress = "CBGPKZU7CNVUITUZO5SJXMBIMVHZPU2PIOJAM7MBWBPEITKUY2YLEJRB";

// Convert Account Address to ScVal form
const accountToScVal = (account: string) => new Address(account).toScVal();

// Convert String to ScVal form
const stringToScValString = (value: string) => nativeToScVal(value);

// Convert Number to U64 ScVal
const numberToU64 = (value: number) => nativeToScVal(value, { type: "u64" });

const params = {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
};

// Function to interact with the smart contract
 async function contractInt(
  caller: string,
  functName: string,
  values: xdr.ScVal[] | xdr.ScVal | null
): Promise<xdr.ScVal | undefined> {
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

  const preparedTx = await provider.prepareTransaction(buildTx);
  const prepareTx = preparedTx.toXDR(); // Pre-encoding (converting it to XDR format)
  const signedTx = await userSignTransaction(prepareTx, "TESTNET", caller);
  const tx = TransactionBuilder.fromXDR(signedTx, Networks.TESTNET);

  try {
    const sendTx: any= await provider.sendTransaction(tx).catch((err: Error) => {
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
        const result = txResponse.returnValue;
        return result;
      }
    }
  } catch (err) {
    console.log("Catch-2", err);
    return;
  }
}

export async function addPlayer(
  caller: string,
  playerId: number,
  playerName: string,
  initialScore: number
): Promise<xdr.ScVal | undefined> {
  const playerIdScVal = numberToU64(playerId);
  const playerNameScVal = stringToScValString(playerName);
  const initialScoreScVal = numberToU64(initialScore);

  const values = [playerIdScVal, playerNameScVal, initialScoreScVal];

  try {
    const result = await contractInt(caller, "add_player", values);
    console.log(`Player ${playerName} with ID ${playerId} has been added!`);
    return result;
  } catch (error) {
    console.log("Unable to add player. Please check the provided details.");
  }
}

export async function getPlayerById(
  caller: string,
  playerId: number
): Promise<{ id: number; name: string; score: number } | undefined> {
  const playerIdScVal = numberToU64(playerId);

  try {
    const result = await contractInt(caller, "get_player_by_id", playerIdScVal) as any;

    const id = Number(result?._value[0]?._attributes?.val?._value);
    const name = result?._value[1]?._attributes?.val?._value?.toString();
    const score = Number(result?._value[2]?._attributes?.val?._value);

    console.log({ id, name, score });

    return { id, name, score };
  } catch (error) {
    console.log("Unable to fetch player details.");
  }
}

export async function updateScore(
  caller: string,
  playerId: number,
  newScore: number
): Promise<void> {
  const playerIdScVal = numberToU64(playerId);
  const newScoreScVal = numberToU64(newScore);

  const values = [playerIdScVal, newScoreScVal];

  try {
    await contractInt(caller, "update_score", values);
    console.log(`Player ID ${playerId} score has been updated to ${newScore}!`);
  } catch (error) {
    console.log("Unable to update player score.");
  }
}

export default async function getAllPlayers(
  caller: string
): Promise<Array<{ id: number; name: string; score: number }> | undefined> {
  try {
    const result = await contractInt(caller, "get_all_players", null) as any;
    const players = result?._value.map((player: any) => ({
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

export async function deletePlayer(caller: string, playerId: number): Promise<void> {
  const playerIdScVal = numberToU64(playerId);

  try {
    await contractInt(caller, "delete_player", playerIdScVal);
    console.log(`Player ID ${playerId} has been deleted!`);
  } catch (error) {
    console.log("Unable to delete player. Please ensure the player exists.");
  }
}

