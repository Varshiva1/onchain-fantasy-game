use ethers::{
    providers::{Provider, Http, Middleware},
    types::{Address, U256},
    signers::LocalWallet,
};
use anyhow::Result;
use std::str::FromStr;

#[derive(Clone)]
pub struct BlockchainManager {
    provider: Provider<Http>,
    wallet: LocalWallet,
    factory_address: Address,
}

impl BlockchainManager {
    pub fn new(rpc_url: &str, private_key: &str, factory_address: &str) -> Result<Self> {
        let provider = Provider::<Http>::try_from(rpc_url)?;
        let wallet = private_key.parse::<LocalWallet>()?;
        let factory_address = Address::from_str(factory_address)?;
        
        Ok(BlockchainManager {
            provider,
            wallet,
            factory_address,
        })
    }
    
    pub async fn create_market(
        &self,
        _question: &str,
        _end_time: u64,
        _initial_liquidity: U256,
    ) -> Result<String> {
        // This would call the MarketFactory.createMarket function
        // For now, we'll return a mock transaction hash
        // In a real implementation, you would:
        // 1. Encode the function call
        // 2. Send the transaction
        // 3. Wait for confirmation
        // 4. Return the transaction hash
        
        let tx_hash = format!("0x{}", hex::encode(&[0u8; 32]));
        Ok(tx_hash)
    }
    
    pub async fn join_tournament(
        &self,
        _market_address: &str,
        _amount: U256,
    ) -> Result<String> {
        // This would call the Market.buyYes function
        // For now, we'll return a mock transaction hash
        let tx_hash = format!("0x{}", hex::encode(&[0u8; 32]));
        Ok(tx_hash)
    }
    
    pub async fn get_balance(&self, address: &str) -> Result<U256> {
        let addr = Address::from_str(address)?;
        let balance = self.provider.get_balance(addr, None).await?;
        Ok(balance)
    }
}
