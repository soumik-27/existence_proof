#![cfg(test)]

use super::*;
use soroban_sdk::BytesN;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_register_and_verify() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let hash = BytesN::<32>::from_array(&env, &[1u8; 32]);
    let description = String::from_str(&env, "Test Document");

    // Register a document
    client.register(&hash, &user, &description);

    // Verify it exists
    let reg = client.verify(&hash);
    assert!(reg.is_some());
    let reg = reg.unwrap();
    assert_eq!(reg.submitter, user);
    assert_eq!(reg.description, description);
}

#[test]
fn test_verify_nonexistent() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let hash = BytesN::<32>::from_array(&env, &[0u8; 32]);
    let reg = client.verify(&hash);
    assert!(reg.is_none());
}

#[test]
fn test_multiple_registrations() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    let hash1 = BytesN::<32>::from_array(&env, &[1u8; 32]);
    let hash2 = BytesN::<32>::from_array(&env, &[2u8; 32]);

    client.register(&hash1, &user1, &String::from_str(&env, "Doc 1"));
    client.register(&hash2, &user2, &String::from_str(&env, "Doc 2"));

    assert_eq!(client.get_total_count(), 2);
    assert!(client.verify(&hash1).is_some());
    assert!(client.verify(&hash2).is_some());
}

#[test]
fn test_duplicate_hash() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let hash = BytesN::<32>::from_array(&env, &[5u8; 32]);

    // First registration succeeds
    client.register(&hash, &user1, &String::from_str(&env, "First"));

    // Second registration with same hash returns error
    let result = client.try_register(&hash, &user2, &String::from_str(&env, "Duplicate"));
    assert!(result.is_err());
}

#[test]
fn test_paginated_listing() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    // Register 5 documents
    for i in 0..5u32 {
        let mut bytes = [0u8; 32];
        bytes[0..4].copy_from_slice(&i.to_le_bytes());
        let hash = BytesN::<32>::from_array(&env, &bytes);
        client.register(&hash, &user, &String::from_str(&env, "Document"));
    }

    assert_eq!(client.get_total_count(), 5);

    // Get first 3
    let first_three = client.get_registrations(&0, &3);
    assert_eq!(first_three.len(), 3);

    // Get next 3 (only 2 remaining)
    let next_three = client.get_registrations(&3, &6);
    assert_eq!(next_three.len(), 2);
}

#[test]
fn test_permissionless_anyone_can_register() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Multiple different users can all register
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);

    let hash1 = BytesN::<32>::from_array(&env, &[10u8; 32]);
    let hash2 = BytesN::<32>::from_array(&env, &[20u8; 32]);
    let hash3 = BytesN::<32>::from_array(&env, &[30u8; 32]);

    client.register(&hash1, &user1, &String::from_str(&env, "By user 1"));
    client.register(&hash2, &user2, &String::from_str(&env, "By user 2"));
    client.register(&hash3, &user3, &String::from_str(&env, "By user 3"));

    assert_eq!(client.get_total_count(), 3);

    // Each can verify their own
    assert!(client.verify(&hash1).is_some());
    assert!(client.verify(&hash2).is_some());
    assert!(client.verify(&hash3).is_some());
}
