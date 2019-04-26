import {elementTools} from '../element-tools';
import {CONSTS} from '../html-consts';

import assert from 'assert';

describe( 'Element Tools', () => {
	describe( '#createNodeOfType', () => {
		it( 'should create node of type element', ( done ) => {
			const expected = {
				type: 1,
				name: '',
				value: '',
				parameters: [],
				children: []
			};
			const actual = elementTools.createNodeOfType( CONSTS.NODETYPE_ELEMENT );

			assert.deepEqual( actual, expected, 'Result of parse does not match!' );
			done();
      	});
  	});
});
