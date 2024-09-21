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

    const transsaction = [
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/profile1.png?t=2024-09-21T02%3A30%3A21.438Z", to: "Ben", value: 15000, status: "Success", prove: "0x491eeffffa66afadb1ffece07991682310e2f223",chain:"eth" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/profile2.jpg", to: "Phil", value: 5000, status: "Failed", prove: "0x491eeffffa66afadb1ffece07991682310e2f222",chain:"btc" },
        { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/profile3.jpg", to: "Alex", value: 16000, status: "Pending", prove: "0x491eeffffa66afadb1ffece07991682310e2f221",chain:"cac" },
    ];

    const [selectedWalletIndex, setSelectedWalletIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean | false>(false);

    return (
        <main className="flex flex-col items-center justify-between screen-max-width">
            <div className="flex flex-col w-full my-14 bg-base-100">
                <div className="flex justify-between items-center p-4">
                    <h1 id="heading" className="text-2xl font-bold">
                        Contact:
                    </h1>
                    <button className="btn btn-active btn-secondary">Add Contact</button>
                </div>
                <div className="flex justify-center">
                    <ul className="menu rounded-box w-full">
                        {transsaction.map((item, index) => (
                            <li key={index} className="flex flex-row items-center space-x-4">
                                <img src={item.img} alt={`Transaction ${index + 1}`} className="bg-transparent w-20 h-20 border border-black object-cover" />
                                <div className="flex-grow flex justify-between">
                                    <span className="font-semibold">{item.to}</span>
                                    <span className="font-semibold">Chain: {item.chain}</span>
                                    {/* <div className="flex flex-col">
                                        <span className="font-semibold">{item.to}</span>
                                        <div className="dropdown">
                                            <div tabIndex={0} role="button" className="link">Address</div>
                                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow text-white">
                                                <li><a>{item.prove}</a></li>
                                            </ul>
                                        </div>
                                    </div> */}

                                    <div className="flex flex-col items-end">
                                        {/* <span className="font-semibold mr-16">${item.value}</span>
                                        <span className={`flex items-center px-2 py-1 rounded ${item.status === 'Success' ? 'text-green-500 bg-green-500/10' :
                                            item.status === 'Failed' ? 'text-red-500 bg-red-500/10' :
                                                item.status === 'Pending' ? 'text-blue-500 bg-blue-500/10' : ''
                                            }`}>
                                            <svg width="10px" height="10px" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                                                <circle cx="6" cy="6" r="6" fill="currentColor" />
                                            </svg>
                                            {item.status}
                                        </span> */}
                                        <div className="dropdown dropdown-end">
                                            <div tabIndex={0} role="button" className="link">Address</div>
                                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow text-white">
                                                <li><a>{item.prove}</a></li>
                                            </ul>
                                        </div>
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
