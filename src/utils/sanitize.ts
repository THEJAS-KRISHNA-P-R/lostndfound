/**
 * Simple sanitization utility to prevent basic XSS attacks.
 * Strips common HTML tags and script elements from user-provided strings.
 */
export function sanitize(text: string | null | undefined): string {
  if (!text) return ''
  
  return text
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '') // Remove <script> tags
    .replace(/on\w+="[^"]*"/gim, '') // Remove inline event handlers like onclick
    .replace(/javascript:[^"']*/gim, '') // Remove javascript: pseudo-protocol
    .replace(/<\/?[^>]+(>|$)/g, '') // Strip remaining HTML tags
    .trim()
}
