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

type KeyDatatype = keyof Datatype;
type ReqKeyDatatype = keyof ReqDatatype;
type OptKeyDatatype = keyof OptDatatype;

type Options<A extends string, B extends [A, KeyDatatype][]> = {
    [K in A]: Datatype[Extract<B[number], [K, KeyDatatype]>[1]];
};

type Parser<A extends string, B extends [A, KeyDatatype][]> = {
    parse: (tokens: string | string[]) => Options<A, B>;
};

interface BaseOptionDefinition<A extends string> {
    name: A;
}

interface ReqOptionDefinition<A extends string, B extends ReqKeyDatatype> extends BaseOptionDefinition<A> {
    type: B;
    required?: true;
}

interface OptOptionDefinition<A extends string, B extends OptKeyDatatype> extends BaseOptionDefinition<A> {
    type: B;
    required?: false;
}

interface DefOptionDefinition<A extends string, B extends ReqKeyDatatype> extends BaseOptionDefinition<A> {
    type: B;
    default: ReqDatatype[B];
    required?: false;
}

type OptionDefinition<A extends string, B extends KeyDatatype> =
    | ReqOptionDefinition<A, Exclude<B, OptKeyDatatype>>
    | OptOptionDefinition<A, Exclude<B, ReqKeyDatatype>>
    | DefOptionDefinition<A, Exclude<B, OptKeyDatatype>>;

type Default<T, D extends KeyDatatype, U extends T = T> = T extends unknown ? ([U] extends [T] ? T : D) : T;

interface ParserBuilder<A extends string, B extends [A, KeyDatatype][]> {
    build: () => Parser<A, B>;
    withInline: <N extends string, T extends KeyDatatype>(
        option: N | OptionDefinition<N, T>
    ) => ParserBuilder<A | N, [...B, [N, Default<T, "string">]]>;
    withOption: <N extends string, T extends KeyDatatype>(
        option: N | OptionDefinition<N, T>
    ) => ParserBuilder<A | N, [...B, [N, Default<T, "string?">]]>;
    withToggle: <N extends string>(option: N, state?: boolean) => ParserBuilder<A | N, [...B, [N, "boolean"]]>;
}
