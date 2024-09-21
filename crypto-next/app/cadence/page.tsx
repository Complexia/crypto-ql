"use client";

import Image from "next/image";
import { useContext, useRef, useState } from "react";
import { motion } from "framer-motion";
import ChatBox from "@/components/ui/chatBox";
import { NearContext } from "@/context";
import { Ethereum } from "@/services/ethereum";
import { useDebounce } from "@/hooks/debounce";
import { Bitcoin as Bitcoin } from "@/services/bitcoin";
import Transaction from "@/components/ui/cadanceTrans";
import Login from "@/components/ui/cadenceLogin ";

export default function Home() {

    return (
        <main className="flex flex-col items-center justify-between screen-max-width">
           <Transaction amount={1} recipientAddress="0x0fc8af039514689f" />
            <Login />
        </main>
    );
}
