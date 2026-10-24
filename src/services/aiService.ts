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
Guidelines:
1. NEVER give away the full code solution immediately unless explicitly asked.
2. Focus on the core invariant, mental model, or visualization (e.g. "Think of the stack as maintaining the boundary of...").
3. Explain the "Why" behind the data structure choice (Stack, Monotonic Queue, Two Pointers, DFS/BFS).
4. Point out subtle edge cases (e.g. empty inputs, duplicates, negative numbers, single nodes).
5. Format output with clean markdown, bold terms, and concise bullet points.`;

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
Include:
1. Key algorithmic idea (2-3 sentences).
2. Clean, well-commented C++ code using standard STL.
3. Explicit Time Complexity analysis with reason.
4. Explicit Space Complexity analysis with reason.
5. Common pitfalls / edge cases to watch out for in an interview.`;

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

