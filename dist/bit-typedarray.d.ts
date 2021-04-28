/**
 *  A BitArray object exhibiting the interface of standard ecmascript TypedArray's
 *  cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
 *
 *  @author swiing
 */
declare type bit = 0 | 1;
declare class BitArray implements Iterable<bit> {
    buffer: ArrayBuffer;
    byteLength: number;
    byteOffset: number;
    length: number;
    prototype: object;
    [Symbol.iterator]: () => Iterator<bit>;
    static BYTES_PER_ELEMENT: number;
    static from(source: Iterable<any>): BitArray;
    static of(...items: any[]): BitArray;
    /**
     * At this stage, only the ( length ) signature is supported.
     * @todo: other signatures - cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
     * @param length
     * @returns a proxy instance
     */
    constructor(arg: number | Iterable<any>);
    toString(): string;
    forEach<T>(callback: (value: bit, index: number, thisArg?: T) => any, thisArg?: this | T): void;
    at(index: number): any;
    set(source: bit[], offset?: number): void;
    values(): {
        next: () => IteratorYieldResult<bit> | {
            done: boolean;
            value: any;
        };
    };
}
export default BitArray;
