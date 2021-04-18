import BitArray from "../dist/bit-typedarray.js";
import { log as _, logHeader as _$ } from "./util.js";

const len = 48; // choose any integer value

_$("Initializing");

    const randomArray = new BitArray(len);
    for( let i=0, bool; i<len; i++)
        randomArray[i] = bool = (Math.random() > 0.5); // randomly

    _("array is", randomArray);
    _("instanceof BitArray ==", randomArray instanceof BitArray);
    
    _("BitArray.from()", BitArray.from("11001010"));
    _("BitArray.of()", BitArray.of(1,1,0,0,1,0,1,0));

    
_$("Iterating");

    let res;

    // following three output the same
    res=[];
    for( let i=0; i<len; i++ ) res.push( [i,randomArray[i]] );
    _("regular 'for' loop", res);

    res=[];
    randomArray.forEach( function(val, i/*, arr*/) { res.push( [i,val] ); });
    _(".forEach()", res );

    res=[];
    for( let i in randomArray ) res.push( [i,randomArray[i]] );
    _("for...in loop", res);
    
    res=[];
    for( let bit of randomArray ) res.push( bit );
    _("for .. of loop", res );

    
_$("Formatting");

    // methods
    _(".toString() ==", randomArray.toString()); 


_$("Inspecting");

    // following two are same
    _(".getPrototypeOf() ==", Object.getPrototypeOf( randomArray ));
    _(".prototype ==", randomArray.prototype);

    // following two are same 
    _(".getOwnPropertyNames() ==", Object.getOwnPropertyNames( randomArray ));
    _("Object.keys() ==", Object.keys( randomArray ));

    // log properties
    "constructor byteLength length".split(" ")
    .forEach( prop => { _("."+prop+":", randomArray[prop] ); });



