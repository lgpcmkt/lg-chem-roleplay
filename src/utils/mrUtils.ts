export function getMrTitle(name?: string): string {
  if (!name || name === '영업사원') return 'MR';
  const trimmed = name.trim();
  if (!trimmed) return 'MR';
  return `${trimmed[0]} MR`;
}
