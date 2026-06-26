
## 2024-06-26 - [Large ArrayBuffer base64 serialization performance]
**Learning:** JS engines struggle with large array manipulation strings, such as `[...atob(str)]` or `new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')`. The `reduce` approach leads to thousands of string allocations causing extreme latency for files in the MBs, and spreading the string into an array uses massive memory causing `RangeError: Maximum call stack size exceeded`.
**Action:** Use chunked parsing `String.fromCharCode.apply` with chunks around 8192 bytes for optimal memory overhead to parse buffers to base64, and use standard `for` loops allocating exact Uint8Array lengths to decode. Use `.subarray` on Uint8Array instead of `.slice` on ArrayBuffer.
