"use client";

import { useContext, useEffect } from "react";
import { NearContext } from "../context";
import { Wallet } from "@/services/near-wallet";

const Magic = () => {
    // @ts-ignore
    const { wallet, signedAccountId } = useContext(NearContext);

    console.log("from magic", signedAccountId);
    

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

    return (
        <div className="flex flex-row items-center justify-center">
            {signedAccountId
                ? <button className="btn btn-secondary" onClick={signOut}>Logout {signedAccountId}</button>
                : <button className="btn btn-secondary" onClick={signIn}>Login</button>
            }
        </div>
    )
}

export default Magic;
