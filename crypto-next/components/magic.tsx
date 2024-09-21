"use client";

import { useContext, useEffect, useState } from "react";
import { NearContext } from "../context";
import { Wallet } from "@/services/near-wallet";

import { EthereumView } from "@/components/near/Ethereum/Ethereum";
import { BitcoinView } from "@/components/near/Bitcoin";
import ChatBox from "./ui/chatBox";

const Magic = () => {
    // @ts-ignore
    const { wallet, signedAccountId } = useContext(NearContext);

    console.log("from magic", signedAccountId);
    const [status, setStatus] = useState("Please login to request a signature");
    const [status2, setStatus2] = useState("na");
    const [chain, setChain] = useState('eth');
    const [receiver, setReceiver] = useState('');
    const [amount, setAmount] = useState('');

    const txHash = new URLSearchParams(window.location.search).get('transactionHashes');
    const transactions = txHash ? txHash.split(',') : [];

    console.log("status2", status2);
    // In your page component or useEffect


    // Later, when handling sign-in
    const handleSignIn = async () => {
        try {
            await wallet.signIn();
        } catch (error) {
            console.error("Failed to sign in:", error);
        }
    };

    const signIn = () => { wallet.signIn() }

    const signOut = () => { wallet.signOut() }
    const MPC_CONTRACT = 'v1.signer-prod.testnet';

    return (
        
            <div className="">
                <div className="">
                    {signedAccountId
                        ? (
                            <div className="flex flex-row items-center justify-between ">
                                <article>
                                    <h1 className="text-4xl">{signedAccountId}</h1>
                                    <p className="text-4xl pt-4">
                                        NEAR control center
                                    </p>
                                </article>
                                <button className="btn btn-secondary" onClick={signOut}>Logout {signedAccountId}</button>
                            </div>
                        )
                        : (


                            <button className="btn btn-secondary" onClick={signIn}>Login</button>

                        )
                    }
                </div>


                {signedAccountId &&
                    <div className="flex flex-col ">
                        <article className="pb-4 ptp-4">
                            <h1 className="text-4xl">Current Chain: {chain}</h1>
                        </article>
                        <article>
                            <h1 className="text-4xl">Available Chains via NEAR MPC:</h1>
                        </article>
                        <div className="flex flex-row gap-4 mt-4 mb-6">
                            <button
                                className={`btn w-36 ${chain === 'eth' ? 'btn-success' : 'btn-primary'}`}
                                onClick={() => setChain('eth')}
                            >
                                {chain === 'eth' && <span className="mr-2">✓</span>}
                                Ethereum
                            </button>
                            <button
                                className={`btn w-36 ${chain === 'btc' ? 'btn-success' : 'btn-primary'}`}
                                onClick={() => setChain('btc')}
                            >
                                {chain === 'btc' && <span className="mr-2">✓</span>}
                                Bitcoin
                            </button>
                        </div>


                        {chain === 'eth' && <EthereumView props={{ setStatus, MPC_CONTRACT, transactions, status2, receiver, amount}} />}
                        {chain === 'btc' && <BitcoinView props={{ setStatus, MPC_CONTRACT }} />}

                    </div>
                }
                
                <div className=" bottom-0 fixed w-2/3 my-4">
                     <ChatBox setStatus={setStatus} setStatus2={setStatus2} setReceiver={setReceiver} setAmount={setAmount}/> 
                </div>

            </div>

        
    )
}

export default Magic;
