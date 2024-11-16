export const formatTimezoneOffset = (timezone: string): string | undefined => {
  return Intl.DateTimeFormat(undefined, { timeZone: timezone, timeZoneName: "shortOffset" })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value
}
