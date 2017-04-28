import 'babel-polyfill';
const elementTools = require( '../element-tools' );
const constants = require( '../html-consts' );

let assert = require( 'assert' );

describe( 'Element Tools', () => {
	describe( '#createNodeOfType', () => {
		it( 'should create node of type element', ( done ) => {
			let expected = {
				type: 1,
				name: '',
				value: '',
				parameters: [],
				children: []
			};
			let actual = elementTools.createNodeOfType( constants.NODETYPE_ELEMENT );

			assert.deepEqual( actual, expected, 'Result of parse does not match!' );
			done();
      	});
  	});
});
