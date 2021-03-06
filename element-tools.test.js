import {elementTools} from './element-tools';
import {CONSTS} from './html-consts';

import assert from 'assert';

describe( 'Element Tools', () => {
	describe( '#createNodeOfType', () => {
		it( 'should create node of type element', () => {
			const expected = {
				type: 1,
				name: '',
				value: '',
				parameters: [],
				parent: null,
				children: []
			};
			const actual = elementTools.createNodeOfType( CONSTS.NODETYPE_ELEMENT );

			assert.deepEqual( actual, expected, 'Result of parse does not match!' );
      	});
  	});

	describe( '#addChildNode', () => {
		it( 'should set ast.current to newly created node', () => {
			const ast = {
				current: null,
				lineCount: 0,
				doc: []
			};
			const node = elementTools.createNodeOfType(CONSTS.NODETYPE_ELEMENT);

			ast.current = ast;
			elementTools.addChildNode(ast, node);

			assert.deepEqual(
				ast.current,
				node,
				'Current ast node is not the newly created node!'
			);
      	});
		it( 'should create declaration node in empty doc', () => {
			const ast = {
				current: null,
				lineCount: 0,
				doc: []
			};
			const node = elementTools.createNodeOfType(CONSTS.NODETYPE_DECL);

			ast.current = ast;
			elementTools.addChildNode(ast, node);

			assert.deepEqual( ast.current, node, 'Current ast node is not the newly created declaration node!' );
			assert.deepEqual( ast.current.parent, ast, 'Current node parent does not equal ast!' );
      	});

		it( 'should create declaration node with element node as child', () => {
			const ast = {
				current: null,
				lineCount: 0,
				doc: []
			};
			const declarationNode = elementTools.createNodeOfType(CONSTS.NODETYPE_DECL);
			const elementNode = elementTools.createNodeOfType(CONSTS.NODETYPE_ELEMENT);

			ast.current = ast;
			elementTools.addChildNode(ast, declarationNode);
			elementTools.addChildNode(ast, elementNode);

			assert.deepEqual( ast.current, elementNode, 'Current ast node is not the newly created element node!' );
			assert.deepEqual( ast.current.parent, declarationNode, 'Current node parent does not equal ast!' );
      	});

		it( 'should create declaration (doctype) node with element node as sibling', () => {
			const ast = {
				current: null,
				lineCount: 0,
				doc: []
			};
			const declarationNode = elementTools.createNodeOfType(CONSTS.NODETYPE_DECL);
			const elementNode = elementTools.createNodeOfType(CONSTS.NODETYPE_ELEMENT);

			ast.current = ast;
			elementTools.addChildNode(ast, declarationNode);
			assert.deepEqual(
				ast.current,
				declarationNode,
				'Current ast node is not the newly created declaration node!'
			);
			assert.deepEqual(
				ast.current.parent,
				ast,
				'Current node parent does not equal ast!'
			);
			declarationNode.name = 'doctype';

			elementTools.addChildNode(ast, elementNode);
			assert.deepEqual(
				declarationNode.children,
				[],
				'Declaration node child array is not empty!'
			);
			assert.deepEqual(
				ast.current,
				elementNode,
				'Current ast node is not the newly created element node!'
			);
			assert.deepEqual(
				ast.current.parent,
				ast,
				'Current node parent does not equal ast!'
			);
      	});

		it( 'should create element (head) node as child of element (html) node', () => {
			const ast = {
				current: null,
				lineCount: 0,
				doc: []
			};
			const declarationNode = elementTools.createNodeOfType(CONSTS.NODETYPE_DECL);
			const elementNode = elementTools.createNodeOfType(CONSTS.NODETYPE_ELEMENT);
			const headNode = elementTools.createNodeOfType(CONSTS.NODETYPE_ELEMENT);

			ast.current = ast;

			elementTools.addChildNode(ast, declarationNode);
			declarationNode.name = 'doctype';

			elementTools.addChildNode(ast, elementNode);
			elementNode.name = 'html';

			elementTools.addChildNode(ast, headNode);
			headNode.name = 'head';

			assert.deepEqual(
				ast.current,
				headNode,
				'Current ast node is not the newly created element (head) node!'
			)
			assert.deepEqual(
				ast.current.parent.children,
				[headNode],
				'Current ast node parent child array does not contain element (head) node!'
			);
			assert.deepEqual(
				ast.current.parent,
				elementNode,
				'Current ast node parent does not equal element (html) node!'
			);
      	});

		it( 'should create meta and title element nodes as children of element (head) node', () => {
			const ast = {
				current: null,
				lineCount: 0,
				doc: []
			};
			const declarationNode = elementTools.createNodeOfType(CONSTS.NODETYPE_DECL);
			const elementNode = elementTools.createNodeOfType(CONSTS.NODETYPE_ELEMENT);
			const headNode = elementTools.createNodeOfType(CONSTS.NODETYPE_ELEMENT);
			const metaNode = elementTools.createNodeOfType(CONSTS.NODETYPE_ELEMENT);
			const titleNode = elementTools.createNodeOfType(CONSTS.NODETYPE_ELEMENT);

			ast.current = ast;

			elementTools.addChildNode(ast, declarationNode);
			declarationNode.name = 'doctype';

			elementTools.addChildNode(ast, elementNode);
			elementNode.name = 'html';

			elementTools.addChildNode(ast, headNode);
			headNode.name = 'head';

			elementTools.addChildNode(ast, metaNode);
			metaNode.name = 'meta';
			metaNode.parameters.push({
				name: 'charset',
				value: 'utf-8'
			});

			assert.deepEqual(
				ast.current,
				metaNode,
				'Current ast node is not the newly created element (meta) node!'
			)
			assert.deepEqual(
				ast.current.parent.children,
				[metaNode],
				'Current ast node parent child array does not contain element (meta) node!'
			);
			assert.deepEqual(
				ast.current.parent,
				headNode,
				'Current ast node parent does not equal element (head) node!'
			);

			elementTools.addChildNode(ast, titleNode);
			metaNode.name = 'title';

			assert.deepEqual(
				ast.current,
				titleNode,
				'Current ast node is not the newly created element (title) node!'
			)
			assert.deepEqual(
				ast.current.parent.children,
				[metaNode, titleNode],
				'Current ast node parent child array does not contain element (title, meta) nodes!'
			);
			assert.deepEqual(
				ast.current.parent,
				headNode,
				'Current ast node parent does not equal element (head) node!'
			);
      	});
  	});
});
