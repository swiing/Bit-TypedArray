/** 
 *  A BitArray object exhibiting the interface of standard ecmascript TypedArray's
 *  cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
 * 
 *  @author swiing
 */

// Not all methods of native TypedArray's are implemented yet. However, 
// it should be fairly easy to implement whatever is needed from the current 
// base.

type bit = 0|1;

// Everytime we need to read/write from/to the buffer, we need a viewer.
// It would be simple, but very inefficient to create a viewer each time. 
// So instead, we create one (a Uint32Array instance), once for all,
// and resort to a weakmap to allow retrieving it later on.
const _views = new WeakMap<ArrayBuffer,Uint32Array>();

// // We could make it available to the outside world so it can benefit as well.
// // Should we prefer to keep this private, it would also be possible. 
// // In such a case, it would be up to the outside world to manage 
// // its own instance of a viewer, e.g. if required for performance reasons.
// export { _views };

// store ownKeys computation to avoid repeating each time
const _keys = new WeakMap<BitArray,string[]>();

// for my proxy
const handlers = {

    get: function( target: BitArray, prop: string|symbol ) {

        if( typeof prop === "string" ) {
            const index = Number( prop );
            if( index === Math.trunc(index) && index >= 0 && index < target.length ) {
                const [intIndex, bitMask] = bitIndex2coord( index );
                return Number( Boolean( _views.get( target.buffer )[ intIndex ] & bitMask ) );
            }
        }

        return Reflect.get( target, prop );
    },

    // In standard typed arrays, except for the Uint8clamped type, values
    // exceeding the limits go round. For instance, setting value 257 to 
    // a Uint8 results in the value 1 (== 257 % 0xFF).
    // Here, any value coerced to a boolean that is truthy will result
    // in setting value 1; 0 otherwise.
    set: function( target: BitArray, prop: string|symbol, value: bit ) {

        if( typeof prop === "string" ) {
            const index = Number( prop );
            if( index === Math.trunc(index) && index >= 0 && index < target.length ) {
                const view = _views.get( target.buffer );
                const [intIndex, bitMask] = bitIndex2coord( index );
                view[ intIndex ] = Boolean(value) ? view[ intIndex ] | bitMask
                                                  : view[ intIndex ] & ~bitMask;
                return true;
            }
        }

        return Reflect.set(target, prop, value);
    },
    
    // We want to be able to use e.g. for( let i in ... )
    // so ownKeys must return the indexes
    ownKeys: (target: BitArray): string[] => {
        let keys: string[] = _keys.get( target );

        if( !keys )
            // construct and store keys once for all
            _keys.set( 
                target,
                keys = Array( target.length )
                        .fill(void 0)
                        .map( (_,i) => i.toString() )
            );

        return keys
    },

    // Needed to make ownKeys work as expected.
    // see https://javascript.info/proxy#iteration-with-ownkeys-and-getownpropertydescriptor
    getOwnPropertyDescriptor: (/*target: BitArray, prop*/): object => ( {
            enumerable: true,
            configurable: true
        })

};

class BitArray implements Iterable<bit> {

    buffer    : ArrayBuffer;
    byteLength: number;
    byteOffset: number;
    length    : number;
    prototype : object;
    [Symbol.iterator]: ()=>Iterator<bit>;
    [index: number]: bit;

    static BYTES_PER_ELEMENT = 1/8;

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/from
    static from( source: Iterable<any> /*, mapFn?, thisArg?*/ ) {
        return new this( source );
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/of
    static of( ...items ) {
        // let ret = new this( items.length );
        // for( let i in items ) ret[i] = Number( (items[i]) );
        // return ret;
        // simplified into
        return this.from( items );
    }

    /**
     * At this stage, only the ( length ) signature is supported.
     * @todo: other signatures - cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
     * @param length 
     * @returns a proxy instance
     */
    // In order to mimic native TypedArrays, it must be possible to use things
    // like myBitArray[i], and for..in loops. The only way to achieve this is
    // by using a proxy. The object _itself_ must be a proxy.
    // It is NOT possible to extend Proxy's. However, it is possible to return 
    // a proxy from the constructor.
    constructor( arg: number /*| TypedArray @todo */ | Iterable<any> ) {

        let byteOffset = 0;
        let byteLength: number;
        let buffer: ArrayBuffer;
        let length = 0;

        const argIsIterable = Symbol.iterator in Object( arg )

        if( argIsIterable )
            for(let _ of arg as Iterable<any>) length++;
        else {
            length = Math.trunc( arg as number );

            if( length < 0 ) 
                throw new RangeError("invalid array length");
        }
        
        byteLength = ( ( length-1 >> 5 ) + 1 ) * 4;
        buffer = new ArrayBuffer( byteLength );

        // by default, properties are not writable, which is what I need
        // however, I need to have them configurable, as per https://stackoverflow.com/a/42876020
        Object.defineProperties( this, {
            "byteOffset": { value: byteOffset , configurable: true },
            "byteLength": { value: byteLength , configurable: true },
            "buffer":     { value: buffer     , configurable: true },
            "length":     { value: length     , configurable: true }
        });

        // store once for all a viewer for this buffer (see above)
        //
        // Note 1: we can NOT use 'this' as the key for the weakmap, because  
        // here 'this' refers to the target, while later on, 'this' will refer 
        // to the proxy (because of the return statement in this constructor
        // - see below). Or else, we would need to derive the proxy from the 
        // target  (does not look very nice).
        //
        // Note 2: this implies, if two instances of BitArray's share the same
        // buffer, they will also share the same viewer. It is not a problem
        // unless maybe one of the bit arrays is constructed with an offset.
        // I have not thought too much about it yet: it seems a very corner
        // case when it comes to usage of bit arrays; and such construction 
        // is not supported at this stage anyway.
        _views.set( this.buffer, new Uint32Array( this.buffer ) );

        let ret = Reflect.construct( Proxy, [this,handlers] );

        if( argIsIterable )
            for( let i in arg as Iterable<any>)
                // beware Boolean("0") === true, so make sure to convert to number first;
                ret[i] = Number( arg[i] );

        return ret;
    }

    // standard TypeArray's return comma-separated values. Here, we deliberately
    // choose not to include commas as it makes the string very heavy-weight,
    // for no benefit.
    toString() {
        // Object.values is an es2017 feature => avoid to remain ES6 compliant
        // return Object.values(this)
        //         .map( String )
        //         // add one space between each byte - it could be argued 
        //         // if this is the right thing to do. I think it replaces
        //         // nicely the comma in the native TypedArry's toString()
        //         // since here we are looking at bits.
        //         // Most obvious alternative would probably be to remove
        //         // completely this line. It is hard to read for a human,
        //         // though.
        //         .map( (b:"0"|"1", i:number) => (i+1)%8 ? b : b+" " )
        //         .join("")
        //         .trim();
        var ret = "";
        for( let i=0; i<this.length; i++ )
            ret += String(this[i]) + ( (i+1)%8 ? "" : " " );

        // trim to get rid of possibly ending space.
        return ret.trim();
    }

    forEach<T>( callback: ( value:bit, index:number, thisArg?:T ) => any, thisArg?:this|T ) {
        if( typeof callback !== "function" )
            throw new TypeError(callback + " is not a function");

        thisArg = thisArg || this;
        for( let i=0; i<this.length; i++ )
            callback.call( thisArg, this[i], i, this );
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/at
    //
    // Note: this is an experimental feature that is currently not supported
    // by any browser for native TypedArray's.
    //
    // Inspired by https://github.com/tc39/proposal-relative-indexing-method#polyfill
    at( index: number ): bit|undefined {
        index = Math.trunc( index ) || 0;

        //  If a negative number is used, the element returned 
        // will be found by counting back from the end of the array.
        if( index<0 ) index += this.length;

        // out-of-bounds access is guaranteed to return undefined
	    if( index<0 || index>=this.length ) return void 0;

        // const [intIndex, bitMask] = bitIndex2coord( index );
        // return Number( _views.get( this.buffer )[ intIndex ] & bitMask );
        // the above can be simplified as follows
        // (avoids duplication of code, though less performant)
        return this[index];
    } 

    // cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/set
    //
    // Should we enforce value to be a number, or allow anything, 
    // that would coerce to a number inside the method?
    //
    // Should we keep allowing an offset? Obviously, this is according to 
    // the native TypedArray's, but can it have any use for BitArrays?
    set( source: bit[], offset: number = 0 ) {

        if( offset<0 || offset>=this.length )
            throw new RangeError("invalid or out-of-range index");

        if( offset+source.length > this.length )
            throw new RangeError("source array is too long");

        // const view = _views.get( this.buffer );

        for( let i=0; i<source.length; i++ ) {
            // const [intIndex, bitMask] = bitIndex2coord( offset+i );
            // view[ intIndex ] = source[i] ? view[ intIndex ] | bitMask
            //                              : view[ intIndex ] & ~bitMask;
            // the above can be simplified as follows
            // (avoids duplication of code, though less performant)
            this[offset+i] = source[i];
        }
    }

    values(){
        let  currentIndex=0;
        return {
            next: ()=>{
                return currentIndex < this.length ?
                            { done: false, value: this[ currentIndex++ ] }
                          : { done: true } as IteratorResult<bit>;
            }
        };
    };

}

// utility function
/**
 * 
 * @param index 
 * @returns the Uint32 index and bit mask that can be used by a Uint32 viewer
 * to access the index'th value of the bit array.
 */
 function bitIndex2coord( index: number ): [number, number] {
    return [
        index >> 5,         // divide by 32
        1 << ( index & 31 ) // modulo 32
    ];
}

// as per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/values
// "Array.prototype.values is default implementation of Array.prototype[Symbol.iterator]"
BitArray.prototype[Symbol.iterator] = BitArray.prototype.values;

// according to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#description
// "ECMAScript 2015 defines a TypedArray constructor that serves as the [[Prototype]] 
// of all TypedArray constructors. This constructor is not directly exposed: 
// there is no global %TypedArray% or TypedArray property. It is only directly accessible 
// through Object.getPrototypeOf(Int8Array) and similar. All TypedArrays constructors 
// inherit common properties from the %TypedArray% constructor function. Additionally, 
// all typed array prototypes (TypedArray.prototype) have %TypedArray%.prototype as their 
// [[Prototype]]."
//
// In practice, it is not very useful because implementation detects BitArray is not 
// a true (native) typed array, and trying to call methods on the TypedArray prototype
// throws, e.g. TypeError: CallTypedArrayMethodIfWrapped method called on incompatible Proxy.
// Object.setPrototypeOf( BitArray.prototype , Object.getPrototypeOf(Int8Array).prototype );

export default BitArray;
// eof bit-typedarray