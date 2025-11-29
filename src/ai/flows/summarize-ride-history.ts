'use server';

/**
 * @fileOverview Summarizes user ride history, providing key statistics such as total distance traveled and average fare.
 *
 * - summarizeRideHistory - A function that handles the summarization of ride history.
 * - SummarizeRideHistoryInput - The input type for the summarizeRideHistory function.
 * - SummarizeRideHistoryOutput - The return type for the summarizeRideHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRideHistoryInputSchema = z.object({
  rideHistory: z.array(
    z.object({
      distance: z.number().describe('The distance of the ride in kilometers.'),
      fare: z.number().describe('The fare of the ride in USD.'),
    })
  ).describe('An array of ride objects, each containing the distance and fare of the ride.'),
});
export type SummarizeRideHistoryInput = z.infer<typeof SummarizeRideHistoryInputSchema>;

const SummarizeRideHistoryOutputSchema = z.object({
  totalDistance: z.number().describe('The total distance traveled in kilometers.'),
  averageFare: z.number().describe('The average fare of all rides in USD.'),
  rideCount: z.number().describe('The total number of rides.'),
  summary: z.string().describe('A summary of the ride history, including total distance, average fare, and total rides.'),
});
export type SummarizeRideHistoryOutput = z.infer<typeof SummarizeRideHistoryOutputSchema>;

export async function summarizeRideHistory(input: SummarizeRideHistoryInput): Promise<SummarizeRideHistoryOutput> {
  return summarizeRideHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRideHistoryPrompt',
  input: {schema: SummarizeRideHistoryInputSchema},
  output: {schema: SummarizeRideHistoryOutputSchema},
  prompt: `You are an AI assistant that summarizes ride history for users.

  Given the following ride history, calculate the total distance traveled, the average fare, and the total number of rides.  Then provide a short summary of the ride history.

  Ride History: {{rideHistory}}

  Summary: `,
});

const summarizeRideHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeRideHistoryFlow',
    inputSchema: SummarizeRideHistoryInputSchema,
    outputSchema: SummarizeRideHistoryOutputSchema,
  },
  async input => {
    const totalDistance = input.rideHistory.reduce((sum, ride) => sum + ride.distance, 0);
    const totalFare = input.rideHistory.reduce((sum, ride) => sum + ride.fare, 0);
    const rideCount = input.rideHistory.length;
    const averageFare = rideCount > 0 ? totalFare / rideCount : 0;

    const promptResult = await prompt({
      ...input,
    });

    const summary = `Total distance traveled: ${totalDistance.toFixed(2)} km, Average fare: $${averageFare.toFixed(2)}, Total rides: ${rideCount}`

    return {
      totalDistance,
      averageFare,
      rideCount,
      summary: promptResult.output?.summary || summary,
    };
  }
);
