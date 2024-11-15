export const EventResponseType = {
  error: "error",
  success: "success",
} as const

export type EventResponseType = (typeof EventResponseType)[keyof typeof EventResponseType]
