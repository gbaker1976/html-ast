/*
 * html-ast finite state machine
 * v1.0
 * author: Garrett Baker
 */
require('@babel/register');

const parser = require( './html-ast' ).default;

const html = [];

process.stdin.on( 'data', (chunk) => {
	html.push(chunk);
});
process.stdin.on( 'end', () => {
	process.stdout.write( JSON.stringify(parser(html.toString('utf-8'))) );
});
