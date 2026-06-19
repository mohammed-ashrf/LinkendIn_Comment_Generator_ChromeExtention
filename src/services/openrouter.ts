import type { LinkedInPost, Tone } from "../types";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL;

export async function generateComment(post: LinkedInPost, tone: Tone): Promise<string> {
    const prompt = `
Post Author:
${post.author}

Post Content:
${post.content}

Desired Tone:
${tone}

Instructions:

* Write a LinkedIn comment in the requested tone.
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