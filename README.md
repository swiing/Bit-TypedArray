 <p align="center">

  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white" />
  
 </p>

# @bitarray/typedarray

[![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/swiing/bit-typedarray)](https://github.com/swiing/Bit-TypedArray#bitarraytypedarray)

A bit array object exhibiting the interface of standard ecmascript [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)'s.

> :bulb: If you are looking for easily applying bitwise operations, check out [@bitarray/es6](https://github.com/swiing/BitArray), which builds on top of the present library. Here, we purposely stick to methods and properties described by the ecmascript specification (there are no bitwise operations on arrays specified by ecmascript).

## Rationale

The ecmascript specification has introduced `TypedArray`s for `Int8`, `Uint8`, `Uint8Clamped`, `Int16`, `Uint16`, `Int32`, `Uint32`, `Float32`, `Float64`, `BigInt64` and `BigUint64` types.

This library adds support for the `Bit` type. It provides a very memory-efficient means
to store sequences of bits, while exposing the familiar, standard interface of typed arrays.

## Compatibility

[![compatibility](https://img.shields.io/badge/compatibility-%3E%3D%20ES6-orange?style=flat)](https://github.com/swiing/Bit-TypedArray#compatibility)

The library uses a [Proxy](https://caniuse.com/?search=Proxy) object, which is an ES6 (aka ES2015) feature. It can **NOT** be polyfilled (to the extent it is used by the library).

_Note: standard `TypedArray` is also a feature of ecmascript ES6._

## Installation

[![npm version](https://badge.fury.io/js/@bitarray%2Ftypedarray.svg)](https://www.npmjs.com/package/@bitarray/typedarray)

```sh
npm install @bitarray/typedarray
```

or

```sh
yarn add @bitarray/typedarray
```

## Usage

Usage is same as for any standard typed array. You may check the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) for details.

### Instantiating

```js
import BitArray from "@bitarray/typedarray"

const length = 32; // or whatever length value
const bits = new BitArray(length);

// Bit arrays can be created from iterables.
// The following are all equivalent

new BitArray("11001010");
new BitArray([1, 1, 0, 0, 1, 0, 1, 0]);
new BitArray([true, true, false, false, true, false, true, false]);

BitArray.from("11001010");
BitArray.from([1, 1, 0, 0, 1, 0, 1, 0]);
BitArray.from([true, true, false, false, true, false, true, false]);

BitArray.of(..."11001010");
BitArray.of(1, 1, 0, 0, 1, 0, 1, 0);
BitArray.of(true, true, false, false, true, false, true, false);
```

### Reading/writing values

```js
bits[1]; // 0 by default
bits[1] = 1; 
bits[1]; // 1
bits.at(1); // 1

```

### Iterating

```js
for (let i=0; i<bits.length; i++) 
  // do something with bits[i]

bits.forEach((val, i, arr) => { /* do something */ });

for (let i in bits)
  // do something with bits[i]

for (let bit of bits) 
  // do something with bit
```

### Indexes & values

```js
// indexes - following two are the same
Object.keys(bits); // [0, 1, 2, ...]
Object.getOwnPropertyNames(bits);

// values
Object.values(bits); // [0, 1, 0, 0, 0, ...]

// entries
Object.entries(bits); // [["0", 0], ["1", 1], ["2", 0], ["3", 0], ...]
```

### Instance properties

```js
// properties
bits.buffer;
bits.byteLength;
bits.byteOffset;
bits.length;

```

### static properties

```js
BitArray.BYTES_PER_ELEMENT; // 0.125 == 1/8, read-only
BitArray.name;              // "BitArray", read-only
BitArray.prototype;         // Object {...}
```

## Implementation notes

For the most part, mapping the behaviour of standard _methods_ and _properties_ to the case of bit arrays is obvious. There are a few caveats though.

_Note: not all features of the specification are implemented yet **[WIP; PRs welcome!]**._

### Setting values

In standard typed arrays, except for the Uint8clamped type, values exceeding the limits go round. For instance, setting value 257 to a Uint8 results in the value of 1 (== 257 % 0xFF). Also, non-numerical values become 0.

With BitArray, values are first coerced to number. If the result is truthy, the bit will be set to 1; 0 otherwise.

```js
let arr = new BitArray(2);

// one would normally set values like this
arr[0] = 0;
arr[1] = 1;

// this will also work
arr[0] = -.000001; // arr[0] === 1, because Boolean(-.000001) === true
arr[1] = "a";      // arr[1] === 0, because Number("a") === NaN, which is falsy
```

### `.toString()` method

The standard method returns a comma-separated list of numbers. In the case of bit sequences, interleaving commas is unnecessarily heavy, for no benefit. Instead, we list 0|1 bits in sequence, grouping them by eight for better clarity (human-reading), and separating groups by a space rather than a comma, to match common practice of text representation of bit sequences.

```js
new BitArray(20).toString(); // "00000000 00000000 0000"
```

### `.at()` method

At the time of writing this is a [proposal](https://tc39.es/proposal-relative-indexing-method/#sec-%typedarray.prototype%-additions)
for the ecmascript specification. Hence, it is to be considered as _experimental_.

_Note: it is ~~currently [not supported](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/at#browser_compatibility) by any browser yet. So, on this specific method, we are ahead of~~ now [supported](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/at#browser_compatibility) in most recent native implementations._

## License

[![license](https://img.shields.io/github/license/swiing/Bit-TypedArray)](https://github.com/swiing/Bit-TypedArray/blob/main/LICENSE)
