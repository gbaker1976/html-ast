const {CONSTS} = require( './html-consts' );

const createNodeOfType = (type) => {
	return {
		type: type || '',
		name: '',
		value: '',
		parameters: [],
		children: []
	};
};

const addChildNode = (ast, type) => {
	let len = 0;
	let arr;

	// if ast.current == ast then there are no child nodes yet
	if ( ast.current === ast ) {
		arr = ast.current.doc;
	} else {
		if ( ast.current.type & ( CONSTS.NODETYPE_ELEMENT | CONSTS.NODETYPE_DECL ) &&
			 ast.parents.indexOf(ast.current) === -1 ) {

			ast.parents.push(ast.current);
		}

		arr = ast.parents[ast.parents.length-1].children;
	}

	len = arr.push(createNodeOfType( type || '' ));

	ast.current = arr[len-1];
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

export const elementTools = {
	createNodeOfType: createNodeOfType,
	addChildNode: addChildNode,
	addParameter: addParameter,

	assignContext: (ast, value) => {
		ast.current.context = value || '*' ;
	},

	unwireParent: (ast) => {
		ast.parents.pop();
		ast.current = ast.parents.length ? ast.parents[ast.parents.length-1] : ast;
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
				addChildNode( ast, CONSTS.NODETYPE_COMMENT );
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

				if ( 'meta' === ast.current.name || 'img' === ast.current.name ) {
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

			if ( 'meta' === ast.current.name || 'img' === ast.current.name ) {
				context |= CONSTS.CONTEXT_CLOSE_ELEMENT;
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
		const openDecl = ( '!' === str[idx+1] && (context & ~CONSTS.CONTEXT_SCRIPT_TAG) );

		if ( null === context || (context & (CONSTS.CONTEXT_CLOSE_OPEN_TAG |
											 CONSTS.CONTEXT_CLOSE_DECL |
											 CONSTS.CONTEXT_CLOSE_ELEMENT |
											 CONSTS.CONTEXT_CLOSE_TEXT)) ) {
			if ( !endTag ) {
				addChildNode( ast, CONSTS.NODETYPE_ELEMENT );
			} else {
				return CONSTS.CONTEXT_OPEN_TAG;
			}
		} else if ( context & ( CONSTS.CONTEXT_OPEN_COMMENT |
								CONSTS.CONTEXT_OPEN_PARAM_VALUE ) ) {
			buf.push(str[idx]);
		} else if ( context & CONSTS.CONTEXT_OPEN_TEXT ) {
			if ( endTag ) {
				ast.current.value = buf.join('');
				return CONSTS.CONTEXT_OPEN_TAG;
			} else if ( openDecl ) {
				ast.current.value = buf.join('');
				addChildNode( ast, CONSTS.NODETYPE_DECL );
				return CONSTS.CONTEXT_OPEN_ELEMENT;
			} else if ( context & CONSTS.CONTEXT_SCRIPT_TAG ) {
				buf.push(str[idx]);
			} else {
				ast.current.value = buf.join('');
				addChildNode( ast, CONSTS.NODETYPE_ELEMENT );
				return CONSTS.CONTEXT_OPEN_ELEMENT;
			}

			return context;
		}

		return CONSTS.CONTEXT_OPEN_ELEMENT;
	}
};
