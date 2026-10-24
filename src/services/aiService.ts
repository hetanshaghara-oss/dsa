export const DEFAULT_AI_MODEL = 'deepseek/deepseek-chat';
export const FALLBACK_AI_MODEL = 'openrouter/auto';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function getApiKey(overrideKey?: string): string {
  if (overrideKey && overrideKey.trim()) return overrideKey.trim();
  const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
}

export async function callOpenRouter(
  messages: ChatMessage[],
  apiKey?: string,
  model = DEFAULT_AI_MODEL
): Promise<string> {
  const key = getApiKey(apiKey);
  
  // Guard against decommissioned models like google/gemini-2.0-flash-001
  let chosenModel = model;
  if (!chosenModel || chosenModel.includes('gemini-2.0-flash-001') || chosenModel.includes('gemini-2.0-flash-exp')) {
    chosenModel = DEFAULT_AI_MODEL;
  }

  const doRequest = async (targetModel: string) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': window.location.origin || 'https://dsa30.app',
        'X-Title': 'DSA 30 Challenge',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: messages,
        temperature: 0.6,
        max_tokens: 1800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const msg = errorData?.error?.message || `API error ${response.status}: ${response.statusText}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Received empty response from AI model.');
    }
    return content;
  };

  try {
    return await doRequest(chosenModel);
  } catch (err: any) {
    // If the chosen model is no longer served or fails, automatically fallback to openrouter/auto
    if (chosenModel !== FALLBACK_AI_MODEL && (err?.message?.includes('no provider') || err?.message?.includes('not available') || err?.message?.includes('404'))) {
      return await doRequest(FALLBACK_AI_MODEL);
    }
    throw err;
  }
}

export async function generateAiHint(
  problemTitle: string,
  problemTopic: string,
  difficulty: string,
  userQuestion: string,
  apiKey?: string,
  model?: string
): Promise<string> {
  const systemPrompt = `You are an elite competitive programmer and technical interviewer specializing in C++ and Data Structures & Algorithms.
Your task is to provide intuitive, empowering, and Socratic hints for the DSA challenge problem.

Formatting & Style Requirements:
1. Organization & Spacing: Always structure your response with clear markdown headers (e.g. ### 💡 Core Intuition, ### ⚙️ Step-by-Step Blueprint, ### ⚠️ Subtle Edge Cases, ### 📐 Mathematical Complexity). Include generous blank lines between sections.
2. Mathematical Characters: Use clear mathematical notation for Big-O and variables, e.g. O(N), O(log N), O(1), O(N^2), O(V + E), and explicit math symbols (≤, ≥, ≠, →, ←, 2^N).
3. Mental Model First: Focus on the invariant, data structure choice, and visualization before full code.
4. Clean Markdown: Use concise bullet points with proper spacing for exceptional readability.`;

  const userPrompt = `Problem: "${problemTitle}"
Topic: ${problemTopic} (${difficulty})
User query / request: "${userQuestion}"

Please provide an intuitive hint and mental framework to help solve this problem.`;

  return callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], apiKey, model);
}

export async function generateAiSolution(
  problemTitle: string,
  problemTopic: string,
  difficulty: string,
  apiKey?: string,
  model?: string
): Promise<string> {
  const systemPrompt = `You are a Senior Software Engineer and DSA expert. Write clean, modern, interview-grade C++ solutions (C++20 style).

Formatting & Style Requirements:
1. Organization: Always structure your answer into these clear markdown sections:
   ### 💡 Algorithmic Approach & Invariant
   ### 💻 Optimal C++ Solution (enclosed in \`\`\`cpp ... \`\`\` block with clean comments)
   ### 📐 Mathematical Complexity Analysis
      - Time Complexity: O(...) with mathematical derivation
      - Space Complexity: O(...) with auxiliary memory breakdown
   ### ⚠️ Critical Edge Cases & Interview Tips
2. Spacing: Separate paragraphs and bullet points with double line-breaks for maximum readability.
3. Mathematical Notation: Use standard Big-O notation like O(N), O(log N), O(1), O(N^2), O(V + E), and clean math characters (≤, ≥, ≠, →).`;

  const userPrompt = `Write an optimal C++ solution and walkthrough for:
Problem: "${problemTitle}"
Topic: ${problemTopic} (${difficulty})`;

  return callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], apiKey, model);
}

export async function testAiConnection(
  apiKey?: string,
  model = DEFAULT_AI_MODEL
): Promise<{ ok: boolean; message: string }> {
  try {
    await callOpenRouter(
      [{ role: 'user', content: 'Respond with the single word "OK"' }],
      apiKey,
      model
    );
    return { ok: true, message: 'OpenRouter connection successful!' };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown connection error';
    return { ok: false, message: errorMsg };
  }
}

