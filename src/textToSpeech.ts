import { config } from "dotenv";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

config();

const client = new TextToSpeechClient();

async function textToSpeech(text: string) {
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "MALE" },
    audioConfig: { audioEncoding: "MP3" },
  });

  return response.audioContent;
}

export default textToSpeech;
