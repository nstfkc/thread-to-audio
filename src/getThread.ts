import { Client } from "twitter-api-sdk";

const bearerToken =
  "AAAAAAAAAAAAAAAAAAAAAFRdiAEAAAAAZ23TjegrA5EFuZnssyjsHULFowo%3D6wICUC5zU4IKUZFke77mZRPGsL0WSZfjZPcN6tsr7GHIPaIt5T";

const client = new Client(bearerToken);

export async function getThread(threadId: string) {
  console.log("Fetching thread with threadId:", threadId);
  try {
    const mainTweet = await client.tweets.findTweetById(threadId, {
      "user.fields": ["username"],
      "tweet.fields": ["author_id", "conversation_id", "entities"],
    });

    const { author_id, conversation_id } = mainTweet.data!;

    const user = await client.users.findUserById(String(author_id), {
      "user.fields": ["profile_image_url"],
    });

    const { username } = user.data!;

    const query = `conversation_id:${conversation_id} from:${username} to:${username}`;

    const response = await client.tweets.tweetsRecentSearch({
      query,
      "tweet.fields": [
        "in_reply_to_user_id",
        "author_id",
        "created_at",
        "conversation_id",
        "entities",
      ],
      max_results: 99,
    });

    const result = {
      user: user.data!,
      mainTweet: mainTweet.data!,
      thread: response.data!,
    };

    return result;
  } catch (err) {
    console.log(err);
  }
}
