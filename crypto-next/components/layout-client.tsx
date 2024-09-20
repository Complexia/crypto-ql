"use client";


import Sidebar from "./ui/sidebar";


import { NearContext } from '../context';

import { useEffect, useState } from "react";
import { Wallet } from "../services/near-wallet";
import { EthereumView } from "@/components/near/Ethereum/Ethereum";
import { BitcoinView } from "@/components/near/Bitcoin";

// CONSTANTS
const MPC_CONTRACT = 'v1.signer-prod.testnet';

// NEAR WALLET
// @ts-ignore
// const wallet = new Wallet({ networkId: 'testnet', createAccessKeyFor: MPC_CONTRACT });






const LayoutClient = ({ children }) => {
    const [signedAccountId, setSignedAccountId] = useState('');

    const [wallet, setWallet] = useState<any>(null);
    useEffect(() => {
        // @ts-ignore
        const wallet = new Wallet({ networkId: 'testnet', createAccessKeyFor: 'your-contract-id' });
        wallet.startUp((signedAccountId) => {
            // Handle account change
            console.log(signedAccountId);
        }).then(() => {
            // Wallet is now initialized and ready to use
            // You can store the wallet instance in state or context if needed
            setWallet(wallet);
        });
    }, []);

    return (


        <NearContext.Provider value={{ wallet, signedAccountId }}>
            <main className="min-h-screen h-screen w-screen flex flex-row ">
                <Sidebar />

                <div className="flex flex-row">





                    <div className="mx-12 my-12">
                        {children}
                    </div>
                </div>



            </main>
        </NearContext.Provider>



    )
}

export default LayoutClient;