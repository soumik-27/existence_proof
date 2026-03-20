#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Registration {
    pub submitter: Address,
    pub timestamp: u64,
    pub description: String,
}

#[contracttype]
pub enum DataKey {
    Registry,
    AllHashes,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Register a document hash - ANYONE can call this (permissionless)
    pub fn register(env: Env, hash: BytesN<32>, submitter: Address, description: String) {
        submitter.require_auth();

        let mut registry: Vec<(BytesN<32>, Registration)> = env
            .storage()
            .instance()
            .get(&DataKey::Registry)
            .unwrap_or_else(|| Vec::new(&env));

        // Check for duplicate
        for i in 0..registry.len() {
            if let Some((existing_hash, _)) = registry.get(i) {
                if existing_hash == hash {
                    panic!("hash already registered");
                }
            }
        }

        let registration = Registration {
            submitter,
            timestamp: env.ledger().timestamp(),
            description,
        };

        registry.push_back((hash, registration));
        env.storage().instance().set(&DataKey::Registry, &registry);
    }

    /// Verify if a hash exists - returns registration if found
    pub fn verify(env: Env, hash: BytesN<32>) -> Option<Registration> {
        let registry: Vec<(BytesN<32>, Registration)> = env
            .storage()
            .instance()
            .get(&DataKey::Registry)
            .unwrap_or_else(|| Vec::new(&env));

        for i in 0..registry.len() {
            if let Some((existing_hash, registration)) = registry.get(i) {
                if existing_hash == hash {
                    return Some(registration);
                }
            }
        }
        None
    }

    /// Get total number of registrations
    pub fn get_total_count(env: Env) -> u32 {
        let registry: Vec<(BytesN<32>, Registration)> = env
            .storage()
            .instance()
            .get(&DataKey::Registry)
            .unwrap_or_else(|| Vec::new(&env));
        registry.len()
    }

    /// Get registrations with pagination (start inclusive, end exclusive)
    pub fn get_registrations(env: Env, start: u32, end: u32) -> Vec<Registration> {
        let registry: Vec<(BytesN<32>, Registration)> = env
            .storage()
            .instance()
            .get(&DataKey::Registry)
            .unwrap_or_else(|| Vec::new(&env));

        let mut results = Vec::new(&env);
        let total = registry.len();
        let end = if end > total { total } else { end };

        let mut i = start;
        while i < end {
            if let Some((_, registration)) = registry.get(i) {
                results.push_back(registration);
            }
            i += 1;
        }
        results
    }
}

mod test;
