/* eslint-disable no-console */
/* global zip, document, location */

"use strict";

const TEXT_CONTENT = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.";
const FILENAME = "lorem.txt";
const ARRAY = new Uint8Array(Array.prototype.map.call(TEXT_CONTENT, character => character.charCodeAt(0)));

test().catch(error => console.error(error));

async function test() {
	document.body.innerHTML = location.pathname + ": ...";
	logArrayText(ARRAY);
	const arrayWriter = new zip.Uint8ArrayWriter();
	const zipWriter = new zip.ZipWriter(arrayWriter);
	await zipWriter.add(FILENAME, new zip.Uint8ArrayReader(ARRAY));
	await zipWriter.close();
	const zipReader = new zip.ZipReader(new zip.Uint8ArrayReader(arrayWriter.getData()));
	const entries = await zipReader.getEntries();
	const data = await entries[0].getData(new zip.Uint8ArrayWriter());
	await zipReader.close();
	logArrayText(data);
	if (getArrayText(data) == TEXT_CONTENT) {
		document.body.innerHTML = location.pathname + ": ok";
	}
}

function logArrayText(array) {
	console.log(getArrayText(array));
	console.log("--------------");
}

function getArrayText(array) {
	let string = "";
	Array.prototype.forEach.call(new Uint8Array(array), code => string += String.fromCharCode(code));
	return string;
}