const {CONSTS} = require( './html-consts' );

export const createNodeOfType = (type=CONSTS.NODETYPE_ELEMENT) => {
	return {
		type: type,
		name: '',
		value: '',
		parameters: [],
		children: [],
		parent: null
	};
};

const nodeCanHaveChildren = (node) => {
	return node.type & ( CONSTS.NODETYPE_ELEMENT | CONSTS.NODETYPE_DECL ) &&
		 !isEmptyElement(node);
};

export const addChildNode = (ast, node) => {
	if (!node) throw new Error('You must provide a child node to add!');
	// if ast.current == ast then there are no child nodes yet
	// this will be the initial state of our ast
	if ( ast.current === ast ) {
		// push node into doc array
		node.parent = ast;
		ast.doc.push(node);
	// current node may have child nodes
	} else if (nodeCanHaveChildren(ast.current)) {
		node.parent = ast.current;
		// push node into child array of current node
		ast.current.children.push(node);
	// the current node is not top-level parent and cannot have child nodes
	} else {
		// handle top-level node with no parent node
		if (ast.current.parent === ast) {
			// at this point, we may have antecedent empty elements to current node
			// we still have no parent element, fall back to the root doc
			node.parent = ast;
			ast.doc.push(node);
		} else {
			// push node into child array of parent
			node.parent = ast.current.parent;
			ast.current.parent.children.push(node);
		}
	}

	ast.current = node;
};

const addParameter = (ast, name, value) => {
	let arr = ast.current.parameters;
	let i;
	let param;

	for ( i = 0; i < arr.length; i++ ) {
		if ( name === arr[i].name ) {
			param = arr[i];
			break;
		}
	}

	if ( !param ) {
		ast.current.parameters.push({
			name: name,
			value: value || ''
		});
	}
};

const countLine = (chr, ast) => {
	if (/[\n\r]/.test(chr)) {
		ast.lineCount++;
	}
};

const isEmptyElement = (currentNode) => {
	return ['meta','img','doctype'].indexOf(currentNode.name) > -1;
};

export const elementTools = {
	createNodeOfType,
	addChildNode,
	addParameter,
	isEmptyElement,

	unwireParent: (ast) => {
		// when closing out elements, we need to unwire the current parent
		// but, we do not unwire current parent for empty elements
		if (!isEmptyElement(ast.current) && ast.current.parent !== ast) {
			ast.current = ast.current.parent;
		}
	},

	quoteDelimiter: (str, idx, ast, buf, context) => {
		if ( context & ( CONSTS.CONTEXT_OPEN_COMMENT | CONSTS.CONTEXT_OPEN_TEXT ) ) {
			buf.push(str[idx]);
		} else if ( context & ( CONSTS.CONTEXT_OPEN_TAG | CONSTS.CONTEXT_CLOSE_PARAM_NAME ) ) {
			return CONSTS.CONTEXT_OPEN_PARAM_VALUE;
		} else if ( context & CONSTS.CONTEXT_OPEN_PARAM_VALUE ) {
			ast.current.parameters[ast.current.parameters.length-1].value = buf.join('').replace(/\s+/, ' ');
			return CONSTS.CONTEXT_CLOSE_PARAM_VALUE;
		}

		return context;
	},

	whitespaceDelimiter: (str, idx, ast, buf, context) => {
		let chr = str[idx];

		countLine(chr, ast);

		if ( context & CONSTS.CONTEXT_CLOSE_PARAM_NAME ) {
			throw new Error( 'Undelimited parameter value or missing parameter value on line: ' + ast.lineCount );
		}

		if ( context & ( CONSTS.CONTEXT_OPEN_COMMENT |
						 CONSTS.CONTEXT_OPEN_TEXT |
						 CONSTS.CONTEXT_OPEN_PARAM_VALUE ) ) {
			buf.push(chr);
		} else if ( context & ( CONSTS.CONTEXT_CLOSE_COMMENT |
								CONSTS.CONTEXT_OPEN_DECL_NAME |
								CONSTS.CONTEXT_OPEN_TAG_NAME ) ) {

			if ( context & CONSTS.CONTEXT_OPEN_DECL_NAME |
						   CONSTS.CONTEXT_OPEN_TAG_NAME ) {
				ast.current.name = buf.join('');
			}

			if ( context & CONSTS.CONTEXT_OPEN_TAG_NAME ) {
				context = CONSTS.CONTEXT_CLOSE_TAG_NAME;

				if ( 'script' === ast.current.name ) {
					context |= CONSTS.CONTEXT_SCRIPT_TAG;
				}

				return context;
			}

			return CONSTS.CONTEXT_OPEN_DECL;
		}

		return context;
	},

	bangDelimiter: (str, idx, ast, buf, context) => {
		if ( context & CONSTS.CONTEXT_OPEN_ELEMENT ) {
			ast.current.type = CONSTS.NODETYPE_DECL;
			return CONSTS.CONTEXT_OPEN_DECL;
		} else if ( context & ( CONSTS.CONTEXT_OPEN_COMMENT |
								CONSTS.CONTEXT_OPEN_PARAM_VALUE |
								CONSTS.CONTEXT_OPEN_TEXT ) ) {
			buf.push(str[idx]);
		}

		return context;
	},

	hyphenDelimiter: (str, idx, ast, buf, context) => {
		if ( context & CONSTS.CONTEXT_OPEN_PARAM_NAME ) {
			buf.push(str[idx]);
		} else if ( context & ( CONSTS.CONTEXT_OPEN_DECL | CONSTS.CONTEXT_CLOSE_COMMENT ) ) {
			// lookbehind, two hyphens within the open decl context is a comment
			if ( '-' == str[idx-1] ) {
				addChildNode( ast, createNodeOfType(CONSTS.NODETYPE_COMMENT) );
				return CONSTS.CONTEXT_OPEN_COMMENT;
			}
		} else if ( context & CONSTS.CONTEXT_OPEN_COMMENT ) {
			// lookbehind, two hyphens within the open comment context is a closing comment
			if ( '-' == str[idx-1] ) {
				ast.current.value = buf.join('');
				return CONSTS.CONTEXT_CLOSE_COMMENT;
			} else if ( context & ( CONSTS.CONTEXT_OPEN_PARAM_NAME |
									CONSTS.CONTEXT_OPEN_PARAM_VALUE |
									CONSTS.CONTEXT_OPEN_TEXT |
									CONSTS.CONTEXT_OPEN_ELEMENT ) ) {
				buf.push(str[idx]);
				if ( context & CONSTS.CONTEXT_OPEN_ELEMENT ) {
					return CONSTS.CONTEXT_OPEN_PARAM_NAME;
				}
			}
		}

		return context;
	},

	equalDelimiter: (str, idx, ast, buf, context) => {
		const paramName = buf.join('');

		if ( context & CONSTS.CONTEXT_OPEN_PARAM_NAME ) {
			addParameter( ast, paramName );
			return CONSTS.CONTEXT_CLOSE_PARAM_NAME;
		}

		if ( context & ( CONSTS.CONTEXT_OPEN_COMMENT |
						 CONSTS.CONTEXT_OPEN_PARAM_VALUE |
						 CONSTS.CONTEXT_OPEN_TEXT ) ) {
			buf.push(str[idx]);
		}

		return context;
	},

	slashDelimiter: (str, idx, ast, buf, context) => {
		if ( context & ( CONSTS.CONTEXT_OPEN_COMMENT |
						 CONSTS.CONTEXT_OPEN_PARAM_VALUE |
						 CONSTS.CONTEXT_OPEN_TEXT ) ) {
			buf.push(str[idx]);
		} else if ( context & ( CONSTS.CONTEXT_OPEN_TAG_NAME |
								CONSTS.CONTEXT_CLOSE_PARAM_VALUE |
								CONSTS.CONTEXT_CLOSE_PARAM_NAME ) ) {

			return CONSTS.CONTEXT_CLOSE_ELEMENT;
		} else if ( context & ( CONSTS.CONTEXT_OPEN_TAG ) ) {

			context &= ~CONSTS.CONTEXT_SCRIPT_TAG;

			return CONSTS.CONTEXT_CLOSE_TAG;
		}

		return context;
	},

	rightAngleDelimiter: (str, idx, ast, buf, context) => {

		if ( context & CONSTS.CONTEXT_OPEN_PARAM_VALUE ) {
			// todo: add auto-closing param value + tests
			throw new Error( 'Missing closing parameter value delimiter on line: ' + ast.lineCount );
		}

		if ( context & ( CONSTS.CONTEXT_OPEN_DECL |
						 CONSTS.CONTEXT_OPEN_DECL_NAME |
						 CONSTS.CONTEXT_OPEN_TAG_NAME ) ) {

			ast.current.name = buf.join('');

			if ( context & CONSTS.CONTEXT_OPEN_TAG_NAME ) {
				context = CONSTS.CONTEXT_CLOSE_OPEN_TAG;

				if ( 'script' === ast.current.name ) {
					context |= CONSTS.CONTEXT_SCRIPT_TAG;
				}

				if ( isEmptyElement(ast.current) ) {
					context = CONSTS.CONTEXT_CLOSE_ELEMENT;
				}

				return context;
			}

			if ( context & ( CONSTS.CONTEXT_OPEN_DECL |
							 CONSTS.CONTEXT_OPEN_DECL_NAME ) ) {
				return CONSTS.CONTEXT_CLOSE_DECL;
			}
		} else if ( context & ( CONSTS.CONTEXT_OPEN_COMMENT |
								CONSTS.CONTEXT_OPEN_PARAM_VALUE |
								CONSTS.CONTEXT_CLOSE_TEXT ) ) {
			buf.push(str[idx]);
		} else if ( context & ( CONSTS.CONTEXT_OPEN_TAG |
								CONSTS.CONTEXT_CLOSE_PARAM_VALUE |
								CONSTS.CONTEXT_OPEN_PARAM_NAME ) ) {

			context = CONSTS.CONTEXT_CLOSE_OPEN_TAG;

			if ( 'script' === ast.current.name ) {
				context |= CONSTS.CONTEXT_SCRIPT_TAG;
			}

			if ( isEmptyElement(ast.current) ) {
				context = CONSTS.CONTEXT_CLOSE_ELEMENT;
			}

			return context;
		} else if ( context & CONSTS.CONTEXT_CLOSE_TAG ) {
			return CONSTS.CONTEXT_CLOSE_ELEMENT;
		} else if ( context & CONSTS.CONTEXT_CLOSE_COMMENT ) {
			return CONSTS.CONTEXT_CLOSE_DECL;
		}

		return context;
	},

	leftAngleDelimiter: (str, idx, ast, buf, context) => {
		const endTag = ( '/' === str[idx+1] && (context & ~CONSTS.CONTEXT_SCRIPT_TAG) );
		const openDecl = ( '!' === str[idx+1] && (context & (~CONSTS.CONTEXT_SCRIPT_TAG | ~CONSTS.CONTEXT_OPEN_COMMENT)) );

		if ( null === context || (context & (CONSTS.CONTEXT_CLOSE_OPEN_TAG |
											 CONSTS.CONTEXT_CLOSE_DECL |
											 CONSTS.CONTEXT_CLOSE_ELEMENT |
											 CONSTS.CONTEXT_CLOSE_TEXT)) ) {
			if ( !endTag ) {
				addChildNode( ast, createNodeOfType(CONSTS.NODETYPE_ELEMENT) );
			} else {
				return CONSTS.CONTEXT_CLOSE_TAG;
			}
		} else if ( context & ( CONSTS.CONTEXT_OPEN_COMMENT |
								CONSTS.CONTEXT_OPEN_PARAM_VALUE ) ) {
			buf.push(str[idx]);
			return context;
		} else if ( context & CONSTS.CONTEXT_OPEN_TEXT ) {
			if ( endTag ) {
				ast.current.value = buf.join('');
				return CONSTS.CONTEXT_OPEN_TAG;
			} else if ( openDecl ) {
				ast.current.value = buf.join('');
				addChildNode( ast, createNodeOfType(CONSTS.NODETYPE_DECL) );
				return CONSTS.CONTEXT_OPEN_ELEMENT;
			} else if ( context & CONSTS.CONTEXT_SCRIPT_TAG ) {
				buf.push(str[idx]);
			} else {
				ast.current.value = buf.join('');
				addChildNode( ast, createNodeOfType(CONSTS.NODETYPE_ELEMENT) );
				return CONSTS.CONTEXT_OPEN_ELEMENT;
			}

			return context;
		}

		return CONSTS.CONTEXT_OPEN_ELEMENT;
	}
};
