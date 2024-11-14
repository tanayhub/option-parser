interface ReqDatatype {
    number: number;
    string: string;
    boolean: boolean;
}

interface OptDatatype {
    "number?"?: number;
    "string?"?: string;
    "boolean?": boolean;
}

type Datatype = ReqDatatype & OptDatatype;

type Options<A extends string, B extends [A, keyof Datatype][]> = {
    [K in A]: Datatype[Extract<B[number], [K, keyof Datatype]>[1]];
};

type Parser<A extends string, B extends [A, keyof Datatype][]> = {
    parse: (tokens: string | string[]) => Options<A, B>;
};

interface BaseOptionDefinition<A extends string> {
    name: A;
}

interface ReqOptionDefinition<A extends string, B extends keyof ReqDatatype> extends BaseOptionDefinition<A> {
    type: B;
    required?: true;
}

interface OptOptionDefinition<A extends string, B extends keyof OptDatatype> extends BaseOptionDefinition<A> {
    type: B;
    required?: false;
}

interface DefOptionDefinition<A extends string, B extends keyof ReqDatatype> extends BaseOptionDefinition<A> {
    type: B;
    default: ReqDatatype[B];
    required?: false;
}

type OptionDefinition<A extends string, B extends keyof Datatype> =
    | ReqOptionDefinition<A, Exclude<B, keyof OptDatatype>>
    | OptOptionDefinition<A, Exclude<B, keyof ReqDatatype>>
    | DefOptionDefinition<A, Exclude<B, keyof OptDatatype>>;

type Default<T, D extends keyof Datatype, U extends T = T> = T extends unknown ? ([U] extends [T] ? T : D) : T;

interface ParserBuilder<A extends string, B extends [A, keyof Datatype][]> {
    build: () => Parser<A, B>;
    withInline: <N extends string, T extends keyof Datatype>(
        option: N | OptionDefinition<N, T>
    ) => ParserBuilder<A | N, [...B, [N, Default<T, "string">]]>;
    withOption: <N extends string, T extends keyof Datatype>(
        option: N | OptionDefinition<N, T>
    ) => ParserBuilder<A | N, [...B, [N, Default<T, "string?">]]>;
    withToggle: <N extends string>(option: N, state?: boolean) => ParserBuilder<A | N, [...B, [N, "boolean"]]>;
}
