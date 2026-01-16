import { Index, MeiliSearch, RecordAny, SearchParams} from 'meilisearch';
import { SearchEngine } from '../types/SearchEngine';
import { SearchOptions } from '../types/SearchOptions';
import { FilterCondition } from '../types/Filter';

export class MeiliSearchEngine<T extends RecordAny> implements SearchEngine<T> { 
  private client: MeiliSearch;
  private index: Index;

  constructor(client: MeiliSearch, index: Index){
    this.client=client;
    this.index=index;
  }

  static async create<T extends RecordAny>(host: string, apiKey: string = '', indexName: string, pk?: string) 
  : Promise<MeiliSearchEngine<T>> {
    
    const client = new MeiliSearch({ host, apiKey });

    try {
      await client.getIndex(indexName);
    } catch {
      await client.createIndex(indexName, { primaryKey: pk });
    }

    const index = client.index(indexName);

    return new MeiliSearchEngine<T>(client, index);
  }
  

  async addItemToIndex(item: T): Promise<void> {
    await this.index.addDocuments([item]);
  }

  async removeItemFromIndex(id: string): Promise<void> {
    await this.index.deleteDocument(id);
  }

  async bulkIndex(items: T[]): Promise<void> {
    await this.index.addDocuments(items);
  }

  async search(query: string = '', filters?: FilterCondition[], options?: SearchOptions): Promise<T[]> {

    const filtersString = filters ? this.buildFiltersToString(filters) : [];

    //AGGIUNGERE SORT
    const tempSort = options?.sortBy && options?.sortOrder
        ? [`${options.sortBy}:${options.sortOrder}`]
        : [''];

      const searchParams: SearchParams = {
        filter: filtersString,
        limit: options?.limit ?? 20,
      };

    const result = await this.index.search(query, searchParams)
      
    return (result.hits ?? []).map(hit => {
      const { _formatted, _matchesPosition, ...data } = hit;
      return data as T;
    });
  }

  async setFilterableField(fields: string[]): Promise<void> {
    await this.index.updateFilterableAttributes(fields);
  }

  async clear(): Promise<void> {
    await this.index.deleteAllDocuments();
  }

  private buildFiltersToString(filters: FilterCondition[]): string[] {

    const arrayFiltersString: string[] = [];

    filters.forEach(filter => {

        let finalValue = filter.value;
        if (Array.isArray(filter.value)) {
            finalValue = JSON.stringify(filter.value); 
        } 
        else if (typeof filter.value === 'string') {
            finalValue = `"${filter.value}"`;
        }
      arrayFiltersString.push(`${filter.field} ${filter.operator} ${finalValue}`);
    });
    console.log("PROVA")
    console.log(arrayFiltersString);
    return arrayFiltersString;
  }

}

