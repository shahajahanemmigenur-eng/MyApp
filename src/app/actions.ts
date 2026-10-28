
'use server';

import {
  suggestTrendingHashtags as suggestTrendingHashtagsFlow,
  type SuggestTrendingHashtagsInput,
  type SuggestTrendingHashtagsOutput,
} from '@/ai/flows/suggest-trending-hashtags';

export async function getHashtagSuggestions(
  postContent: string,
  hashtagPurpose?: string
): Promise<SuggestTrendingHashtagsOutput> {
  if (!postContent) {
    return { hashtags: [] };
  }
  try {
    const input: SuggestTrendingHashtagsInput = { postContent, hashtagPurpose };
    const result = await suggestTrendingHashtagsFlow(input);
    return result;
  } catch (error) {
    console.error('Error getting hashtag suggestions:', error);
    // In a real app, you'd want more robust error handling/logging
    return { hashtags: [] };
  }
}

    