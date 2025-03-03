import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { bs58 } from "@switchboard-xyz/common";


import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import { assert } from "chai";
import { readFileSync } from "fs";
// import { IDL } from "../target/idl/solana_swap.json";

// Load the compiled program IDL (if using Anchor)
const idl = JSON.parse(readFileSync("./target/idl/solana_swap.json", "utf8"));
// const keypair = JSON.parse(readFileSync("./target/deploy/solana_swap-keypair.json", "utf8"));

const loadKeypairFromEnv = () => {
    const secretKeyArray = JSON.parse("AuP9xHutW9oDMDWFcaZDL9dY3RVB74ivF3pWiZcLhdRV");
    console.log("test", secretKeyArray);
    const secretKey = Uint8Array.from(secretKeyArray);
    const keypair = Keypair.fromSecretKey(secretKey);
    return keypair;
  }

describe("solana_swap", () => {
  // Set up provider and wallet
//   const provider = anchor.AnchorProvider.local();
//   anchor.setProvider(provider);
  
//   const program = anchor.workspace.SolanaSwap as Program<SolanaSwap>;
  const connection = new Connection("https://api.devnet.solana.com");
  const keypair = loadKeypairFromEnv();
  console.log("key", keypair);
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

  async function getPoolAddress(tokenMint: PublicKey, program: Program) {
    const [poolAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), tokenMint.toBuffer()],
      program.programId
    );
    return poolAddress;
  }

  before(async () => {
      // Generate a new keypair for the user
      user = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse("4HJd2S7eMBKkySbif3VfNLgsiQyTkqgf9FnSYweKkC3d")));
      console.log('player: ', user.publicKey.toBase58());
    //   user = new keypair("4HJd2S7eMBKkySbif3VfNLgsiQyTkqgf9FnSYweKkC3d");


      // Replace with actual values
      tokenMint = new PublicKey("7XzRGykBc7F566G9nXKBLWfuKgbizSbEyNgHVNLpeLDv");  // token mint address
      userTokenAccount = new PublicKey("24QrH3YUzSKVCS1NLhxDPcv2Co21kYoEgUX9RLAZd2iS");  // toekn account

      const poolAddress = await getPoolAddress(tokenMint, program);
      pool = new PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C");  
  });

  it("Performs a SOL to Token Swap", async () => {
    const authCode = "SECRET_AUTH_CODE"; // Simulated authentication
    const amount = new anchor.BN(1_000_000);  // Amount in lamports (0.001 SOL)
    console.log("am", amount);
    const slippage = 1;        
    const fee = new anchor.BN(10_000);

    // Airdrop SOL to the test wallet
    await provider.connection.requestAirdrop(wallet.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
    console.log("fee", fee);

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
        assert.isOk( "Swap transaction should be successful");
        // // Fetch the updated user token balance
        // const userTokenAccountInfo = await getTokenAccount(provider.connection, userTokenAccount);
    
        // // Verify that the balance increased (tokens received from swap)
        // assert(userTokenAccountInfo.amount > 0, "User did not receive tokens");
    } catch (error) {
        console.error("❌ Swap failed:", error);
        assert.fail("Swap transaction failed");
    }
});
});
