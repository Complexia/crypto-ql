"use client";

import Image from "next/image";
import { useContext, useRef, useState } from "react";
import { motion } from "framer-motion";
import ChatBox from "@/components/ui/chatBox";
import { NearContext } from "@/context";
import { Ethereum } from "@/services/ethereum";
import { useDebounce } from "@/hooks/debounce";
import { Bitcoin as Bitcoin } from "@/services/bitcoin";

export default function Home() {
    const MPC_CONTRACT = 'v1.signer-prod.testnet';
    const Sepolia = 11155111;
    const Eth = new Ethereum('https://rpc2.sepolia.org', Sepolia);
    const BTC_NETWORK = 'testnet';
    const BTC = new Bitcoin('https://blockstream.info/testnet/api', BTC_NETWORK);
    const childRef = useRef();


    const { wallet, signedAccountId } = useContext(NearContext);
    console.log("this is it ...... acc ", signedAccountId);
    console.log("this is it ...... wallet ", wallet);

    const user = signedAccountId;
    const walletTest = [
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/Gold%20Elegant%20Business%20Card-2.png", address: "0x1234...5678", value: 1.5, currency: "ETH", chain: "eth" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/Black%20White%20Elegant%20Minimalist%20Member%20Id%20Card.png?t=2024-09-20T13%3A32%3A27.402Z", address: "0xabcd...efgh", value: 2.3, currency: "USDC", chain: "btc" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/black%20blue%20white%20modern%20business%20id%20card.png?t=2024-09-20T13%3A32%3A53.657Z", address: "0x9876...5432", value: 0.8, currency: "BTC", chain: "near" }
    ];
    const transsaction = [
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/bank-landmark-svgrepo-com.svg?t=2024-09-20T14%3A04%3A33.731Z", to: "Ben", value: 15000, status: "Success", prove: "0xabcd...efgh" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/bank-landmark-svgrepo-com.svg?t=2024-09-20T14%3A04%3A33.731Z", to: "Phil", value: 5000, status: "Failed", prove: "0xabcd...efgh" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/bank-landmark-svgrepo-com.svg?t=2024-09-20T14%3A04%3A33.731Z", to: "Alex", value: 16000, status: "Pending", prove: "0xabcd...efgh" },
    ];

    type WalletType = typeof walletTest[0];
    const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
    const [selectedWalletIndex, setSelectedWalletIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean | false>(false);

    const [derivation, setDerivation] = useState(() => {
        if (selectedWallet?.chain === "eth") {
            // return sessionStorage.getItem('derivation') || "ethereum-1";
            return "ethereum-1";
        } else if (selectedWallet?.chain === "btc") {
            return "bitcoin-1";
        }
        // Default case if neither condition is met
        return "ethereum-1";
    });

    const derivationPath = useDebounce(
        derivation,
        selectedWallet?.chain === "eth" ? 1200 : 500
    );

    // async function chainSignature() {
    //     setLoading(true);
    //     // setStatus('🏗️ Creating transaction');
    //     const { transaction, payload } = await childRef.current.createPayload();
    //     // const { transaction, payload } = await Eth.createPayload(senderAddress, receiver, amount, undefined);
    //     console.log("this is MPC_CONTRACT ", MPC_CONTRACT);
    //     // setStatus(`🕒 Asking ${MPC_CONTRACT} to sign the transaction, this might take a while`);
    //     try {
    //         const { big_r, s, recovery_id } = await Eth.requestSignatureToMPC(wallet, MPC_CONTRACT, derivationPath, payload);
    //         const signedTransaction = await Eth.reconstructSignature(big_r, s, recovery_id, transaction);
    //         console.log("this is your signed transsaction ", signedTransaction);
    //         // setSignedTransaction(signedTransaction);
    //         // setStatus(`✅ Signed payload ready to be relayed to the Ethereum network`);
    //         // setStep('relay');
    //     } catch (e) {
    //         // setStatus(`❌ Error: ${e.message}`);
    //         setLoading(false);
    //     }
    // }

    async function setSelectedWalletHanlder(index) {
        console.log("this is index ", index);
        // eth
        if (index === 0) {
            setLoading(true);
            const { address } = await Eth.deriveAddress(signedAccountId, derivationPath);
            // setSenderAddress(address);
            // setSenderLabel(address);
            const balance = await Eth.getBalance(address);
            // const transactions = await Eth.getTransactionHistory(address);
            // Fetch transaction history
            // const transactions = await Eth.getTransactionHistory(address);
            // console.log("Transaction history:", transactions);
            console.log(`Your Ethereum address is: ${address}, balance: ${balance} ETH`)

            let wallet =
            {
                img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/Gold%20Elegant%20Business%20Card-2.png",
                address: address, value: parseFloat(balance), currency: "ETH", chain: "eth"
            };
            setSelectedWallet(wallet);
            setLoading(false);
        }

        // btc
        if (index === 1) {
            setLoading(true);
            const { address, publicKey } = await BTC.deriveAddress(signedAccountId, derivationPath);
            // setSenderAddress(address);
            // setSenderPK(publicKey);
            const balance = await BTC.getBalance(address);
            console.log(`Your Bitcoin address is: ${address}, balance: ${balance} satoshi`);
            let wallet =
            {
                img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/Gold%20Elegant%20Business%20Card-2.png",
                address: address, value: parseFloat(balance), currency: "BTC", chain: "btc"
            };
            setSelectedWallet(wallet);
            setLoading(false);
        }

        if (index === 2) {
            setLoading(true);
            const { address } = await Eth.deriveAddress(signedAccountId, derivationPath);
            // setSenderAddress(address);
            // setSenderLabel(address);
            const balance = await Eth.getBalance(address);
            console.log(`Your Ethereum address is: ${address}, balance: ${balance} ETH`)
            let wallet =
            {
                img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/Gold%20Elegant%20Business%20Card-2.png",
                address: address, value: parseFloat(balance), currency: "ETH", chain: "eth"
            };
            setSelectedWallet(wallet);
            setLoading(false);
        }

    };

    return (
        <main className="flex flex-col items-center justify-between bg-white screen-max-width">
            <div className="flex flex-col w-full my-14">
                <h1 id="heading" className="text-2xl font-bold text-black p-4">
                    Good morning, {user} !
                </h1>
                <div className="flex flex-col px-4">
                    <h2 className="text-xl font-semibold text-black">
                        Total Balance
                    </h2>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-black mt-2">
                            {loading ?
                                (<>
                                    <span className="loading loading-infinity loading-lg text-black"></span>
                                </>) :
                                (<>
                                    {selectedWallet ? selectedWallet.value : 0.00}
                                </>)}
                        </span>
                        <span className="text-lg text-black">
                            {loading ?
                                (<>
                                    <span className="loading loading-infinity loading-lg text-black"></span>
                                </>) :
                                (<>
                                    {selectedWallet ? selectedWallet.currency || 'ETH' : 'ETH'}
                                </>)}
                        </span>
                    </div>

                    <span className="loading loading-infinity loading-lg"></span>

                </div>
            </div>

            <div className="flex flex-col w-full my-14">
                <h1 id="heading" className="text-2xl font-bold text-black p-4">
                    My Wallet.
                </h1>
                <div className="flex justify-center items-center w-full relative h-64">
                    {walletTest.map((item, index) => (
                        <motion.div
                            key={index}
                            className={`absolute cursor-pointer`}
                            initial={{
                                rotate: 0,
                                x: '-50%',
                                y: '-50%',
                                zIndex: walletTest.length - index,
                                scale: 1 - (index * 0.005)  // Even smaller scaling factor for more exposure
                            }}
                            animate={{
                                rotate: selectedWalletIndex !== null ? (index - selectedWalletIndex) * 3 : 0,
                                x: selectedWalletIndex !== null ? `calc(-50% + ${(index - selectedWalletIndex) * 30}%)` : '-50%',  // Increased horizontal spread
                                y: selectedWalletIndex !== null ? `calc(-50% + ${(index - selectedWalletIndex) * -1}%)` : '-50%',  // Further reduced vertical spread
                                zIndex: selectedWalletIndex !== null ? (selectedWalletIndex === index ? walletTest.length + 1 : walletTest.length - Math.abs(index - selectedWalletIndex)) : walletTest.length - index,
                                scale: selectedWalletIndex !== null ? (selectedWalletIndex === index ? 1.1 : 1 - (Math.abs(index - selectedWalletIndex) * 0.005)) : 1 - (index * 0.005)  // Even smaller scaling factor for more exposure
                            }}
                            transition={{ duration: 0.3 }}
                            onClick={() => {
                                // setSelectedWallet(item);
                                setSelectedWalletIndex(index);
                                setSelectedWalletHanlder(index);
                            }}
                            style={{
                                left: '50%',
                                top: '50%',
                                transformOrigin: 'center center',
                            }}
                        >
                            <div className="card w-80 shadow-xl">
                                <div className="card-body p-0">
                                    <img src={item.img} alt={`Wallet ${index + 1}`} className="w-full h-auto" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col w-full my-14 text-black">
                <h1 id="heading" className="text-2xl font-bold text-black p-4">
                    Recent Transaction.
                </h1>
                <div className="flex justify-center">
                    <ul className="menu rounded-box w-full">
                        {transsaction.map((item, index) => (
                            <li key={index} className="flex flex-row items-center space-x-4">
                                <img src={item.img} alt={`Transaction ${index + 1}`} className="bg-white w-12 h-12 rounded-full border border-black" />
                                <div className="flex-grow flex justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-black">To: {item.to}</span>
                                        {/* <span>{item.value}</span> */}
                                        <div className="dropdown">
                                            <div tabIndex={0} role="button" className="link">Show tracking</div>
                                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow text-white">
                                                <li><a>{item.prove}</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="font-semibold text-black mr-16">${item.value}</span>
                                        <span className={`flex items-center px-2 py-1 rounded ${item.status === 'Success' ? 'text-green-500 bg-green-500/10' :
                                            item.status === 'Failed' ? 'text-red-500 bg-red-500/10' :
                                                item.status === 'Pending' ? 'text-blue-500 bg-blue-500/10' : ''
                                            }`}>
                                            <svg width="10px" height="10px" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                                                <circle cx="6" cy="6" r="6" fill="currentColor" />
                                            </svg>
                                            {item.status}
                                        </span>
                                    </div>

                                </div>
                            </li>

                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex flex-col w-full my-14">
                <h1 id="heading" className="text-2xl font-bold text-black p-4">
                    Upcoming Payments
                </h1>
                <ChatBox />
            </div>

        </main>
    );
}
