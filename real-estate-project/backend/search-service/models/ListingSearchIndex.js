import { MeiliSearch } from 'meilisearch';

export class ListingSearchIndex  {
  static client = null;
  static index = null;

  static async init(config = {
    host: 'http://localhost:4567',
    apiKey: '', // opzionale, se hai una chiave API
    indexName: 'listings'
  }) {
    if (!this.client) {
      this.client = new MeiliSearch({
        host: config.host,
        apiKey: config.apiKey,
      });

      await this.client.createIndex(config.indexName, { primaryKey: 'id' });
      this.index = this.client.index('listings');
      //this.index.addDocuments([{id:1, duce: {lib: 2, lib2: 2}, mimmo: {libert: 1}}, {Viva: 23}]);

    }
  }

  static async addOrUpdateListings(listings) {
    if (!this.index) throw new Error("MeiliSearch non inizializzato");
    return this.index.addDocuments([listings]);
  }

  static async deleteListing(id) {
    if (!this.index) throw new Error("MeiliSearch non inizializzato");
    return await this.index.deleteDocument(id);
  }

  static async search(query = '', options = {}) {
    if (!this.index) throw new Error("MeiliSearch non inizializzato");

    return await this.index.search(query, {
      filter: options.filter || '',
      limit: options.limit || 20,
      offset: options.offset || 0,
      sort: options.sort || [],
    });
  }

  static async clearIndex() {
    if (!this.index) throw new Error("MeiliSearch non inizializzato");
    return await this.index.deleteAllDocuments();
  }
}
