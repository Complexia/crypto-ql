// components/Transaction.tsx
import { useState } from "react";
import * as fcl from "@onflow/fcl";

const Transaction = () => {
  const [txStatus, setTxStatus] = useState<string>("Not started");

  const sendTransaction = async () => {
    setTxStatus("Transaction started...");

    try {
      const txId = await fcl.mutate({
        cadence: `
          transaction {
            prepare(signer: AuthAccount) {
              log("Transaction successfully signed by the user!")
            }
          }
        `,
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
