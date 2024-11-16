export const ActionResponseType = {
  error: "error",
  success: "success",
} as const

export type ActionResponseType = (typeof ActionResponseType)[keyof typeof ActionResponseType]

export type ActionResponse =
  | {
      type: typeof ActionResponseType.error
      message: string
    }
  | { type: typeof ActionResponseType.success }
