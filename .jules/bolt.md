## 2024-06-27 - \[Optimize Uint8Array to Base64 String conversion]

**Learning:** Found a byte-by-byte conversion via `String.fromCharCode` loop and un-chunked array conversion using `String.fromCharCode.apply` for binary data to Base64 conversions which are slow and can cause "Maximum call stack size exceeded" errors for large files.
**Action:** Always use a chunked conversion (processing in blocks of e.g. 8192 bytes) with `String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)))` to prevent call stack issues and dramatically improve string concatenation performance.
