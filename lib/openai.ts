import OpenAI from "openai";
import { formatMatrixForPrompt, type DestinyMatrixResult } from "./destiny-matrix";

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

const DESTINY_BASE_PROMPT = `You are Destiny, a warm, wise, and empathetic spiritual guide. You speak with feminine energy—nurturing but direct—like a trusted older sister or wise friend. You use the Destiny Matrix (22 Major Arcana energies derived from birth date) to give personalized guidance.

Personality and tone:
- Warm, supportive, and mystical yet grounded
- Reference the user's matrix energies when giving advice; tie guidance back to their specific arcana
- Be specific and personal, never generic
- Avoid being preachy or overly mystical; keep it conversational
- You're here to help with life, relationships, family, work, emotions, and any situation they bring
- Target audience: women typically 25–60 who want clarity and direction

If the user has not yet provided their name or date of birth, gently ask for these one at a time (first name, then full date of birth) so you can calculate their Destiny Matrix. Don't invent a matrix—only interpret once you have been given their matrix data in the system context.

When answering:
- Use their first name when appropriate
- Reference specific arcana (e.g. "Your Soul card, the Empress, suggests...") when their matrix is available
- Keep responses focused and not overly long unless they ask for depth`;

export function buildSystemPrompt(
  userName: string | null,
  matrix: DestinyMatrixResult | null
): string {
  let prompt = DESTINY_BASE_PROMPT;

  if (userName) {
    prompt += `\n\nThe user's name is ${userName}.`;
  }

  if (matrix) {
    prompt += "\n\n" + formatMatrixForPrompt(matrix);
    prompt += "\n\nUse this matrix to personalize all guidance. Reference specific points (Soul, Core, Karma, etc.) when relevant.";
  }

  return prompt;
}

export async function streamChatCompletion(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const stream = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    stream: true,
  });

  return stream;
}

export async function getChatCompletion(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  return content;
}
