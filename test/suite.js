import BitArray from "../dist/bit-typedarray.js";

// whatever value >=4
// Some test cases are not accounting for a zero length (and would appear as failures)
// (but, in general, it is obviously allowed to have a zero-size bit array)
const length = 48;

const bits = new BitArray( length );


/** suite 1 */
const instantiating = {
  "is instanceof BitArray": bits instanceof BitArray,
  "length is set": bits.length == length,
  "empty bit array has length 0": new BitArray(0).length === 0
};


/** suite 2 */
const reading_writing = {
  "default value set to 0": bits[0] === 0 && bits[length-1] === 0,
  "bits[n] = 1 sets bit value to 1": (bits[length-1] = 1, bits[length-1] === 1),
  ".at(n)": bits.at(length-1) === 1,
  // this test assumes a minimal length, otherwise we don't run and simply return "pass ok".
  ".set([1,1], 2)": length < 4 ? true : (bits.set([1,1], 2), bits[2]===1 && bits[3]===1)
};


/** suite 3 */
// we check only that the last value is as expected,
// and assume this is enough evidence to consider the loop was okay
const iterating = {

  "for loop": (()=>{
    let item, index;
    for( let i=0; i<bits.length; i++ ) item = bits[ index=i ];
    return (index === bits.length-1) && (item === 1);
  })(),

  "for .. in loop": (()=>{
    let item, index;
    for( let i in bits ) item = bits[index=i];
    return (index === ""+(bits.length-1)) && (item === 1);
  })(),

  ".forEach()": (()=>{
    let item, index;
    bits.forEach( (val, i, arr) => { index=i; item = arr[i]===val; } );
    return (index === bits.length-1) && (item === true);
  })(),
  
  "for .. of loop": (()=>{
    let item;
    for( item of bits ) /* noop */;
    return (item === 1);
  })(),

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

  "BitArray.from()": (()=>{
    let arr = BitArray.from([true,true,false,false,true]);
    return arr instanceof BitArray
        && arr.length === 5
        && arr[0]===1 && arr[1]===1 && arr[2]===0 && arr[3]===0 && arr[4]===1
  })(),
  
  "BitArray.of()": (()=>{
    let arr = BitArray.of(true,true,false,false,true);
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

