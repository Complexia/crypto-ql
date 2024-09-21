"use client"

// import SetStateAction from "react";
import { useEffect, useState, useRef, useContext } from "react";
import { sendAudioToTranscriptionAPI, generateResponseAndAudio } from "../../ultilities/ai";
import { motion } from "framer-motion";
import OpenAI from "openai"; // Assuming you have this package installed
import { OpenAI as LangchainOpenAI } from "@langchain/openai";
import { Ethereum } from "@/services/ethereum";
import { NearContext } from "@/context";



import { useDebounce } from "@/hooks/debounce";
import PropTypes from 'prop-types';


const Sepolia = 11155111;
const Eth = new Ethereum('https://rpc2.sepolia.org', Sepolia);


// import { generateResponseAndAudio } from "../ultilities/ai";

// declare global {
//     interface Window {
//         SpeechRecognition: any;
//         webkitSpeechRecognition: any;
//     }
// }

export interface ResponseData {
  data: string;
  contentType: string;
  model: string;
  status: string;
}



const api = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
console.log("keyss", api);
// 3. Initialize the OpenAI instance (could be passed as config instead of dotenv)
const openai = new OpenAI({
  // apiKey: api,  // Make sure to pass this securely in React or as a parameter
  apiKey: api,
  dangerouslyAllowBrowser: true
});

const ChatBox = ({ setStatus, setStatus2 }) => {


  const { wallet, signedAccountId } = useContext(NearContext);


  const txHash = new URLSearchParams(window.location.search).get('transactionHashes');
  const transactions = txHash ? txHash.split(',') : [];
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(transactions ? 'relay' : "request");
  const [signedTransaction, setSignedTransaction] = useState(null);

  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState("");

  const [senderLabel, setSenderLabel] = useState("")
  const [senderAddress, setSenderAddress] = useState("")
  const [action, setAction] = useState("transfer")
  const [derivation, setDerivation] = useState(sessionStorage.getItem('derivation') || "ethereum-1");
  const derivationPath = useDebounce(derivation, 1200);
  const MPC_CONTRACT = 'v1.signer-prod.testnet';



  const [reloaded, setReloaded] = useState(transactions.length ? true : false);

  const childRef = useRef<any>();

  function removeUrlParams() {
    const url = new URL(window.location.href);
    url.searchParams.delete('transactionHashes');
    window.history.replaceState({}, document.title, url);
  }

  useEffect(() => {
    // special case for web wallet that reload the whole page
    if (reloaded && senderAddress) signTransaction()

    async function signTransaction() {
      const { big_r, s, recovery_id } = await wallet.getTransactionResult(transactions[0]);
      console.log({ big_r, s, recovery_id });
      const signedTransaction = await Eth.reconstructSignatureFromLocalSession(big_r, s, recovery_id, senderAddress);
      setSignedTransaction(signedTransaction);
      setStatus(`✅ Signed payload ready to be relayed to the Ethereum network`);
      setStep('relay');

      setReloaded(false);
      removeUrlParams();
    }

  }, [senderAddress]);

  async function chainSignature() {
    setStatus('🏗️ Creating transaction');

    const { transaction, payload } = await childRef?.current?.createPayload();
    // const { transaction, payload } = await Eth.createPayload(senderAddress, receiver, amount, undefined);

    setStatus(`🕒 Asking ${MPC_CONTRACT} to sign the transaction, this might take a while`);
    try {
      //@ts-ignore
      const { big_r, s, recovery_id } = await Eth.requestSignatureToMPC(wallet, MPC_CONTRACT, derivationPath, payload, transaction, senderAddress);
      //@ts-ignore
      const signedTransaction = await Eth.reconstructSignature(big_r, s, recovery_id, transaction, senderAddress);

      setSignedTransaction(signedTransaction);
      setStatus(`✅ Signed payload ready to be relayed to the Ethereum network`);
      setStatus2('relay');
      setStep('relay');
    } catch (e: any) {
      setStatus(`❌ Error: ${e.message}`);
      setLoading(false);
    }
  }

  async function relayTransaction() {
    setLoading(true);
    setStatus('🔗 Relaying transaction to the Ethereum network... this might take a while');

    try {
      const txHash = await Eth.relayTransaction(signedTransaction);
      setStatus(
        <>
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank"> ✅ Successful </a>
        </>
      );
      childRef.current.afterRelay();
    } catch (e: any) {
      setStatus(`❌ Error: ${e.message}`);
    }

    setStep('request');
    setLoading(false);
  }

  const UIChainSignature = async () => {
    setLoading(true);
    await chainSignature();
    setLoading(false);
  }

  // const [isRecording, setIsRecording] = useState<boolean>(false);
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // const [_transcript, setTranscript] = useState<string>("");
  // const [model, setModel] = useState<string>("");
  // const [_response, setResponse] = useState<string>("");
  // const [_isLoading, setIsLoading] = useState<boolean>(false);

  // //5. Ref hooks for speech recognition and silence detection
  // const recognitionRef = useRef<any>(null);
  // const silenceTimerRef = useRef<any>(null);

  // const handleResult = (event: any): void => {
  //     if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  //     let interimTranscript = "";
  //     for (let i = event.resultIndex; i < event.results.length; ++i) {
  //         interimTranscript += event.results[i][0].transcript;
  //     }
  //     setTranscript(interimTranscript);
  //     silenceTimerRef.current = setTimeout(() => {
  //         //9.1 Extract and send detected words to backend
  //         const words = interimTranscript.split(" ");
  //         const modelKeywords = [
  //             "gpt4",
  //             "gpt",
  //             "perplexity",
  //             "local mistral",
  //             "local llama",
  //             "mixture",
  //             "mistral",
  //             "llama",
  //         ];
  //         const detectedModel = modelKeywords.find((keyword) =>
  //             words.slice(0, 3).join(" ").toLowerCase().includes(keyword)
  //         );
  //         setModel(detectedModel || "gpt");
  //         sendToBackend(interimTranscript, detectedModel);
  //         setTranscript("");
  //     }, 2000);
  // };
  // const sendToBackend = async (message: string, modelKeyword?: string): Promise<void> => {
  //     setIsLoading(true);
  //     if (modelKeyword) setModel(modelKeyword);
  //     else if (!model) setModel("gpt-3.5");

  //     try {
  //         //7.1 Stop recording before sending data
  //         stopRecording();

  //         //7.2 Send POST request to backend
  //         //   const response = await fetch("/api/chat", {
  //         //     method: "POST",
  //         //     headers: { "Content-Type": "application/json" },
  //         //     body: JSON.stringify({ message, model: modelKeyword }),
  //         //   });

  //         //7.3 Check for response validity
  //         //   if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  //         //7.4 Process and play audio response if available
  //         //   const data = await response.json();
  //         const data = await generateResponseAndAudio(message, modelKeyword, "Patrick Ha");
  //         if (data.data && data.contentType === "audio/mp3") {
  //             const audioSrc = `data:audio/mp3;base64,${data.data}`;
  //             const audio = new Audio(audioSrc);
  //             setIsPlaying(true);
  //             audio.play();
  //             audio.onended = () => {
  //                 setIsPlaying(false);
  //                 startRecording();
  //                 if (data.model) setModel(data.model);
  //             };
  //         }

  //     } catch (error) {
  //         //7.5 Handle errors during data transmission or audio playback
  //         console.error("Error sending data to backend or playing audio:", error);
  //     }
  //     setIsLoading(false);
  // };
  // //10. Initialize speech recognition
  // // const startRecording = () => {
  // //     console.log("start recording");
  // //     setIsRecording(true);
  // //     setTranscript("");
  // //     setResponse("");
  // //     recognitionRef.current = new window.webkitSpeechRecognition();
  // //     recognitionRef.current.continuous = true;
  // //     recognitionRef.current.interimResults = true;
  // //     recognitionRef.current.onresult = handleResult;
  // //     recognitionRef.current.onend = () => {
  // //         setIsRecording(false);
  // //         if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  // //     };
  // //     recognitionRef.current.start();
  // // };

  // // const startRecording = () => {
  // //     console.log("start recording");

  // //     // Set up your states for recording
  // //     setIsRecording(true);
  // //     setTranscript("");
  // //     setResponse("");

  // //     // Check for SpeechRecognition or webkitSpeechRecognition
  // //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  // //     if (SpeechRecognition) {
  // //         recognitionRef.current = new SpeechRecognition();
  // //         recognitionRef.current.continuous = true; // Keep recognizing speech continuously
  // //         recognitionRef.current.interimResults = true; // Capture interim results

  // //         // Handle the result (transcript of speech)
  // //         recognitionRef.current.onresult = (event: any) => {
  // //             let transcript = "";
  // //             for (let i = event.resultIndex; i < event.results.length; i++) {
  // //                 transcript += event.results[i][0].transcript;
  // //             }
  // //             handleResult(transcript); // Update the transcript with the result
  // //         };

  // //         // Handle when recognition ends
  // //         recognitionRef.current.onend = () => {
  // //             setIsRecording(false);
  // //             if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  // //         };

  // //         // Start the speech recognition
  // //         recognitionRef.current.start();
  // //     } else {
  // //         console.error("SpeechRecognition API is not supported in this browser.");
  // //     }
  // // };

  // const startRecording = () => {
  //     console.log("start recording");

  //     console.log("debug 0");
  //     // Set up your states for recording
  //     setIsRecording(true);
  //     setTranscript("");
  //     setResponse("");

  //     // Check for SpeechRecognition or webkitSpeechRecognition
  //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  //     console.log("debug 1");
  //     if (SpeechRecognition) {
  //         recognitionRef.current = new SpeechRecognition();
  //         recognitionRef.current.continuous = false; // Stop recognizing after one session
  //         recognitionRef.current.interimResults = true; // Capture interim results

  //         let fullTranscript = ""; // Store the complete transcript

  //         console.log("debug 2");
  //         // Handle the result (transcript of speech)
  //         recognitionRef.current.onresult = (event: any) => {
  //             let interimTranscript = "";
  //             for (let i = event.resultIndex; i < event.results.length; i++) {
  //                 interimTranscript += event.results[i][0].transcript;
  //             }
  //             fullTranscript += interimTranscript; // Append interim results to full transcript
  //             handleResult(interimTranscript); // Update the transcript with the result
  //         };

  //         console.log("debug 3");
  //         // Handle when recognition ends
  //         recognitionRef.current.onend = () => {
  //             setIsRecording(false);
  //             console.log("Recording finished:", fullTranscript); // Log the final transcript
  //         };

  //         console.log("debug 4");
  //         // Start the speech recognition
  //         recognitionRef.current.start();

  //         // Set timeout to stop recording after 5 seconds
  //         setTimeout(() => {
  //             if (recognitionRef.current) {
  //                 recognitionRef.current.stop(); // Stop the recognition after 5 seconds
  //             }
  //         }, 5000); // 5000 milliseconds = 5 seconds

  //         console.log("debug 5");
  //     } else {
  //         console.error("SpeechRecognition API is not supported in this browser.");
  //     }
  // };



  // useEffect(
  //     () => () => {
  //         if (recognitionRef.current) recognitionRef.current.stop();
  //     },
  //     []
  // );

  // const stopRecording = () => {
  //     if (recognitionRef.current) recognitionRef.current.stop();
  // };

  // //13. Toggle recording state
  // const handleToggleRecording = () => {
  //     if (!isRecording && !isPlaying) startRecording();
  //     else if (isRecording) stopRecording();
  // };

  const [isRecording, setIsRecording] = useState<boolean>(false);
  // const [_audioUrl, setAudioUrl] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [transcript, setTranscript] = useState<ResponseData | undefined>(undefined);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null); // Store the media stream to stop it later




  // const handleRecording = () => {

  //   if (isRecording) {
  //     // Stop the recording if it is currently ongoing
  //     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
  //       mediaRecorderRef.current.stop();
  //     }
  //     if (streamRef.current) {
  //       // Stop all tracks of the stream to free up the microphone
  //       streamRef.current.getTracks().forEach((track) => track.stop());
  //     }
  //     setIsRecording(false);
  //   } else {
  //     // Start a new recording
  //     navigator.mediaDevices.getUserMedia({ audio: true })
  //       .then((stream: MediaStream) => {
  //         streamRef.current = stream; // Store the stream so we can stop it later
  //         const mediaRecorder = new MediaRecorder(stream);
  //         mediaRecorderRef.current = mediaRecorder;

  //         // Collect audio data
  //         mediaRecorder.ondataavailable = (event: BlobEvent) => {
  //           audioChunksRef.current.push(event.data);
  //         };

  //         // Start recording
  //         mediaRecorder.start();
  //         setIsRecording(true);

  //         // mediaRecorder.onstop = async () => {
  //         //   const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
  //         //   console.log("Audio Blob Size:", audioBlob.size); // Check the size
  //         //   console.log("Audio Blob Type:", audioBlob.type); // Check the type
  //         //   audioChunksRef.current = []; // Reset chunks for future recordings

  //         //   // Use a function to send audioBlob to an API for transcription
  //         //   const text = await sendAudioToTranscriptionAPI(audioBlob);
  //         //   console.log("COPY HERE FOR THE PROMPT ", text);
  //         //   setTranscript(text);
  //         // };



  //         mediaRecorder.onstop = async () => {
  //           const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
  //           console.log("Audio Blob Size:", audioBlob.size);
  //           console.log("Audio Blob Type:", audioBlob.type);
  //           audioChunksRef.current = []; // Reset chunks for future recordings

  //           //test
  //           const response = await openai.audio.transcriptions.create({
  //             file: new File([audioBlob], "audio.wav"), // Using the default format provided by the browser
  //             model: "whisper-1", // Whisper model for transcription
  //             // response_format: "text",
  //           });
  //           const text = response.text;
  //           setInputText(text);
  //           console.log("Whisper API Response:", text); // Inspect API response
  //           // Set an initial "processing" state
  //           setTranscript(waitPrompt);
  //           Promise.all([
  //             generateResponseAndAudio(text, "gpt", "Patrick Ha"),
  //             new Promise(resolve => setTimeout(resolve, 10000)) // Minimum 1 second delay
  //           ]).then(([text]) => {
  //             console.log("Copy Here ,", text);
  //             // Update with the actual response
  //             setTranscript(text);
  //           }).catch(error => {
  //             console.error("Error in transcription:", error);
  //             setTranscript(errorPrompt);
  //           });

  //           // return audioRes; // Return the generated response data
  //           //end.



  //           // Use Promise.all to run the API call in the background
  //           // Promise.all([
  //           //   sendAudioToTranscriptionAPI(audioBlob),
  //           //   new Promise(resolve => setTimeout(resolve, 6000)) // Minimum 1 second delay
  //           // ]).then(([text]) => {
  //           //   // Update with the actual response
  //           //   setTranscript(text);
  //           // }).catch(error => {
  //           //   console.error("Error in transcription:", error);
  //           //   setTranscript(errorPrompt);
  //           // });
  //         };


  //       })
  //       .catch((error: DOMException) => {
  //         console.error('Error accessing the microphone:', error);
  //       });
  //   }
  // };

  // const userEnter = (text: string) => {
  //   setInputText(text);
  //   console.log("User enter: ", text); // Inspect API response
  //   // Set an initial "processing" state
  //   setTranscript(waitPrompt);
  //   Promise.all([
  //     generateResponseAndAudio(text, "gpt", "Patrick Ha"),
  //     new Promise(resolve => setTimeout(resolve, 10000)) // Minimum 1 second delay
  //   ]).then(([text]) => {
  //     console.log("Copy Here ,", text);
  //     // Update with the actual response
  //     setTranscript(text);
  //   }).catch(error => {
  //     console.error("Error in transcription:", error);
  //     setTranscript(errorPrompt);
  //   });
  // };

  const handleSendText = async (text: string) => {
    setInputText(text);
    let prompt = `generate a json output that looks like this {
      "function": "transfer",
      "chain": "ethereum",
      "receiver": "wallet_address",
      "amount": "0.05"
    } based on the user prompt/query. the json should represent the actions that need to be taken. User query: ` + text;

    try {
      console.log("Prompt:", prompt);
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      if (response.choices && response.choices.length > 0) {
        const generatedText = response.choices[0].message.content;
        console.log("OpenAI Response:", generatedText);
        // parse the json
        const json = JSON.parse(generatedText || '{}');
        console.log("JSON:", json);
        setSenderAddress(json.sender);
        setReceiverAddress(json.receiver);
        setAmount(json.amount);
        setChain(json.chain);

        if (json.chain === "ethereum" && json.function === "transfer") {

          const Sepolia = 11155111;
          const Eth = new Ethereum('https://rpc2.sepolia.org', Sepolia);
          const { transaction, payload } = await Eth.createPayload(signedAccountId, json.receiver, json.amount, undefined);
        }


        return json;
      } else {
        console.error("No response from OpenAI");
        return null;
      }
    } catch (error) {
      console.error("Error sending prompt to OpenAI:", error);
      return null;
    }
  };







  // const videoRef = useRef<HTMLVideoElement>(null);
  // const [_error, setError] = useState<string | null>(null);

  // const openCamera = () => {
  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     navigator.mediaDevices.getUserMedia({ video: true })
  //       .then((stream) => {
  //         if (videoRef.current) {
  //           videoRef.current.srcObject = stream;
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("Error accessing the camera:", err);
  //         setError('Error accessing the camera.');
  //       });
  //   } else {
  //     setError('Camera access is not supported in this environment.');
  //   }
  // };

  const [botState, setBotState] = useState("idle");
  const [_user, _setUser] = useState(null);
  const [activeButton, setActiveButton] = useState(1);
  const [_tab, _setTab] = useState(1);


  // useEffect(() => {
  //   if (transcript) {
  //     setBotState("talk");
  //     // Function to convert Base64 string to binary data (Uint8Array)
  //     const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  //       const binaryString = window.atob(base64); // Decode base64 to binary string
  //       const len = binaryString.length;
  //       const bytes = new Uint8Array(len);
  //       for (let i = 0; i < len; i++) {
  //         bytes[i] = binaryString.charCodeAt(i);
  //       }
  //       return bytes.buffer;
  //     };
  //     if (transcript.contentType === "audio/mp3") {
  //       // Convert the base64 data to an ArrayBuffer
  //       const audioArrayBuffer = base64ToArrayBuffer(transcript.data);
  //       // Create a Blob from the ArrayBuffer
  //       const audioBlob = new Blob([audioArrayBuffer], { type: "audio/mp3" });
  //       const audioUrl = URL.createObjectURL(audioBlob);
  //       const audio = new Audio(audioUrl);
  //       // Play the audio
  //       // Wait for 2 seconds before playing the audio
  //       setTimeout(() => {
  //         audio.play().catch((error) => {
  //           console.error("Audio play failed:", error);
  //         });
  //       }, 1000); // 2000 milliseconds = 2 seconds
  //       // Detect when the audio finishes playing
  //       audio.addEventListener("ended", () => {
  //         console.log("Audio finished playing");
  //         setBotState("idle"); // Update bot state when audio ends
  //         setTranscript(undefined); // Optionally reset transcript
  //       });
  //       // Cleanup the URL when the component is unmounted or transcript changes
  //       return () => {
  //         if (audioUrl) {
  //           URL.revokeObjectURL(audioUrl);
  //           audio.removeEventListener("ended", () => {
  //             console.log("Cleanup");
  //           });
  //         }
  //       };
  //     } else {
  //       console.error("Unsupported audio type:", transcript.contentType);
  //     }
  //   }
  // }, [transcript]);


  // useEffect(() => {
  //     if (activeButton === 2) {
  //         console.log("activeButton is 2, turning on microphone...");
  //         handleRecording();
  //         // openCamera();
  //     }
  // }, [activeButton]);

  //  const handleToggleRecording = () => {
  //   if (!isRecording) {
  //     handleRecording();
  //   }
  //   };

  // const changeTab = (index: SetStateAction<number>) => {
  //     console.log("changing tab")
  //     setTab(index)
  // };

  return (
    <div className="flex items-center w-full p-4 bg-primary rounded-2xl shadow-md">
      {/* <input
        type="text"
        placeholder={text}
        className="flex-grow px-4 py-2 mr-4 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      /> */}
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            // Handle the enter key press here
            console.log("User entered:", inputText);
            handleSendText(inputText);

            setInputText(""); // Clear the input after submission
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

  )
}

export default ChatBox;