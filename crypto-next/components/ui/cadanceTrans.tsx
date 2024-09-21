// components/Transaction.tsx
import { useState } from "react";
import * as fcl from "@onflow/fcl";

const Transaction: React.FC<{ amount: number; recipientAddress: string }> = ({ amount, recipientAddress }) => {
  const [txStatus, setTxStatus] = useState<string>("Not started");

  const sendTransaction = async () => {
    setTxStatus("Transaction started...");

    try {
    //   const txId = await fcl.mutate({
    //     cadence: `
    //       transaction {
    //         prepare(signer: AuthAccount) {
    //           log("Transaction successfully signed by the user!")
    //         }
    //       }
    //     `,
    //     proposer: fcl.currentUser,
    //     payer: fcl.currentUser,
    //     authorizations: [fcl.currentUser],
    //     limit: 50, // Gas limit
    //   });

    const txId = await fcl.mutate({
        cadence: `
          import FungibleToken from 0xf233dcee88fe0abe
          import FlowToken from 0x1654653399040a61
      
          transaction(recipient: Address, amount: UFix64) {
            let sentVault: @FungibleToken.Vault
      
            prepare(signer: AuthAccount) {
              // Borrow the FlowToken Vault of the signer
              let vaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow reference to the signer's FlowToken Vault")
      
              // Withdraw the specified amount from the signer's Vault
              self.sentVault <- vaultRef.withdraw(amount: amount)
            }
      
            execute {
              // Get the recipient's account
              let recipientAccount = getAccount(recipient)
      
              // Get the recipient's FlowToken Vault Receiver capability
              let receiverRef = recipientAccount
                .getCapability(/public/flowTokenReceiver)
                .borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow reference to the recipient's FlowToken Vault")
      
              // Deposit the withdrawn tokens into the recipient's Vault
              receiverRef.deposit(from: <-self.sentVault)
      
              log("Transferred Flow tokens successfully")
            }
          }
        `,
        args: (arg, t) => [
          arg(recipientAddress, t.Address), // Pass recipient address as argument
          arg(amount, t.UFix64),            // Pass the amount as argument
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 50, // Gas limit
      });

      setTxStatus(`Transaction submitted with ID: ${txId}`);

      const transaction = await fcl.tx(txId).onceSealed();
      setTxStatus(`Transaction completed! Status: ${transaction.status}`);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTxStatus("Transaction failed");
    }
  };

  return (
    <div>
      <h3>Send Transaction</h3>
      <button onClick={sendTransaction}>Send</button>
      <p>{txStatus}</p>
      <>{}</>
    </div>
  );
};



export default Transaction;
