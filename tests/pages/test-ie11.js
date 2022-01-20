/* eslint-disable no-console */
/* global zip, document, Blob, FileReader */

"use strict";

const TEXT_CONTENT = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.";
const FILENAME = "lorem.txt";
const BLOB = new Blob([TEXT_CONTENT], { type: zip.getMimeType(FILENAME) });

test();

function test() {
	document.body.innerHTML = "...";
	zip.configure({ chunkSize: 128 });
	const blobWriter = new zip.BlobWriter("application/zip");
	const zipWriter = new zip.ZipWriter(blobWriter);
	const entryPromise = zipWriter.add(FILENAME, new zip.BlobReader(BLOB));
	let zipReader, zipReaderEntries;
	entryPromise.then(function (entry) {
		if (entry.compressionMethod == 0x08) {
			return zipWriter.close();
		}
	}).then(function () {
		zipReader = new zip.ZipReader(new zip.BlobReader(blobWriter.getData()));
		return zipReader.getEntries();
	}).then(function (entries) {
		zipReaderEntries = entries;
		if (entries[0].compressionMethod == 0x08) {
			return entries[0].getData(new zip.BlobWriter(zip.getMimeType(entries[0].filename)));
		}
	}).then(function (data) {
		return Promise.all([getBlobText(data), zipReader.close()]);
	}).then(function (result) {
		const data = result[0];
		if (TEXT_CONTENT == data && zipReaderEntries[0].filename == FILENAME && zipReaderEntries[0].uncompressedSize == TEXT_CONTENT.length) {
			document.body.innerHTML = "ok";
		}
	});
}

function getBlobText(blob) {
	return new Promise(function (resolve, reject) {
		const reader = new FileReader();
		reader.onload = function (event) { resolve(event.target.result); };
		reader.onerror = function () { reject(reader.error); };
		reader.readAsText(blob);
	});
}