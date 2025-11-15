type Subscriber = {
  userId: string;
  send: (data: any) => void;
};

const subscribers: Subscriber[] = [];

export function subscribe(userId: string, send: (data: any) => void) {
  subscribers.push({ userId, send });
  return () => {
    const idx = subscribers.findIndex((s) => s.userId === userId && s.send === send);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}

export function publish(userId: string, data: any) {
  subscribers.forEach((s) => {
    if (s.userId === userId) s.send(data);
  });
}
