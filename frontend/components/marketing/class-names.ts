export const styles = new Proxy({} as Record<string, string>, {
  get: (_target, property: string | symbol) => String(property),
});
