import 'babel-polyfill';
import * as elementTools from '../element-tools';
import * as constants from '../html-consts';

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
