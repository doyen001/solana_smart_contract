use anchor_lang::prelude::*;

#[account]
pub struct AuthState {
    pub authority: Pubkey,
    pub is_initialized: bool,
}
