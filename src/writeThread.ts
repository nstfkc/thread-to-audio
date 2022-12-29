import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getThread } from "./getThread";

function parseText(text: string) {
  return text.split("\n").filter((line) => !line.includes("http"));
}

function replaceNumberedItems(text: string) {
  let output = text;
  for (let i = 0; i < 100; i++) {
    if (output.indexOf(`${i}.`) === 0) {
      console.log(`${i}. is replaced with ${i}-`);
      output = output.replace(`${i}.`, `${i}-`);
      break;
    }
    if (output.indexOf(`${i} .`) === 0) {
      console.log(`${i} . is replaced with ${i}-`);
      output = output.replace(`${i} .`, `${i}-`);
      break;
    }
  }
  return output;
}

function addFullStopToEnd(text: string) {
  if (text === "") {
    return text;
  }
  let output = text.trimEnd();
  const punctuations = [".", ":", ";", ",", "?", "!"];
  if (!punctuations.includes(output[output.length - 1])) {
    return `${output}.`;
  }
  return output;
}

function removeEmoji(text: string) {
  return text.replace(
    /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g,
    ""
  );
}

function normalizeForAudio(text: string) {
  const normalizedText = addFullStopToEnd(removeEmoji(text));
  if (text != normalizedText) {
  }
  return normalizedText;
}

type ThreadItem = {
  id: string;
  originalText: string;
  lines: string[];
  linesForAudio: string[];
  entities: {
    urls: {
      start: number;
      end: number;
      url: string;
      expanded_url: string;
      display_url: string;
      images?: {
        url: string;
        width: number;
        height: number;
      }[];
      status?: number;
      title?: string;
      description?: string;
      unwound_url?: string;
    }[];
  };
};

export interface ThreadData {
  id: string;
  user: {
    username: string;
    avatarUrl: string;
    name: string;
    bio: string;
  };
  thread: ThreadItem[];
}

export async function writeThread(threadId: string, rootDir = __dirname) {
  const result = await getThread(threadId);

  const { mainTweet, thread = [], user } = result!;

  const output: ThreadData = {
    id: mainTweet.id,
    user: {
      username: user.username,
      avatarUrl: user.profile_image_url?.replace("normal", "400x400")!,
      name: user.name,
      bio: user.description!,
    },

    thread: [
      {
        id: mainTweet.id,
        originalText: mainTweet.text,
        lines: parseText(mainTweet.text),
        linesForAudio: parseText(mainTweet.text).map(normalizeForAudio),
        entities: mainTweet.entities! as any,
      },
      ...thread.reverse().map((tweet) => {
        return {
          id: tweet.id,
          originalText: tweet.text,
          lines: parseText(tweet.text),
          linesForAudio: parseText(tweet.text).map(normalizeForAudio),
          entities: tweet.entities,
        };
      }),
      {
        id: "plug",
        originalText: "",
        lines: [
          "Thanks for watching. If you enjoyed this.",
          `Follow me on twitter @${user.username}, links are in the description.`,
        ],
        linesForAudio: [
          "Thanks for watching. If you enjoyed this.",
          `Follow me on twitter at ${user.username}, links are in the description.`,
        ],
        entities: {
          urls: thread
            .map((tweet) => {
              return tweet.entities?.urls?.filter((url) => !!url?.images);
            })
            .flat()
            .filter((item) => !!item),
        },
      },
    ],
  };

  const folderDir = join(rootDir, threadId);
  if (!existsSync(folderDir)) {
    mkdirSync(folderDir);
  }
  const fileDir = join(folderDir, "data.json");
  try {
    await writeFile(fileDir, JSON.stringify(output, null, 2));
    console.log(`data is written for ${threadId} in`);
    console.log("");
    console.log(fileDir);
  } catch (err) {
    console.log(err);
    console.log({ threadId });
  }
}
