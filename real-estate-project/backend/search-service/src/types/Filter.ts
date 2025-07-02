export type FilterCondition ={
    field: string;
    operator: '=' | '!=' | '<' | '<=' | '>' | '>='; // puoi estendere con altri operatori se vuoi
    value: string | number | boolean;

} 