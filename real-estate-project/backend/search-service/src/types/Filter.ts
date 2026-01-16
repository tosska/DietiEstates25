export type FilterCondition ={
    field: string;
    operator: '=' | '!=' | '<' | '<=' | '>' | '>=' | 'IN'; 
    value: string | number | boolean | string[];

} 