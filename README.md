zip.js is an open-source library (BSD-3-Clause license) for zipping and unzipping files in the browser and Deno.

See here for more info:
https://gildas-lormeau.github.io/zip.js/

```js
// Hello world with zip.js (and Streams).

import { ZipWriter, ZipReader, BlobReader } from "https://deno.land/x/zipjs/index.js";

// Creates a TransformStream object where the zip file will be written
const zipStream = new TransformStream();
// Creates a promise resolved to a Blob object containing the zip file 
const promiseZipBlob = new Response(zipStream.readable).blob();
// Creates a ReadableStream containing the text of the file to compress
const helloWorldReadable = new Blob(["Hello world!"], { type: "text/plain" }).stream();

// Creates a ZipWriter object writing data into zipStream
const zipWriter = new ZipWriter(zipStream);
// Adds the file "hello.txt" in the zip and close the writer
await zipWriter.add("hello.txt", { readable: helloWorldReadable });
await zipWriter.close();

// Retrieves the Blob object containing the zip file
const zipBlob = await promiseZipBlob;

// Reads the Blob object with a BlobReader object
const zipReader = new ZipReader(new BlobReader(zipBlob));
// Retrieves metadata of the first entry in the zip file
const firstEntry = (await zipReader.getEntries()).shift();
// Creates a TransformStream object where the entry content will be written
const dataStream = new TransformStream();
// Creates a promise resolved to the entry content as text 
const promiseTextData = new Response(dataStream.readable).text();

// Retrieves the entry content and close the reader
await firstEntry.getData(dataStream);
await zipReader.close();

// Displays "Hello world!"
console.log(await promiseTextData);
```
