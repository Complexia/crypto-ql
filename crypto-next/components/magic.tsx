"use client";

import { useContext, useEffect, useState } from "react";
import { NearContext } from "../context";
import { Wallet } from "@/services/near-wallet";

import { EthereumView } from "@/components/near/Ethereum/Ethereum";
import { BitcoinView } from "@/components/near/Bitcoin";

const Magic = () => {
    // @ts-ignore
    const { wallet, signedAccountId } = useContext(NearContext);

    console.log("from magic", signedAccountId);
    const [status, setStatus] = useState("Please login to request a signature");
    const [chain, setChain] = useState('eth');

    const txHash = new URLSearchParams(window.location.search).get('transactionHashes');
    const transactions = txHash ? txHash.split(',') : [];


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
        <div>
            <div className="flex flex-row items-center">
                {signedAccountId
                    ? <button className="btn btn-secondary" onClick={signOut}>Logout {signedAccountId}</button>
                    : <button className="btn btn-secondary" onClick={signIn}>Login</button>
                }
            </div>
            {signedAccountId &&
                <div style={{ width: '50%', minWidth: '400px' }}>

                    <div className="input-group input-group-sm mt-3 mb-3">
                        <input className="form-control text-center" type="text" value={`MPC Contract: ${MPC_CONTRACT}`} disabled />
                    </div>

                    <div className="input-group input-group-sm my-2 mb-4">
                        <span className="text-primary input-group-text" id="chain">Chain</span>
                        <select className="form-select" aria-describedby="chain" value={chain} onChange={e => setChain(e.target.value)} >
                            <option value="eth"> Ξ Ethereum </option>
                            <option value="btc"> ₿ BTC </option>
                        </select>
                    </div>

                    {chain === 'eth' && <EthereumView props={{ setStatus, MPC_CONTRACT, transactions }} />}
                    {chain === 'btc' && <BitcoinView props={{ setStatus, MPC_CONTRACT }} />}
                </div>
            }
        </div>
    )
}

export default Magic;
