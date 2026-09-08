const pending = new Map<string, Promise<void>>();
export async function lockOrder(id: string) {
  const previous = pending.get(id) || Promise.resolve();
  let unlock!: () => void;
  const current = new Promise<void>((resolve) => {
    unlock = resolve;
  });
  pending.set(id, current);
  await previous;
  return () => {
    unlock();
    if (pending.get(id) === current) pending.delete(id);
  };
}
