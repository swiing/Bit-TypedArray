// style for console output formatting
const styleHeader = new Array(200).fill(".").join("") // make sure the formatting text is not visible on the html document
                                                      // (it is far to the right, hence overflows)
                    + "; color:blue; font-weight: bold; font-size: x-large;"

function logHeader( arg0, ...rest ) {
  console.info( "%c> "+arg0, ...rest, styleHeader );
}

function log() {
  console.log(...arguments);
}

export { log, logHeader }
