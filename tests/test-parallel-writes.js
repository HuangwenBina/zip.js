/* eslint-disable no-console */
/* global zip, document, Blob, FileReader */

"use strict";

const KB = 1024;
const ENTRIES_DATA = [
	{ name: "entry #1", blob: getBlob(8.5 * KB) }, { name: "entry #2", blob: getBlob(5.2 * KB) }, { name: "entry #3", blob: getBlob(4.7 * KB) },
	{ name: "entry #4", blob: getBlob(2.8 * KB) }, { name: "entry #5", blob: getBlob(1.9 * KB) }, { name: "entry #6", blob: getBlob(2.2 * KB) },
	{ name: "entry #7", blob: getBlob(5.1 * KB) }, { name: "entry #8", blob: getBlob(2.6 * KB) }, { name: "entry #9", blob: getBlob(3.1 * KB) }];

test().catch(error => console.error(error));

async function test() {
	document.body.innerHTML = "...";
	zip.configure({ chunkSize: 128 });
	const blobWriter = new zip.BlobWriter("application/zip");
	const zipWriter = new zip.ZipWriter(blobWriter);
	await Promise.all(ENTRIES_DATA.map(async entryData => {
		await zipWriter.add(entryData.name, new zip.BlobReader(entryData.blob), { bufferedWrite: true });
	}));
	await zipWriter.close();
	const zipReader = new zip.ZipReader(new zip.BlobReader(blobWriter.getData()));
	const entries = await zipReader.getEntries();
	const results = await Promise.all(entries.map(async (entry, indexEntry) => {
		const blob = await entry.getData(new zip.BlobWriter());
		return compareResult(blob, indexEntry);
	}));
	if (!results.includes(false)) {
		document.body.innerHTML = "ok";
	}
}

function compareResult(result, index) {
	const fileReaderInput = new FileReader();
	const fileReaderOutput = new FileReader();
	let loadCount = 0;
	fileReaderInput.readAsArrayBuffer(ENTRIES_DATA[index].blob);
	fileReaderOutput.readAsArrayBuffer(result);
	fileReaderInput.onload = fileReaderOutput.onload = () => {
		loadCount++;
		if (loadCount == 2) {
			const valueInput = new Float64Array(fileReaderInput.result);
			const valueOutput = new Float64Array(fileReaderOutput.result);
			if (valueInput.length != valueOutput.length) {
				fail();
				return false;
			}
			for (let indexValue = 0, n = valueInput.length; indexValue < n; indexValue++) {
				if (valueInput[indexValue] != valueOutput[indexValue]) {
					fail();
					return false;
				}
			}
			return true;
		}
	};

	function fail() {
		console.error("Error: test failed " + ENTRIES_DATA[index].name);
	}
}

function getBlob(size) {
	const data = new Float64Array(Math.floor(size / 8));
	for (let indexData = 0; indexData < data.length; indexData++) {
		data[indexData] = Math.random();
	}
	return new Blob([data]);
}