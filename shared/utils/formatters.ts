export const truncateContent = (context: string, index: number = 20) => context.length > index ? `${context.substring(0, index)}...` : context
