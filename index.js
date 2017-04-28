/*
 * html-ast finite state machine
 * v1.0
 * author: Garrett Baker
 */
const parser = require( './html-ast' );

if (require.main === module) {
	let html = [];
	process.stdin.on( 'data', (chunk) => {
		html.push(chunk);
	});
	process.stdin.on( 'end', () => {
		process.stdout.write( JSON.stringify(parser(html.toString('utf-8'), 0)) );
	});
} else {
	module.exports = (html) => {
		return parser(html, 0);
	};
}
