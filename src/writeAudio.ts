import { getAudioDurationInSeconds } from "get-audio-duration";
import { readFile, writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

import textToSpeech from "./textToSpeech";

import { ThreadData } from "./writeThread";

export async function writeAudio(
  threadId: string,
  dir = __dirname,
  overwrite = false
) {
  const outputDir = join(dir, threadId);
  const audioDir = join(outputDir, "audio");
  if (!existsSync(audioDir)) {
    mkdirSync(audioDir);
  }
  const rawData = await readFile(join(outputDir, "data.json"));

  const data = JSON.parse(rawData.toString()) as ThreadData;

  const durations: Record<string, number> = {};

  for (const tweet of data.thread) {
    const filePath = join(audioDir, `${tweet.id}.mp3`);

    if (!existsSync(filePath) || overwrite) {
      const audioContent = await textToSpeech(
        tweet.linesForAudio.filter((line) => line !== "").join("\n")
      );
      if (audioContent) {
        try {
          await writeFile(filePath, audioContent);
          console.log("Audio file is succesfully created for", tweet.id);
        } catch (err) {
          console.log("Failed to write audio file for", tweet.id);
          console.log(err);
        }
      }
    }
    const audioDuration = await getAudioDurationInSeconds(filePath);

    durations[tweet.id] = Math.ceil(audioDuration);
    if (tweet.id === "plug") {
      durations[tweet.id] = durations[tweet.id] + 2;
    }
  }

  await writeFile(
    join(audioDir, "durations.json"),
    JSON.stringify(durations, null, 2)
  );
}
