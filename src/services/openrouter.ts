import type { DMContext, LinkedInPost, Tone } from "../types";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL;

export async function generateComment(post: LinkedInPost, tone: Tone): Promise<string> {
    const replySection = post.replyTo
        ? `\nReplying to a comment by ${post.replyTo.name}:\n${post.replyTo.comment}\n\nWrite a reply to their comment, not a top-level comment.\n`
        : '';

    const prompt = `
      Post Author:
      ${post.author}

      Post Content:
      ${post.content}
      ${replySection}

      Desired Tone:
      ${tone}

      Instructions:

      * Write a LinkedIn comment in the requested tone.
      * Match the language of the post content — if the post is in Spanish, reply in Spanish, etc.
      * Keep it concise (under 80 words).
      * Add value to the discussion.
      * Avoid generic praise.
      * Avoid emojis.
      * Sound natural and human.
      * Return only the comment text.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [{ role: "user", content: prompt }],
        })
    });
    const data = await response.json();
    return data.choices?.[0]?.message.content ?? "No comment generated. Please try again.";
}

export async function generateMessage(dm: DMContext, tone: Tone): Promise<string> {
    const conversation = dm.conversation.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `
      Send a LinkedIn DM to ${dm.recipient},
      Tone: ${tone}
      Conversation history:
      ${conversation}
      
      Instructions:
      * Write a LinkedIn DM in the requested tone.
      * Keep it concise (under 80 words).
      * Continue the conversation naturally.
      * Avoid generic praise.
      * Avoid emojis.
      * Sound natural and human not robotic.
      * Return only the message text.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [{ role: "user", content: prompt }],
        })
    });
    const data = await response.json();
    return data.choices?.[0]?.message.content ?? "No message generated. Please try again.";
}