import { FilterCondition } from "./Filter";
import { SearchOptions } from "./SearchOptions";

export interface SearchEngine<T> {

    addItemToIndex(item: T): Promise<void>;
    removeItemFromIndex(id: string): Promise<void>;
    bulkIndex(items: T[]): Promise<void>;
    search(query: string, filters?: FilterCondition[], options?: SearchOptions): Promise<T[]>
    setFilterableField(fields: string[]): Promise<void>;
    clear(): Promise<void>;

}


