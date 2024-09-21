// 1. Import necessary dependencies
import OpenAI from "openai"; // Assuming you have this package installed
import { OpenAI as LangchainOpenAI } from "@langchain/openai"; // Assuming Langchain is used
// import dotenv from "dotenv";

// 2. Define the response data structure
export interface ResponseData {
    data: string;
    contentType: string;
    model: string;
    status: string;
}

const api = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// if (!api) {
//   throw new Error('OPENAI_API_KEY is not set in the environment variables');
// }
// 3. Initialize the OpenAI instance (could be passed as config instead of dotenv)
const openai = new OpenAI({
    // apiKey: api,  // Make sure to pass this securely in React or as a parameter
    apiKey: api,
    dangerouslyAllowBrowser: true
});

export const sendAudioToTranscriptionAPI = async (audioBlob: Blob): Promise<ResponseData | undefined> => {
    try {
        // Check and log the actual Blob type before sending it to Whisper API
        console.log("Sending audioBlob for transcription. Blob Type:", audioBlob.type);

        // Send the audioBlob as it is (without forcing MP3)
        const response = await openai.audio.transcriptions.create({
            file: new File([audioBlob], "audio.wav"), // Using the default format provided by the browser
            model: "whisper-1", // Whisper model for transcription
            // response_format: "text",
        });
        const text = response.text;
        console.log("Whisper API Response:", text); // Inspect API response
        const audioRes = await generateResponseAndAudio(text, "gpt", "Patrick Ha");
        console.log("Audio Response:", audioRes); // Inspect API response
        return audioRes; // Return the generated response data
    } catch (error) {
        console.error("Error transcribing audio:", error);

        // Return undefined or a default value if an error occurs
        return undefined; // You could also return a default ResponseData object if necessary
    }
};


// 4. Function to create audio from text using OpenAI
// async function createAudio(fullMessage: string, voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"): Promise<string> {
//     console.log("this is resposnse message ,", fullMessage);
//     const mp3 = await openai.audio.speech.create({
//         model: "tts-1",
//         voice: voice,
//         input: fullMessage,
//     });
//     const buffer = Buffer.from(await mp3.arrayBuffer());
//     return buffer.toString('base64');  // Return the base64-encoded audio
// }
async function createAudio(fullMessage: string, voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"): Promise<string> {
    console.log("this is response message,", fullMessage);

    // Call the OpenAI API to generate the audio
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: fullMessage,
    });

    // Convert the resulting ArrayBuffer to base64
    const arrayBuffer = await mp3.arrayBuffer();
    const base64String = arrayBufferToBase64(arrayBuffer);

    return base64String;  // Return the base64-encoded audio
}

// Helper function to convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);  // Convert binary string to base64
}


// 5. Function to simulate generating responses from various models (OpenAI, Langchain, Ollama, etc.)
export async function generateResponseAndAudio(message: string, modelName: string = "gpt", userName: string): Promise<ResponseData> {

    const contact = {
        "Ben": "0x9876...5432",
        "Nick": "0xabcd...ef01",
        "Bob": "0x1234...5678",
    };

    const wallet = "0x9876...5432";

    // Process the message input
    const cleanedMessage = message.toLowerCase();
    console.log("this is prompt ", cleanedMessage);
    // 6. Initialize variables for response and voice settings
    // let introMessage = "";
    let base64Audio = "";
    let voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "echo";
    let gptMessage = "";
    let fullMessage = "";

    // 6. Common prompt for all models
    const commonPrompt = `
      You are Anita, a real-life AI assistant with ability to trigger blockchain transsaction. You listen to user then create a json paylaod for server to trigger blockchain transsactions. If user promt not clear, do not return json.

      Examples:

      1. User: "Hi Anita, I'd like to send 0.5 ETH to my friend's Ben."
         Anita: {
           "action": "send",
           "currency":"ETH",
           "amount": 0.5,
           "to": "${contact["Ben"]}",
           "from": "${wallet}"
         }

      2. User: "Can you help me swap 100 USDC for ETH?"
         Anita: {
           "action": "swapTokens",
           "currency": "USDC",
           "to": "ETH",
           "amount": 100,
          "from": "${wallet}"
         }

      3. User: "I want to stake 10 ETH in the Lido protocol."
         Anita: {
           "action": "stake",
           "protocol": "Lido",
           "amount": 10,
           "currency": "ETH",
            "from": "${wallet}"
         }

      4. User: "Hey, I want to... um, maybe send some..."
         Anita: I apologize, but I couldn't understand your request clearly. Could you please provide more details about what you'd like to do? For example, if you want to send cryptocurrency, please specify the amount, the type of currency, and the recipient.

        ##
      5. User: ${cleanedMessage}
         Anita: 
        ##
      `;

    let response = "";
    // 8. Handle different model cases
    if (modelName === "gpt") {
        const llm = new LangchainOpenAI({
            openAIApiKey: api, // Use your OpenAI API Key here
            modelName: 'gpt-4o-mini'
        });
        gptMessage = await llm.invoke(commonPrompt);  // Invoke the model with the prompt
        console.log("this is Anita raw response , ",gptMessage);
        let jsonResponse = gptMessage.match(/\{[\s\S]*\}/);
        if (jsonResponse) {
            console.log("this is JSON TRIGGER FOR SERVER ", jsonResponse[0]);
            // let server process transactions

            // then return success
            response = "Great news! Your request has been successfully executed. Is there anything else I can help you with today?";
            // gptMessage = jsonMatch[0];
        } else {
            // json response error so promt AI to return somethings ......
            console.error("No JSON found in the response");
            response = "I apologize, but it seems there was an issue processing your request. The transaction has been declined";
            // gptMessage = "{}";  // Fallback to empty JSON if no match found
        }
        // introMessage = "Anita here, ";
        voice = "nova";  // Set the voice for OpenAI's speech API
    }
    // Add other model handling (like Mistral, Llama, etc.) as needed

    // waiting transsaction

    // trigger AI to promt "excecuting"

    // if success trigger somethings else

    // 
    // fullMessage = `${gptMessage}`;
    fullMessage = response;
    base64Audio = await createAudio(fullMessage, voice);

    // 10. Return the simulated response with audio
    return {
        data: base64Audio,
        contentType: 'audio/mp3',
        model: modelName,
        status: "pending"
    };
}

