import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const RegisterSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid university email'),
  uni_reg_no: z.string().min(3, 'University registration number is required'),
  phone: z.string().min(7, 'Please enter a valid phone number').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const CompleteProfileSchema = z.object({
  uni_reg_no: z.string().min(3, 'University registration number is required'),
  phone: z.string().min(7, 'Please enter a valid phone number').optional().or(z.literal('')),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type CompleteProfileInput = z.infer<typeof CompleteProfileSchema>
