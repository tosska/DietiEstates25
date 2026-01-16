import amqp, { ChannelModel, Channel, ConsumeMessage } from 'amqplib';
import { MessageQueue } from '../types/MessageQueue';

export class MessageQueueRabbit<T> implements MessageQueue<T> {


    private urlRabbit: string;
    private conn : ChannelModel | null;
    private channel: Channel| null;
    
    constructor(urlRabbit: string) {
        this.urlRabbit = urlRabbit;
        this.conn = null; 
        this.channel = null; 
    }


    async connect(): Promise<void> {
        if (!this.isConnected()) {
            this.conn = await amqp.connect(this.urlRabbit);
            this.channel = await this.conn.createChannel();
        } else {
            throw new Error("RabbitMQ non collegato correttamente");
        }
    }

    async publish(queue: string, message: T): Promise<void> {

        this.ensureChannel();
        
        await this.channel?.assertQueue(queue, { durable: true });
        this.channel?.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });
    }


    async consume(queue: string, handler: (message: T | string) => Promise<void>): Promise<void> {
        this.ensureChannel();

        await this.channel?.assertQueue(queue, { durable: true });

        console.log(' Ascoltando la coda', queue); //da cancellare

        this.channel?.consume(queue, async (msg: ConsumeMessage | null) => {
            if (msg !== null) {
                
                const data = JSON.parse(msg.content.toString());

                try {
                    await handler(data);
                    this.channel?.ack(msg); // conferma ricezione
                } catch (err) {
                    console.error(`Errore durante la gestione del messaggio da "${queue}":`, err);
                    // Non ack = messaggio rimane in coda
                }
            }
        });
    }
    
    async get(queue: string): Promise<T | null> {
        this.ensureChannel();
        const msg = await this.channel?.get(queue);
        if (msg) {
            this.channel?.ack(msg);
            return JSON.parse(msg.content.toString()) as T;
        }
        return null;
    }

    ack(message: ConsumeMessage, allUpTo: boolean=false): void {
        this.ensureChannel();
        this.channel?.ack(message, allUpTo);
    }

    nack(message: ConsumeMessage, allUpTo: boolean=false, requeue: boolean=true): void {
        this.ensureChannel();
        this.channel?.nack(message, allUpTo, requeue);
    }

    async close(): Promise<void> {
        this.ensureChannel();
        await this.channel?.close();
        await this.conn?.close();
    }

    public isConnected(): boolean {
        return this.conn !== null && this.channel !== null;
    }

    private ensureChannel(): void {
        if (!this.channel) {
            throw new Error("RabbitMQ channel not initialized. Call connect() first.");
        }
    }



}