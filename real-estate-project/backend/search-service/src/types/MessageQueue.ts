export interface MessageQueue<T> {
  connect(url: string): Promise<void>;
  close(): Promise<void>;

  publish(queue: string, data: T): Promise<void>;

  consume(queue: string, handler: (data: T) => Promise<void>): Promise<void>;
  get(queue: string): Promise<T | null>;

  //sincroni
  ack(message: unknown, allUpTo?: boolean): void;   
  nack(message: unknown, allUpTo?: boolean, requeue?: boolean): void;

}
