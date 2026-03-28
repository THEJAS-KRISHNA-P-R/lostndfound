import { z } from 'zod'

export const PostItemSchema = z.object({
  type: z.enum(['lost', 'found']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  category_id: z.number().int().positive('Please select a category'),
  description: z.string().max(1000, 'Description too long').optional(),
  location: z.string().min(2, 'Please enter a location'),
  date_occurred: z.string().min(1, 'Please enter the date'),
  time_occurred: z.string().optional(),
  private_details: z.string().max(500, 'Private details too long').optional(),
  images: z.array(z.string()).max(4, 'Maximum 4 images').default([]),
})

export type PostItemInput = z.infer<typeof PostItemSchema>
