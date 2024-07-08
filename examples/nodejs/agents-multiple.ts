/*
This is a more advanced example of a functional agent script that generates tweets about climate change. 
The script uses three agents: a writer agent, an evaluator agent, and a re-writer agent.

* The `writeTweet` agent generates tweets about climate change, 
* The `shouldImprove` agent evaluates the tweets based on specific criteria.
* The `rewriteTwetet` agent rewrites the tweet if a tweet needs improvement, based on the evaluator's feedback.

The script continues this process until all tweets meet the required criteria.

SAMPLE OUTPUT FROM THE SCRIPT

Checking stop condition...
TOP OF LOOP REACHED
Writing tweet at index 0
Tweet at index 1 written.
Writing tweet at index 1
Tweet at index 2 written.
Writing tweet at index 2
Tweet at index 3 written.
Evaluating tweet at index 0.
Tweet: Climate change is not a hoax. It is a real and urgent threat to our planet. We need to take action now to protect our environment and future generations. #ClimateChange #ActOnClimate 🌍🌿🌞
Tweet at index 0 needs improvement.
Feedback: The tweet is informative and highlights the seriousness of climate change but it is not humor-based which is one of the criteria. The tweet should ideally contain a funny or light-hearted mention related to climate change that is also thought-provoking and engaging for readers..
Evaluating tweet at index 1.
Tweet: Climate change is not a problem for future generations to solve - it is happening now. We need to take action to reduce our carbon footprint and protect the planet for future generations. #climatechange #ActNow
Tweet at index 1 is good.
Evaluating tweet at index 2.
Tweet: Climate change is real and it's happening now. We need to take action to protect our planet and ensure a sustainable future for generations to come. #ActOnClimate #ClimateChangeAwareness 🌍🌿
Tweet at index 2 needs improvement.
Feedback: While the tweet does address climate change, it lack the funny tone that we are looking for. It is also a bit generic and lacks originality..
Rewriting tweet at index 0
Rewriting tweet at index 2
Checking stop condition...
TOP OF LOOP REACHED
Evaluating tweet at index 0.
Tweet: "Whoever said climate change is a hoax clearly hasn't stepped outside lately. Let's work together to save our planet and show Mother Nature we care! 🌍💚☀️ #ClimateChange #SaveThePlanet"
Tweet at index 0 is good.
Evaluating tweet at index 2.
Tweet: "Climate change is like that annoying ex who just won't go away... But seriously, let's step up and save our planet for the future! #GreenHumor #SaveThePlanet 🌍🌿"
Tweet at index 2 is good.
Checking stop condition...
All tweets written. Here are the tweets:

"Whoever said climate change is a hoax clearly hasn't stepped outside lately. Let's work together to save our planet and show Mother Nature we care! 🌍💚☀️ #ClimateChange #SaveThePlanet"


Climate change is not a problem for future generations to solve - it is happening now. We need to take action to reduce our carbon footprint and protect the planet for future generations. #climatechange #ActNow


"Climate change is like that annoying ex who just won't go away... But seriously, let's step up and save our planet for the future! #GreenHumor #SaveThePlanet 🌍🌿"
*/



// ======================= BEGIN PROGRAM =======================

import { config } from 'dotenv';
import chalk from "chalk";
config();
import { Chat, ChatTypes } from "ragged"

type Tool = ChatTypes['Tool'];

// this is where we store the tweets. This is the shared workspace for the agents.
type TweetHolder = {
    tweet: string,
    shouldImprove: boolean,
    feedback: string
}


/**
 * The agent that evaluates the tweet based on specific criteria. If the tweet needs improvement, 
 * the agent provides feedback on how the tweet can be improved. This feedback is then used by
 * the rewriteTweet agent to rewrite the tweet.
 * 
 * This agent always returns undefined. It does not return any value to the caller.
 * Instead, it directly modifies the tweet store.
 * 
 * @param tweet 
 */
const shouldImprove = async (tweet: TweetHolder): Promise<void> => {
    const evaluationCriteria = `
    The tweet should be funny and about climate change. It should avoid any potentially 
    triggering or sensitive topics. It should be geared towards a general audience and 
    should not contain any technical jargon. The tweet should be concise and easy to 
    understand. It should be engaging and thought-provoking. It should be original and 
    not a copy of any existing tweets. It should be free of grammatical errors and typos. 
    It should be respectful and not contain any offensive language or content. It should 
    be relevant to the topic of climate change and should not contain any irrelevant information. 
    It should be positive and not contain any negative or pessimistic statements. 
    It should be creative and not contain any cliches or overused phrases. It should be 
    informative and not contain any false or misleading information. It should be well-structured
    and not contain any run-on sentences or fragments. It should be visually appealing and 
    not contain any excessive punctuation or emojis. It should be engaging and not contain any 
    boring or uninteresting content. It should be relatable and not contain any obscure or esoteric references. 
    It should be inspiring and not contain any discouraging or disheartening statements.
`;

    const c = Chat.with({
        provider: "openai",
        config: { apiKey: process.env.OPENAI_API_KEY }
    });
    c.record(false);

    const tool: Tool = {
        id: "evaluate-tweet",
        description: `
            When you have evaluated a tweet, use this tool to indicate whether 
            the tweet should be rewritten, and any relevant feedback. The tool 
            will store the evaluation of the tweet so that the writer agent can
            use it to improve the tweet.
        `,
        props: {
            type: "object",
            props: {
                shouldImprove: {
                    type: "boolean",
                    description: "Indicates whether the tweet should be rewritten. If true, the writer agent will rewrite the tweet. If false, the tweet will be deemed to be acceptable and no further improvements will be made on it.",
                    required: true
                },
                feedback: {
                    type: "string",
                    description: "Feedback on how the tweet can be improved. This will be used by the writer agent to improve the tweet.",
                    required: true
                }
            }
        },
        handler: async (input) => {
            try {
                const { shouldImprove, feedback } = JSON.parse(input);

                if (typeof shouldImprove !== "boolean") {
                    throw new Error("shouldImprove must be a boolean.");
                }

                if (typeof feedback !== "string") {
                    throw new Error("feedback must be a string.");
                }

                // store the evaluation
                tweet.feedback = feedback;
                tweet.shouldImprove = shouldImprove;

                return "The evaluation was successfully stored."
            } catch (e) {
                console.error("Tweet evaluator encountered an error.", e);
                return "Encountered an error. Skipping evaluation. Do not retry.";
            }
        }
    }

    await c.chat([
        {
            type: "system",
            text: `
                # Instructions

                Please evaluate the tweet according to the following criteria.
                Use the evalueate-tweet tool to indicate whether the tweet should
                be rewritten, and any relevant feedback.

                # Criteria

                ${evaluationCriteria}
            `
        },
        {
            type: "user",
            text: `
                Evaluate the following tweet:
        
                ${tweet.tweet}
            `
        }
    ],
        {
            tools: [tool],
            model: "gpt-4"
        }
    );
}

/**
 * The agent that generates a tweet about climate change. This agent is responsible for
 * generating the initial tweet that will be evaluated and potentially rewritten by the
 * other agents.
 * 
 * @returns  The generated tweet.
 */
const writeTweet = async (): Promise<string> => {
    const c = Chat.with({
        provider: "openai",
        config: { apiKey: process.env.OPENAI_API_KEY }
    });
    c.record(false);

    const result = await c.chat(`Write a tweet about climate change.`);

    const tweet = result.history.at(-1)?.text;

    if (!tweet) {
        throw new Error("Failed to generate tweet.")
    }

    return tweet;
}

/**
 * The agent that rewrites the tweet based on the feedback provided by the evaluator agent.
 * This agent takes the feedback and rewrites the tweet to improve it based on the feedback.
 * 
 * @param tweet 
 * @returns 
 */
const rewriteTweet = async (tweet: TweetHolder): Promise<string> => {
    const c = Chat.with({
        provider: "openai",
        config: { apiKey: process.env.OPENAI_API_KEY }
    });
    c.record(false);

    const result = await c.chat(`
        # Instructions
        
        You will rewrite the following tweet. Make sure to improve the tweet based on the feedback provided.

        ----------------------------- START: The tweet to be rewritten -----------------------------

        ${tweet.tweet}

        ----------------------------- END: The tweet to be rewritten -----------------------------

        ----------------------------- START: Feedback -----------------------------

        ${tweet.feedback}

        ----------------------------- END: Feedback -----------------------------
    `)

    const rewrittenTweet = result.history.at(-1)?.text;

    if (!rewrittenTweet) {
        throw new Error("Failed to rewrite tweet.")
    }

    return rewrittenTweet
}

/**
 * Helper function to log messages to the console with color.
 * 
 * @param text 
 * @param color 
 */
const log = (text: string, color: keyof typeof chalk = "green") => {
    const func: any = chalk[color];

    // if callable, call it
    if (typeof func === "function") {
        console.log(func(text))
    } else {
        throw new Error("Invalid color " + color + ".")
    }
}

// STATE & CONFIGURATION

const MAX_TWEETS = 3;
const tweets: TweetHolder[] = [];

/**
 * Checks if the stop condition has been reached. The stop condition is reached when
 * the number of tweets generated is equal to or greater than the desired number of tweets,
 * 
 * @param tweets 
 * @returns 
 */
const stopConditionReached = (tweets: TweetHolder[], targetLength: number) => {
    log(`Checking stop condition...`)
    const hasEnoughTweets = tweets.length >= targetLength;
    const hasEnoughGoodTweets = tweets.filter(t => !t.shouldImprove).length >= targetLength;
    return hasEnoughTweets && hasEnoughGoodTweets;
}

/**
 * Main loop that generates tweets, evaluates them, and rewrites them until the stop condition is reached.
 */
while (!(stopConditionReached(tweets, MAX_TWEETS))) {
    log(`TOP OF LOOP REACHED`);

    // fill the tweet store with tweets
    while (tweets.length < MAX_TWEETS) {
        log(`Writing tweet at index ${tweets.length}`)
        const tweet = await writeTweet();
        tweets.push({ tweet, shouldImprove: true, feedback: "" });
        log(`Tweet at index ${tweets.length} written.`)
    }

    // Evaluation loop
    for (let i = 0; i < MAX_TWEETS; i++) {
        if (!tweets[i].shouldImprove) {
            continue;
        }

        log(`Evaluating tweet at index ${i}.`)
        log(`Tweet: ${tweets[i].tweet}`, 'whiteBright')
        await shouldImprove(tweets[i]);

        if (tweets[i].shouldImprove) {
            log(`Tweet at index ${i} needs improvement.`)
            log(`Feedback: ${tweets[i].feedback}.`, 'yellow')
        } else {
            log(`Tweet at index ${i} is good.`, 'red')
        }
    }

    // Rewrite loop
    for (let i = 0; i < MAX_TWEETS; i++) {
        if (!tweets[i].shouldImprove) {
            continue;
        }

        log(`Rewriting tweet at index ${i}`)
        const rewrittenTweet = await rewriteTweet(tweets[i]);
        tweets[i].tweet = rewrittenTweet;
    }


}

// all done
log(`All tweets written. Here are the tweets:`)
tweets.forEach((tweet) => {
    log(`\n${tweet.tweet}\n`, 'cyan')
})
log(`All tweets written. Exiting.`)
