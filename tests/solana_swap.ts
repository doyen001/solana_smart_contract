import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";


import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import { assert } from "chai";
import { readFileSync } from "fs";
import { AccountLayout } from "@solana/spl-token";

// Load the compiled program IDL (if using Anchor)
const idl = JSON.parse(readFileSync("./target/idl/solana_swap.json", "utf8"));

function loadKeypairFromFile(path: string): Keypair {
  const secretKey = JSON.parse(readFileSync(path, "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

async function getTokenAccount(connection, tokenAccountPubkey) {
  const accountInfo = await connection.getAccountInfo(tokenAccountPubkey);
  if (!accountInfo) {
    throw new Error("Token account not found");
  }
  
  const data = AccountLayout.decode(accountInfo.data);
  return {
    mint: new PublicKey(data.mint),
    owner: new PublicKey(data.owner),
    amount: data.amount,
  };
}

describe("solana_swap", () => {
  const connection = new Connection("https://api.devnet.solana.com");
  const keypair = loadKeypairFromFile("/root/.config/solana/id.json");
  const wallet = new anchor.Wallet(keypair);
  const provider = new AnchorProvider(connection, wallet, { commitment: "processed" });
  anchor.setProvider(provider);

  console.log("Wallet Public Key:", wallet.publicKey.toBase58());

  // Load the program using IDL
  const program = new Program(idl as anchor.Idl, provider);
  console.log("Program initialized:", program.programId.toBase58());



  let user: Keypair;
  let tokenMint: PublicKey;
  let userTokenAccount: PublicKey;
  let pool: PublicKey;

  before(async () => {
      // Generate a new keypair for the user
      user = loadKeypairFromFile("/root/.config/solana/id.json");

      // Replace with actual values
      tokenMint = new PublicKey("7XzRGykBc7F566G9nXKBLWfuKgbizSbEyNgHVNLpeLDv");  // token mint address
      userTokenAccount = new PublicKey("24QrH3YUzSKVCS1NLhxDPcv2Co21kYoEgUX9RLAZd2iS");  // toekn account
      pool = new PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C");  

  });

  it("Performs a SOL to Token Swap", async () => {
    const authCode = "SECRET_AUTH_CODE"; // Simulated authentication
    const amount = new BN(1_000_000);  // Amount in lamports (0.001 SOL)
    const slippage = 1;        
    const fee = new BN(10_000);

    try {
        // Call the swap instruction
        const tx = await program.methods.swapSolToToken(
            authCode,
            amount,
            slippage,
            fee
        ).accounts({
            user: user.publicKey,
            tokenMint,
            userTokenAccount,
            pool,
            tokenProgram: TOKEN_PROGRAM_ID,  // ✅ Correct way to set the Token Program
            systemProgram: SystemProgram.programId,
        }).signers([wallet.payer])
        .rpc();

        console.log("✅ Transaction successful:", tx);
        const userTokenAccountInfo = await getTokenAccount(provider.connection, userTokenAccount);
        console.log("User token balance:", userTokenAccountInfo.amount);
        // // Fetch the updated user token balance
        // const userTokenAccountInfo = await getTokenAccount(provider.connection, userTokenAccount);
    
        // // Verify that the balance increased (tokens received from swap)
        assert(userTokenAccountInfo.amount > 0, "User did not receive tokens");
        assert.isOk( "Swap transaction should be successful");

    } catch (error) {
        console.error("❌ Swap failed:", error);
        assert.fail("Swap transaction failed");
    }
});
});
