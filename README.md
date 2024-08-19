# Snake Game 

## Set Up Environment / Project Installation Guide

[Deploy URL](https://stellar-snake-game.vercel.app/)

### A) Environment Setup:

- Install Rust, using command:
  `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

- Install the Soroban CLI using below mentioned command. For more info visit => [Soroban docs](https://developers.stellar.org/docs/smart-contracts)
  `cargo install --locked soroban-cli`

- Install [Node.js](https://nodejs.org/en)

- Get the [Freighter Wallet](https://www.freighter.app/) extension for you browser.
  Once enabled, then got to the network section and connect your wallet to the testnet.

- Install wasm32-unknown-unknown package using command:
  `rustup target add wasm32-unknown-unknown`

- To configure your CLI to interact with Testnet, run the following command:

```
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

- In order to deploy the smartcontract you will need an account. You can either use the an account from the `Freighter Wallet` or can configure an account named `alice` in the testnet using the command:
  `soroban keys generate --global alice --network testnet`

- You can see the public key of account `alice`:
  `soroban keys address alice`
---

### B) Backend (Smart-contract) Setup:

- Clone the repository:
  `git clone https://github.com/rajdhokai/stellar-snake-game.git`

- Smart-contracts folder Structure:

```
smart-contracts
    |──snake-game
        ├── Cargo.lock
        ├── Cargo.toml
        ├── README.md
        └── contracts
            └── hello_world
                ├── Cargo.toml
                └── src
                    └── lib.rs
```

***=> Go inside the `/smart-contracts/snake-game` directory and do the below mentioned steps:***

- Build the contract:

```
soroban contract build
```

- Alternte command:

```
cargo build --target wasm32-unknown-unknown --release
```

- Install Optimizer:

```
cargo install --locked soroban-cli --features opt
```

- Build an Opmize the contract:

```
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/hello_world.wasm 
```

### Steps to the Deploy smart-contract on testnet:

- deploy the smartcontract on the testnet and get deployed address of the smartcontract using the following command:

```
stellar contract deploy --wasm target\wasm32-unknown-unknown\release\hello_world.wasm  --network testnet --source alice
```

**_Deployed address of this smartcontract:_** `CBGPKZU7CNVUITUZO5SJXMBIMVHZPU2PIOJAM7MBWBPEITKUY2YLEJRB `

\*NOTE: If you get the XDR Error `error: xdr processing error: xdr value invalid`, then follow this [article](https://stellar.org/blog/developers/protocol-21-upgrade-guide).

### Invoke functions from the smart-contract:

- #### To invoke any of the function from the smartcontract you can use this command fromat.

```
soroban contract invoke \
  --id <DEPLOYED_CONTRACT_ADDRESS> \
  --source <YOUR_ACCOUNT_NAME> \
  --network testnet \
  -- \
  <FUNCTION_NAME> --<FUNCTION_PARAMETER> <ARGUMENT>
```

- #### For example:

1. Create a Player
```
soroban contract invoke --id CBGPKZU7CNVUITUZO5SJXMBIMVHZPU2PIOJAM7MBWBPEITKUY2YLEJRB --source alice --network testnet -- add_player --name "Alice" --public_key "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF" --score 100
```

2. Update a Player's Score
```
soroban contract invoke --id CBGPKZU7CNVUITUZO5SJXMBIMVHZPU2PIOJAM7MBWBPEITKUY2YLEJRB --source alice --network testnet -- update_player --player_id 1 --new_score 150
```

3. Get Player by ID
```
soroban contract invoke --id CBGPKZU7CNVUITUZO5SJXMBIMVHZPU2PIOJAM7MBWBPEITKUY2YLEJRB --source alice --network testnet -- get_player_by_id --player_id 1
```

4. Get All Players
```
soroban contract invoke --id CBGPKZU7CNVUITUZO5SJXMBIMVHZPU2PIOJAM7MBWBPEITKUY2YLEJRB --source alice --network testnet -- get_all_players
```

5. Delete a Player by ID
```
soroban contract invoke --id CBGPKZU7CNVUITUZO5SJXMBIMVHZPU2PIOJAM7MBWBPEITKUY2YLEJRB --source alice --network testnet -- delete_player --player_id 1
```
## Notes:
Replace "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF" with a valid public key for your player.
The --id flag represents the ID of the player when updating, retrieving, or deleting specific player data.
The commands assume that the name, public_key, and score parameters are required to create a new player. Adjust accordingly if your contract implementation differs.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Getting Started](#getting-started)
- [Game Controls](#game-controls)
- [License](#license)


## Features

- Classic Snake gameplay.
- Built with React.js and HTML canvas.
- No third-party libraries used.
- TypeScript for type safety.
- Responsive design.
- Score tracking.
- Saves HighScore
- Game over screen with the option to restart.
- Keyboard controls for navigation.

## Getting Started

To run the game locally, follow these steps:

1. Clone this repository:

   ```shell
   git clone git@github.com:<your-user-name>/stellar-snakes-game.git
   ```

2. Navigate to the project directory:

   ```shell
   cd snake-game
   ```

3. Install the required dependencies. Yarn is recommended:

   ```shell
   yarn
   ```

4. Run the build script:

   ```shell
   yarn build
   ```

5. Start the game by serving the build output:

   ```shell
   yarn preview
   ```

**NOTE**: The development environment causes the components to re-render, causing the game logic for the canvas to be duplicated and appear buggy. That's why it's recommended to build the app and run the build output to avoid the re-renders.

## Game Controls

Use the arrow keys or `W`,`A`,`S`,`D` keys on your keyboard to control the snake's direction:

- ↑ (Up) or `W` - Move Up
- ↓ (Down) or `S` - Move Down
- ← (Left) or `A` - Move Left
- → (Right) or `D` - Move Right

Others:

- To **Pause** the game - Press `esc` or click anywhere the screen
