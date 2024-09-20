"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
    const user = "Roma Li";
    const wallet = [
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/Gold%20Elegant%20Business%20Card-2.png", address: "0x1234...5678", value: 1.5, currency: "ETH" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/Black%20White%20Elegant%20Minimalist%20Member%20Id%20Card.png?t=2024-09-20T13%3A32%3A27.402Z", address: "0xabcd...efgh", value: 2.3, currency: "USDC" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/black%20blue%20white%20modern%20business%20id%20card.png?t=2024-09-20T13%3A32%3A53.657Z", address: "0x9876...5432", value: 0.8, currency: "BTC" }
    ];
    const transsaction = [
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/bank-landmark-svgrepo-com.svg?t=2024-09-20T14%3A04%3A33.731Z", to: "Ben", value: 15000, status: "Success", prove: "0xabcd...efgh" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/bank-landmark-svgrepo-com.svg?t=2024-09-20T14%3A04%3A33.731Z", to: "Phil", value: 5000, status: "Failed", prove: "0xabcd...efgh" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/bank-landmark-svgrepo-com.svg?t=2024-09-20T14%3A04%3A33.731Z", to: "Alex", value: 16000, status: "Pending", prove: "0xabcd...efgh" },
    ];

    type WalletType = typeof wallet[0];
    const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);

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
                            {selectedWallet ? selectedWallet.value : 0}
                        </span>
                        <span className="text-lg text-black">
                            {selectedWallet ? selectedWallet.currency || 'ETH' : 'ETH'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full my-14">
                <h1 id="heading" className="text-2xl font-bold text-black p-4">
                    My Wallet.
                </h1>
                <div className="flex flex-col items-center w-full">
                    <div className="carousel rounded-box max-w-md space-x-4 p-4">
                        {wallet.map((item, index) => (
                            <div key={index} className="carousel-item">
                                <div
                                    className="card w-96 shadow-xl cursor-pointer"
                                    onClick={() => setSelectedWallet(item)}
                                >
                                    <div className="card-body">
                                        {/* <h2 className="card-title">Wallet {index + 1}</h2>
                                    <p>Address: {item.address}</p>
                                    <p>Value: {item.value} ETH</p> */}
                                        <img src={item.img} alt={`Wallet ${index + 1}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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

        </main>
    );
}
