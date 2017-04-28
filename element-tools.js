const constants = require( './html-consts' );

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
		if ( ast.current.type & ( constants.NODETYPE_ELEMENT | constants.NODETYPE_DECL ) &&
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

module.exports = {
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
		if ( context & ( constants.CONTEXT_OPEN_COMMENT | constants.CONTEXT_OPEN_TEXT ) ) {
			buf.push(str[idx]);
		} else if ( context & ( constants.CONTEXT_OPEN_TAG | constants.CONTEXT_CLOSE_PARAM_NAME ) ) {
			return constants.CONTEXT_OPEN_PARAM_VALUE;
		} else if ( context & constants.CONTEXT_OPEN_PARAM_VALUE ) {
			ast.current.parameters[ast.current.parameters.length-1].value = buf.join('').replace(/\s+/, ' ');
			return constants.CONTEXT_CLOSE_PARAM_VALUE;
		}

		return context;
	},

	whitespaceDelimiter: (str, idx, ast, buf, context) => {
		let chr = str[idx];

		if ( context & ( constants.CONTEXT_OPEN_COMMENT |
						 constants.CONTEXT_OPEN_TEXT |
						 constants.CONTEXT_OPEN_PARAM_VALUE ) ) {
			buf.push(chr);
		} else if ( context & ( constants.CONTEXT_CLOSE_COMMENT |
								constants.CONTEXT_OPEN_DECL_NAME |
								constants.CONTEXT_OPEN_TAG_NAME ) ) {

			if ( context & constants.CONTEXT_OPEN_DECL_NAME |
						   constants.CONTEXT_OPEN_TAG_NAME ) {
				ast.current.name = buf.join('');
			}

			if ( context & constants.CONTEXT_OPEN_TAG_NAME ) {
				return constants.CONTEXT_CLOSE_TAG_NAME;
			}
			return constants.CONTEXT_OPEN_DECL;
		}

		return context;
	},

	bangDelimiter: (str, idx, ast, buf, context) => {
		if ( context & constants.CONTEXT_OPEN_ELEMENT ) {
			ast.current.type = constants.NODETYPE_DECL;
			return constants.CONTEXT_OPEN_DECL;
		} else if ( context & ( constants.CONTEXT_OPEN_COMMENT |
								constants.CONTEXT_OPEN_PARAM_VALUE |
								constants.CONTEXT_OPEN_TEXT ) ) {
			buf.push(str[idx]);
		}

		return context;
	},

	hyphenDelimiter: (str, idx, ast, buf, context) => {
		if ( context & constants.CONTEXT_OPEN_PARAM_NAME ) {
			buf.push(str[idx]);
		} else if ( context & ( constants.CONTEXT_OPEN_DECL | constants.CONTEXT_CLOSE_COMMENT ) ) {
			if ( '-' == str[idx-1] ) {
				addChildNode( ast, constants.NODETYPE_COMMENT );
				return constants.CONTEXT_OPEN_COMMENT;
			}
		} else if ( context & constants.CONTEXT_OPEN_COMMENT ) {
			if ( '-' == str[idx-1] ) {
				ast.current.value = buf.join('');
				return constants.CONTEXT_CLOSE_COMMENT;
			} else if ( context & ( constants.CONTEXT_OPEN_PARAM_NAME |
									constants.CONTEXT_OPEN_PARAM_VALUE |
									constants.CONTEXT_OPEN_TEXT |
									constants.CONTEXT_OPEN_ELEMENT ) ) {
				buf.push(str[idx]);
				if ( context & constants.CONTEXT_OPEN_ELEMENT ) {
					return constants.CONTEXT_OPEN_PARAM_NAME;
				}
			}
		}

		return context;
	},

	equalDelimiter: (str, idx, ast, buf, context) => {
		const paramName = buf.join('');

		if ( context & constants.CONTEXT_OPEN_PARAM_NAME ) {
			addParameter( ast, paramName );
			return constants.CONTEXT_CLOSE_PARAM_NAME;
		}

		if ( context & ( constants.CONTEXT_OPEN_COMMENT |
						 constants.CONTEXT_OPEN_PARAM_VALUE |
						 constants.CONTEXT_OPEN_TEXT ) ) {
			buf.push(str[idx]);
		}

		return context;
	},

	slashDelimiter: (str, idx, ast, buf, context) => {
		if ( context & ( constants.CONTEXT_OPEN_COMMENT |
						 constants.CONTEXT_OPEN_PARAM_VALUE |
						 constants.CONTEXT_OPEN_TEXT ) ) {
			buf.push(str[idx]);
		} else if ( context & ( constants.CONTEXT_OPEN_TAG_NAME |
								constants.CONTEXT_CLOSE_PARAM_VALUE |
								constants.CONTEXT_CLOSE_PARAM_NAME ) ) {

			return constants.CONTEXT_CLOSE_ELEMENT;
		} else if ( context & ( constants.CONTEXT_OPEN_TAG ) ) {
			return constants.CONTEXT_CLOSE_TAG;
		}

		return context;
	},

	rightAngleDelimiter: (str, idx, ast, buf, context) => {
		if ( context & ( constants.CONTEXT_OPEN_DECL |
						 constants.CONTEXT_OPEN_DECL_NAME |
						 constants.CONTEXT_OPEN_TAG_NAME ) ) {

			ast.current.name = buf.join('');

			if ( context & constants.CONTEXT_OPEN_TAG_NAME ) {
				return constants.CONTEXT_CLOSE_OPEN_TAG;
			}

			if ( context & ( constants.CONTEXT_OPEN_DECL |
							 constants.CONTEXT_OPEN_DECL_NAME ) ) {
				return constants.CONTEXT_CLOSE_DECL;
			}
		} else if ( context & ( constants.CONTEXT_OPEN_COMMENT |
								constants.CONTEXT_OPEN_PARAM_VALUE |
								constants.CONTEXT_CLOSE_TEXT ) ) {
			buf.push(str[idx]);
		} else if ( context & ( constants.CONTEXT_OPEN_TAG |
								constants.CONTEXT_CLOSE_PARAM_VALUE |
								constants.CONTEXT_CLOSE_PARAM_NAME ) ) {

			return constants.CONTEXT_CLOSE_OPEN_TAG;
		} else if ( context & constants.CONTEXT_CLOSE_TAG ) {
			return constants.CONTEXT_CLOSE_ELEMENT;
		} else if ( context & constants.CONTEXT_CLOSE_COMMENT ) {
			return constants.CONTEXT_CLOSE_DECL;
		}

		return context;
	},

	leftAngleDelimiter: (str, idx, ast, buf, context) => {
		const endTag = ( '/' === str[idx+1] );
		const openDecl = ( '!' === str[idx+1] );

		if ( null === context || (context & (constants.CONTEXT_CLOSE_OPEN_TAG |
											 constants.CONTEXT_CLOSE_DECL |
											 constants.CONTEXT_CLOSE_ELEMENT |
											 constants.CONTEXT_CLOSE_TEXT)) ) {
			if ( !endTag ) {
				addChildNode( ast, constants.NODETYPE_ELEMENT );
			} else {
				return constants.CONTEXT_OPEN_TAG;
			}
		} else if ( context & ( constants.CONTEXT_OPEN_COMMENT |
								constants.CONTEXT_OPEN_PARAM_VALUE ) ) {
			buf.push(str[idx]);
		} else if ( context & constants.CONTEXT_OPEN_TEXT ) {
			if ( endTag ) {
				ast.current.value = buf.join('');
				return constants.CONTEXT_OPEN_TAG;
			} else if ( openDecl ) {
				ast.current.value = buf.join('');
				addChildNode( ast, constants.NODETYPE_DECL );
				return constants.CONTEXT_OPEN_ELEMENT;
			} else {
				ast.current.value = buf.join('');
				addChildNode( ast, constants.NODETYPE_ELEMENT );
				return constants.CONTEXT_OPEN_ELEMENT;
			}

			return context;
		}

		return constants.CONTEXT_OPEN_ELEMENT;
	}
};
