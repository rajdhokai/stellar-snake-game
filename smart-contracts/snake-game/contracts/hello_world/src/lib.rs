#![allow(non_snake_case)]
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, log, symbol_short, Env, String, Symbol, Vec,
};

// Struct to represent a player in the snake game
#[contracttype]
#[derive(Clone)]
pub struct Player {
    pub id: u64,           // Unique ID for the player
    pub name: String,      // Name of the player
    pub public_key: String, // Public key of the player
    pub score: u64,        // Score of the player
}

// Enum for referencing player storage
#[contracttype]
pub enum Playerbook {
    Player(u64),
}

// Symbol to track the total count of players
const COUNT_PLAYER: Symbol = symbol_short!("C_PLAYER");

// Define a constant for extended TTL (e.g., 100,000 blocks)
const EXTENDED_TTL: u32 = 100_000;

#[contract]
pub struct SnakeGameContract;

#[contractimpl]
impl SnakeGameContract {
    // Function to add a new player
    pub fn add_player(env: Env, name: String, public_key: String, score: u64) -> u64 {
        let mut count_player: u64 = env.storage().instance().get(&COUNT_PLAYER).unwrap_or(0);
        count_player += 1;

        // Create a new player with the provided details
        let new_player = Player {
            id: count_player,
            name,
            public_key,
            score,
        };

        // Store the new player in the contract's storage with extended TTL
        env.storage()
            .instance()
            .set(&Playerbook::Player(new_player.id.clone()), &new_player);
        env.storage().instance().set(&COUNT_PLAYER, &count_player);
        env.storage()
            .instance()
            .extend_ttl(EXTENDED_TTL, EXTENDED_TTL);

        log!(&env, "Player Added with ID: {}", new_player.id);

        // Return the ID of the newly added player
        new_player.id
    }

    // Function to get a player by their ID
    pub fn get_player_by_id(env: Env, player_id: u64) -> Player {
        let key = Playerbook::Player(player_id);

        // Retrieve the player from storage, return default values if not found
        env.storage().instance().get(&key).unwrap_or(Player {
            id: 0,
            name: String::from_str(&env, "Not Found"),
            public_key: String::from_str(&env, "Not Found"),
            score: 0,
        })
    }

    // Function to update a player's score by their ID
    pub fn update_score(env: Env, player_id: u64, new_score: u64) {
        let key = Playerbook::Player(player_id);
        let mut player = Self::get_player_by_id(env.clone(), player_id);

        // Update the score
        player.score = new_score;

        // Store the updated player back in the contract's storage with extended TTL
        env.storage().instance().set(&key, &player);
        env.storage()
            .instance()
            .extend_ttl(EXTENDED_TTL, EXTENDED_TTL);

        log!(&env, "Player with ID: {} has been updated with new score: {}.", player_id, new_score);
    }

    // Function to get all players
    pub fn get_all_players(env: Env) -> Vec<Player> {
        let count_player: u64 = env.storage().instance().get(&COUNT_PLAYER).unwrap_or(0);
        let mut players = Vec::new(&env);

        for i in 1..=count_player {
            let player = Self::get_player_by_id(env.clone(), i);
            players.push_back(player);
        }

        players
    }

    // Function to delete a player by their ID
    pub fn delete_player(env: Env, player_id: u64) {
        let key = Playerbook::Player(player_id);

        // Check if the player exists before deleting
        if env.storage().instance().has(&key) {
            // Remove the player from storage
            env.storage().instance().remove(&key);

            // Update the total player count
            let mut count_player: u64 = env.storage().instance().get(&COUNT_PLAYER).unwrap_or(0);
            if count_player > 0 {
                count_player -= 1;
                env.storage().instance().set(&COUNT_PLAYER, &count_player);
            }

            log!(
                &env,
                "Player with ID: {} has been permanently deleted.",
                player_id
            );
        } else {
            log!(&env, "Player with ID: {} does not exist.", player_id);
        }
    }
}
