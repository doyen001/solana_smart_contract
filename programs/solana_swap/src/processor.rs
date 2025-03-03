use crate::instructions::Swap;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;

pub fn process_swap_sol_to_token(
    ctx: Context<Swap>,
    auth_code: String,
    amount: u64,
    slippage: u8,
    fee: u64,
) -> Result<()> {
    msg!("test");
    // Swap logic for SOL → Token
    require!(
        auth_code == "SECRET_AUTH_CODE",
        CustomError::InvalidAuthCode
    );

    msg!("Swapping {} lamports (SOL) to token...", amount);

    Ok(())
}

pub fn process_swap_token_to_sol(
    ctx: Context<Swap>,
    auth_code: String,
    amount: u64,
    slippage: u8,
    fee: u64,
) -> Result<()> {
    // Swap logic for Token → SOL
    require!(
        auth_code == "SECRET_AUTH_CODE",
        CustomError::InvalidAuthCode
    );

    msg!("Swapping {} tokens to SOL...", amount);

    Ok(())
}

#[error_code]
pub enum CustomError {
    #[msg("Invalid Authentication Code")]
    InvalidAuthCode,
}
