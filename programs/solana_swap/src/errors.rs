use anchor_lang::prelude::*;

#[error_code]
pub enum SwapError {
    #[msg("Unauthorized access")]
    Unauthorized,

    #[msg("Math operation overflowed")]
    MathOverflow,

    #[msg("Swap execution failed")]
    SwapFailed,
}
