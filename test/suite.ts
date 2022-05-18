import BitArray from "../src/bit-typedarray";

// whatever value >=4
// Some test cases are not accounting for a zero length (and would appear as failures)
// (but, in general, it is obviously allowed to have a zero-size bit array)
const length = 48;

const bits = new BitArray( length );


/** suite 1 */
const instantiating = {
  "new BitArray( length )": bits instanceof BitArray,
  "length is set": bits.length === length,
  "empty bit array has length 0": new BitArray(0) .length === 0,
  "new BitArray( iterable )": new BitArray("011010") instanceof BitArray
                           && new BitArray("011010") .length === 6
};


/** suite 2 */
const reading_writing = {
  "default value set to 0": bits[0] === 0 && bits[length-1] === 0,
  // @ts-ignore
  "bits[n] = true sets bit value to 1": (bits[length-1] = true, bits[length-1] === 1),
  "bits[n] = 1 sets bit value to 1": (bits[length-1] = 1, bits[length-1] === 1),
  ".at(n)": bits.at(length-1) === 1,
  // this test assumes a minimal length, otherwise we don't run and simply return "pass ok".
  ".set([true,false], 2)": length < 4 ? true : (bits.set([true,false], 2), bits[2]===1 && bits[3]===0),
  ".set([1,1], 2)": length < 4 ? true : (bits.set([1,1], 2), bits[2]===1 && bits[3]===1)
};


/** suite 3 */
// we check only that the last value is as expected,
// and assume this is enough evidence to consider the loop was okay
const iterating = {

  "for loop": (()=>{
    let item, index;
    for( let i=0; i<length; i++ ) item = bits[ index=i ];
    return (index === length-1) && (item === 1);
  })(),

  "for..in loop": (()=>{
    let item, index;
    for( let i in bits ) item = bits[index=i];
    return (index === ""+(length-1)) && (item === 1);
  })(),

  ".forEach()": (()=>{
    let res, index;
    bits.forEach( (val, i, arr) => { index=i; res = arr[i]===val; } );
    return (index === length-1) && (res === true);
  })(),

  "for..of loop": (()=>{
    let item, index=0;
    for( item of bits ) index++;
    return (item===1) && (index===length);
  })()

};


/** suite 4 */
const formatting = {
  ".toString()": bits.toString() === new Array(length)
                                      .fill(0)
                                      .map((c,i)=>(i+1)%8?c:c+" ").join("").trim()
                                      // bits 2 and 3 have been set to 1 in my test cases
                                      .replace(/0000/,"0011")
                                      // last bit have been set to 1 in my test cases
                                      .replace(/.$/,"1")
}

/** suite 5 */
const static_metods = {

  "BitArray.from( boolean[] )": (()=>{
    let arr = BitArray.from( [true,true,false,false,true] );
    return arr instanceof BitArray
        && arr.length === 5
        && arr[0]===1 && arr[1]===1 && arr[2]===0 && arr[3]===0 && arr[4]===1
  })(),

  "BitArray.from( number[] )": (()=>{
    let arr = BitArray.from( [1,1,0,0,1] );
    return arr instanceof BitArray
        && arr.length === 5
        && arr[0]===1 && arr[1]===1 && arr[2]===0 && arr[3]===0 && arr[4]===1
  })(),

  "BitArray.from( string )": (()=>{
    let arr = BitArray.from("11001");
    return arr instanceof BitArray
        && arr.length === 5
        && arr[0]===1 && arr[1]===1 && arr[2]===0 && arr[3]===0 && arr[4]===1
  })(),

  "BitArray.of( ...booleans )": (()=>{
    let arr = BitArray.of(true,true,false,false,true);
    return arr instanceof BitArray
        && arr.length === 5
        && arr[0]===1 && arr[1]===1 && arr[2]===0 && arr[3]===0 && arr[4]===1
  })(),

  "BitArray.of( ...numbers )": (()=>{
    let arr = BitArray.of(1,1,0,0,1);
    return arr instanceof BitArray
        && arr.length === 5
        && arr[0]===1 && arr[1]===1 && arr[2]===0 && arr[3]===0 && arr[4]===1
  })()

}

export default {
  instantiating,
  reading_writing,
  iterating,
  formatting,
  static_metods
};
