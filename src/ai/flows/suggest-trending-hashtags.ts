
'use server';

/**
 * @fileOverview Suggests trending hashtags to be included in posts using AI.
 *
 * - suggestTrendingHashtags - A function that suggests trending hashtags.
 * - SuggestTrendingHashtagsInput - The input type for the suggestTrendingHashtags function.
 * - SuggestTrendingHashtagsOutput - The return type for the suggestTrendingHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrendingHashtagsInputSchema = z.object({
  postContent: z
    .string()
    .describe('The content of the post for which to suggest hashtags.'),
  hashtagPurpose: z.string().optional().describe('The purpose or context of a new hashtag being created.'),
});
export type SuggestTrendingHashtagsInput = z.infer<
  typeof SuggestTrendingHashtagsInputSchema
>;

const SuggestTrendingHashtagsOutputSchema = z.object({
  hashtags: z
    .array(z.string())
    .describe('An array of suggested trending hashtags.'),
});
export type SuggestTrendingHashtagsOutput = z.infer<
  typeof SuggestTrendingHashtagsOutputSchema
>;

export async function suggestTrendingHashtags(
  postContent: string,
  hashtagPurpose?: string
): Promise<SuggestTrendingHashtagsOutput> {
  const input: SuggestTrendingHashtagsInput = { postContent, hashtagPurpose };
  return suggestTrendingHashtagsFlow(input);
}


const suggestTrendingHashtagsPrompt = ai.definePrompt({
  name: 'suggestTrendingHashtagsPrompt',
  input: {schema: SuggestTrendingHashtagsInputSchema},
  output: {schema: SuggestTrendingHashtagsOutputSchema},
  prompt: `Suggest trending hashtags related to the following post content:\n\n{{postContent}}\n\n{{#if hashtagPurpose}}The user has provided a purpose for a new hashtag: {{hashtagPurpose}}{{/if}}\n\nReturn ONLY an array of strings.`,
});

const suggestTrendingHashtagsFlow = ai.defineFlow(
  {
    name: 'suggestTrendingHashtagsFlow',
    inputSchema: SuggestTrendingHashtagsInputSchema,
    outputSchema: SuggestTrendingHashtagsOutputSchema,
  },
  async input => {
    const {output} = await suggestTrendingHashtagsPrompt(input);
    return output!;
  }
);

    