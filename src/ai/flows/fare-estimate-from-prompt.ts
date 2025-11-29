'use server';

/**
 * @fileOverview A fare estimation AI agent that estimates the fare based on a natural language description of the desired ride.
 *
 * - estimateFareFromPrompt - A function that handles the fare estimation process.
 * - FareEstimateFromPromptInput - The input type for the estimateFareFromPrompt function.
 * - FareEstimateFromPromptOutput - The return type for the estimateFareFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FareEstimateFromPromptInputSchema = z.object({
  rideDescription: z.string().describe('A natural language description of the desired ride.'),
});
export type FareEstimateFromPromptInput = z.infer<typeof FareEstimateFromPromptInputSchema>;

const FareEstimateFromPromptOutputSchema = z.object({
  estimatedFare: z.number().describe('The estimated fare for the ride in US dollars.'),
  reasoning: z.string().describe('The reasoning behind the estimated fare.'),
});
export type FareEstimateFromPromptOutput = z.infer<typeof FareEstimateFromPromptOutputSchema>;

export async function estimateFareFromPrompt(input: FareEstimateFromPromptInput): Promise<FareEstimateFromPromptOutput> {
  return estimateFareFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fareEstimateFromPrompt',
  input: {schema: FareEstimateFromPromptInputSchema},
  output: {schema: FareEstimateFromPromptOutputSchema},
  prompt: `You are a ride fare estimator. Estimate the fare for the ride described below.

Ride description: {{{rideDescription}}}

Consider factors such as distance, traffic, time of day, and any special requests in the ride description.
Output the estimated fare in US dollars and provide a brief explanation of your reasoning.
`,
});

const estimateFareFromPromptFlow = ai.defineFlow(
  {
    name: 'estimateFareFromPromptFlow',
    inputSchema: FareEstimateFromPromptInputSchema,
    outputSchema: FareEstimateFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
