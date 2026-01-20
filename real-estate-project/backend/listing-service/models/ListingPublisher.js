import amqp from 'amqplib';
import 'dotenv/config.js'; 

export class ListingPublisher {
  static rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost'; 
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

  static async publish(queue, data) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
          persistent: true
    });

  }

  static async publishCreated(listing) {
    await this.publish('listing_created', listing);
  }

  static async publishUpdated(listing) {
    await this.publish('listing_updated', listing);
  }

  static async publishDeleted(listingId) {
    await this.publish('listing_deleted', { id: listingId });
  }

  static async close() {
    if (this.conn) {
      await this.channel.close();
      await this.conn.close();
      this.conn = null;
      this.channel = null;
    }
  }
}

