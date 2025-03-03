use anchor_lang::prelude::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: The mint address is verified in the instruction logic
    pub token_mint: AccountInfo<'info>,

    /// CHECK: The user's token account must be verified in the instruction logic.
    #[account(mut)]
    pub user_token_account: AccountInfo<'info>,

    /// CHECK: The pool account is assumed to be validated elsewhere.
    #[account(mut)]
    pub pool: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
