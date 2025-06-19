import amqp from 'amqplib';

export class ListingConsumer {

  static rabbitUrl = 'amqp://localhost';
  static conn = null;
  static channel = null;

  static async init() {
    if (!this.conn) {
      this.conn = await amqp.connect(this.rabbitUrl);
      this.channel = await this.conn.createChannel();
    } else {
      throw new Error("RabbitMQ non collegato correttamente");
    }
  }

  static async consume(queue, handler) {
    await this.channel.assertQueue(queue, { durable: true });

    console.log(' Ascoltando la coda', queue);

    this.channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        try {
          await handler(data);
          this.channel.ack(msg); // conferma ricezione
        } catch (err) {
          console.error(`Errore durante la gestione del messaggio da "${queue}":`, err);
          // Non ack = messaggio rimane in coda
        }
      }
    });
  }

  static async listenAll({ onCreate, onUpdate, onDelete }) {
    if (onCreate) await this.consume('listing_created', onCreate);
    if (onUpdate) await this.consume('listing_updated', onUpdate);
    if (onDelete) await this.consume('listing_deleted', onDelete);
  }

  static async close() {
    await this.channel.close();
    await this.conn.close();
  }
}
