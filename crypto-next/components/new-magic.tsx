"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Account } from './account';
import { useState } from 'react';
import { motion } from "framer-motion";
import OpenAI from "openai"; // Assuming you have this package installed
import { useAccount } from 'wagmi';
import { useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import {
    type BaseError,
    useSendTransaction,
    useWaitForTransactionReceipt
} from 'wagmi'
import { parseEther } from 'viem'

const api = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
console.log("keyss", api);
// 3. Initialize the OpenAI instance (could be passed as config instead of dotenv)
const openai = new OpenAI({
    // apiKey: api,  // Make sure to pass this securely in React or as a parameter
    apiKey: api,
    dangerouslyAllowBrowser: true
});

const contact = [
    { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/profile1.png?t=2024-09-21T02%3A30%3A21.438Z", to: "Ben", value: 15000, status: "Success", prove: "0x491eeffffa66afadb1ffece07991682310e2f223", chain: "eth" },
    { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/profile2.jpg", to: "Phil", value: 5000, status: "Failed", prove: "0x491eeffffa66afadb1ffece07991682310e2f221", chain: "btc" },
    { img: "https://tzqzzuafkobkhygtccse.supabase.co/storage/v1/object/public/biz_touch/crypto-ql/profile3.jpg", to: "Alex", value: 16000, status: "Pending", prove: "0x491eeffffa66afadb1ffece07991682310e2f224", chain: "cac" },
];

const getContactInfo = (userName: string) => {
    const user = contact.find(c => c.to.toLowerCase() === userName.toLowerCase());
    if (user) {
        return { chain: user.chain, prove: user.prove };
    }
    return null;
};

export const NewMagic = () => {

    const [receiver, setReceiver] = useState<string>('');
    const [amount, setAmount] = useState<any>(0);

    const SendTransaction = () => {
        const {
            data: hash,
            error,
            isPending,
            sendTransaction
        } = useSendTransaction()

        async function submit(e: React.FormEvent<HTMLFormElement>) {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const to = formData.get('address') as `0x${string}`
            const value = formData.get('value') as string
            sendTransaction({ to, value: parseEther(value) })
        }

        const { isLoading: isConfirming, isSuccess: isConfirmed } =
            useWaitForTransactionReceipt({
                hash,
            })

        return (
            <form onSubmit={submit}>
                <input name="address" placeholder="0xA0Cf…251e" required />
                <input name="value" placeholder="0.05" required />
                <button
                    disabled={isPending}
                    type="submit"
                >
                    {isPending ? 'Confirming...' : 'Send'}
                </button>
                {hash && <div>Transaction Hash: {hash}</div>}
                {isConfirming && <div>Waiting for confirmation...</div>}
                {isConfirmed && <div>Transaction confirmed.</div>}
                {error && (
                    <div>Error: {(error as BaseError).shortMessage || error.message}</div>
                )}
            </form>
        )
    }

    const { address } = useAccount()
    const { data: hash, error, isPending, sendTransaction } = useSendTransaction()


    const handleSendTransaction = async (receiverParam: string, amountParam: any) => {
        console.log("this is automated txn", receiverParam, amountParam)
        if (address) {

            let to = receiverParam as `0x${string}`
            sendTransaction({ to, value: parseEther(amountParam) })

            // const { isLoading: isConfirming, isSuccess: isConfirmed } =
            //     useWaitForTransactionReceipt({
            //         hash,
            //     })
        }
    }


    const [messages, setMessages] = useState<any>([]);
    const ChatBox = () => {
        
        const [inputMessage, setInputMessage] = useState<any>('');
        const [botState, setBotState] = useState<any>('idle');
        const [isRecording, setIsRecording] = useState<any>(false);


        const handleSendText = async () => {
            if (inputMessage.trim() !== '') {
                setMessages([...messages, { type: 'user', content: inputMessage }]);

                if (!address) {
                    setMessages(prevMessages => [...prevMessages, { type: 'agent', content: "Connect your wallet first! The Connect Wallet button is on the top left!" }]);
                    return;
                }

                let prompt = `generate a json output that looks like this {
                    "message": "Sure, I will transfer 0.05 ETH to Ben, hang on!",
                    "function": "transfer",
                    "chain": "ethereum",
                    "receiver": "receiver_name",
                    "amount": "0.05"
                  } based on the user prompt/query. the json should represent the actions that need to be taken.
                   For the message, vary it each time to make it unique. User query: ` + inputMessage;



                try {
                    const response = await openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "user", content: prompt }],
                    });


                    if (response.choices && response.choices.length > 0) {
                        const generatedText = response.choices[0].message.content;
                        console.log("OpenAI Response:", generatedText);



                        // Parse the JSON
                        let json = JSON.parse(generatedText || '{}');
                        console.log("JSON:", json);
                        // Get address and chain if available
                        const get_user = json.receiver ? getContactInfo(json.receiver) : null;
                        console.log("this is user from contact ", get_user);
                        json.receiver = get_user?.prove;
                        json.chain = get_user?.chain;

                        setReceiver(json.receiver)
                        setAmount(json.amount)

                        console.log(" THIS IS FINAL PAYLOAD ", json);

                        handleSendTransaction(json.receiver, json.amount)

                        setMessages(prevMessages => [...prevMessages, { type: 'agent', content: json.message }]);

                    }
                }
                catch (error) {
                    console.error("Error:", error);
                }
                setInputMessage('');

            }
        };

        return (
            <>
                
                <div className="chat-container flex flex-col space-y-4 overflow-y-auto max-h-60">
                    {messages.map((message, index) => (
                        <div key={index} className={`chat ${message.type === 'user' ? 'chat-start' : 'chat-end'}`}>
                            <div className={`chat-bubble ${message.type === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
                                {message.content}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center w-full p-4 bg-primary rounded-2xl shadow-md">


                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                // Handle the enter key press here
                                console.log("User entered:", inputMessage);
                                handleSendText();

                                setInputMessage(""); // Clear the input after submission
                            }
                        }
                        }
                        // placeholder={text}
                        className="flex-grow px-4 py-2 mr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center">
                        <div className="p-2 mr-2 ">
                            <motion.svg
                                width="30"
                                height="30"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                animate={
                                    botState === "talk"
                                        ? { rotate: [0, 5, -5, 0] }
                                        : isRecording
                                            ? { rotate: 360 }
                                            : {}
                                }
                                transition={
                                    botState === "talk"
                                        ? { duration: 0.5, repeat: Infinity }
                                        : isRecording
                                            ? { duration: 1, repeat: Infinity, ease: "linear" }
                                            : {}
                                }
                            >
                                <motion.path
                                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    animate={botState === "talk" ? { scale: [1, 1.05, 1] } : {}}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                />
                                <motion.path
                                    d="M8 14C8 14 9.5 15 12 15C14.5 15 16 14 16 14"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    animate={botState === "talk" ? {
                                        d: [
                                            "M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14",
                                            "M8 14C8 14 9.5 15 12 15C14.5 15 16 14 16 14",
                                            "M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14",
                                            "M8 15C8 15 9.5 13 12 13C14.5 13 16 15 16 15"
                                        ]
                                    } : { d: "M8 14C8 14 9.5 15 12 15C14.5 15 16 14 16 14" }}
                                    transition={{ duration: 0.3, repeat: Infinity }}
                                />
                                <motion.path
                                    d="M9 9H9.01"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    animate={botState === "talk" ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.1 }}
                                />
                                <motion.path
                                    d="M15 9H15.01"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    animate={botState === "talk" ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.2 }}
                                />
                            </motion.svg>
                        </div>
                        <button
                            className="text-primary w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #DA07ED, #3066BE, #6EFAFB)',
                            }}
                        // onClick={() => handleRecording()}
                        >
                            <svg stroke="currentColor" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </>
        );
    }
    const result = useEnsName({
        address: address,
        blockTag: 'latest', 
        chainId: mainnet.id,
      })

      console.log("ens result", result)
    return (
        <>
            <div className="flex flex-col justify-between items-start space-y-4">
                <p className="mb-2">ENS Name: {result.data} not found...</p>
                <ConnectButton />
                <div className="bottom-0 fixed w-2/3 my-4">
                    <ChatBox />
                </div>
            </div>
        </>
    );
};