export function guard(value: string): string {
  if (value === '') return 'empty'

  return value
}
