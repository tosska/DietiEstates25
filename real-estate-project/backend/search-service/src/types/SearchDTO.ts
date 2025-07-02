import { FilterCondition } from "./Filter";
import { SearchOptions } from "./SearchOptions";

export interface SearchDTO {
    query: string;
    filters?: FilterCondition[];
    options?: SearchOptions;
}