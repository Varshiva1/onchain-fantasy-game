use mongodb::{Client, Database, Collection};
use anyhow::Result;
use crate::models::{Tournament, Participant, Contest, Sport};

#[derive(Clone)]
pub struct DatabaseManager {
    pub client: Client,
    pub database: Database,
}

impl DatabaseManager {
    pub async fn new(connection_string: &str, database_name: &str) -> Result<Self> {
        let client = Client::with_uri_str(connection_string).await?;
        let database = client.database(database_name);
        
        Ok(DatabaseManager {
            client,
            database,
        })
    }
    
    pub fn tournaments(&self) -> Collection<Tournament> {
        self.database.collection::<Tournament>("tournaments")
    }
    
    pub fn participants(&self) -> Collection<Participant> {
        self.database.collection::<Participant>("participants")
    }
    
    pub fn contests(&self) -> Collection<Contest> {
        self.database.collection::<Contest>("contests")
    }
    
    pub fn sports(&self) -> Collection<Sport> {
        self.database.collection::<Sport>("sports")
    }
    
    pub async fn initialize_collections(&self) -> Result<()> {
        // Create indexes for better performance
        let tournaments = self.tournaments();
        tournaments.create_index(
            mongodb::IndexModel::builder()
                .keys(mongodb::bson::doc! { "tournament_id": 1 })
                .options(mongodb::options::IndexOptions::builder().unique(true).build())
                .build(),
            None,
        ).await?;
        
        tournaments.create_index(
            mongodb::IndexModel::builder()
                .keys(mongodb::bson::doc! { "sport": 1, "status": 1 })
                .build(),
            None,
        ).await?;
        
        let participants = self.participants();
        participants.create_index(
            mongodb::IndexModel::builder()
                .keys(mongodb::bson::doc! { "tournament_id": 1, "user_address": 1 })
                .options(mongodb::options::IndexOptions::builder().unique(true).build())
                .build(),
            None,
        ).await?;
        
        Ok(())
    }
}
