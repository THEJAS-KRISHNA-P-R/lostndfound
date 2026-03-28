import { z } from 'zod'

export const ClaimSchema = z.object({
  description: z
    .string()
    .min(50, 'Please provide at least 50 characters describing why this item is yours')
    .max(2000, 'Description too long'),
  proof_images: z.array(z.string()).max(3, 'Maximum 3 proof images').default([]),
})

export type ClaimInput = z.infer<typeof ClaimSchema>
