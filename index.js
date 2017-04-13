/*
 * html-ast finite state machine
 * v1.0
 * author: Garrett Baker
 */
import * as constants from './html-consts';

let createNodeOfType = (type) => {
	return {
		type: type || '',
		name: '',
		value: '',
		parameters: [],
		children: []
	};
};

let addChildNode = (ast, type) => {
	let len = 0;
	let arr;

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

let assignContext = (ast, value) => {
	ast.current.context = value || '*' ;
};

let addParameter = (ast, name, value) => {
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

let unwireParent = (ast) => {
	ast.parents.pop();
	ast.current = ast.parents.length ? ast.parents[ast.parents.length-1] : ast;
};

let quoteDelimiter = (str, idx, ast, buf, context) => {
	if ( context & ( constants.CONTEXT_OPEN_COMMENT | constants.CONTEXT_OPEN_TEXT ) ) {
		buf.push(str[idx]);
	} else if ( context & ( constants.CONTEXT_OPEN_TAG | constants.CONTEXT_CLOSE_PARAM_NAME ) ) {
		return constants.CONTEXT_OPEN_PARAM_VALUE;
	} else if ( context & constants.CONTEXT_OPEN_PARAM_VALUE ) {
		ast.current.parameters[ast.current.parameters.length-1].value = buf.join('').replace(/\s+/, ' ');
		return constants.CONTEXT_CLOSE_PARAM_VALUE;
	}

	return context;
};

let whitespaceDelimiter = (str, idx, ast, buf, context) => {
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
};

let tokens = {
	'<': (str, idx, ast, buf, context) => {
		let endTag = ( '/' === str[idx+1] );
		let openDecl = ( '!' === str[idx+1] );

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
	},
	'>': (str, idx, ast, buf, context) => {
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
	'/': (str, idx, ast, buf, context) => {
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
	'=': (str, idx, ast, buf, context) => {
		let paramName = buf.join('');

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
	"WS": whitespaceDelimiter,
	'"': quoteDelimiter,
	"'": quoteDelimiter,
	'!': (str, idx, ast, buf, context) => {
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
	'-': (str, idx, ast, buf, context) => {
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
	}
};
let parser = (str, idx, ast, buf, context) => {
	let chr;

	if ( !context && context !== 0 ) {
		context = null;
	}

	buf = buf || [];

	if ( !ast ) {
		ast = {
			current: null,
			parents: [],
			doc: []
		};
		ast.current = ast;
	}

	if ( !str || idx < 0 || str.length-1 < idx ) {
		delete ast.current;
		delete ast.parents;
		return ast;
	}

	chr = str[idx];

	if ( tokens[chr] || /\s/.test(chr) ) {
		if ( /\s/.test(chr) ) {
			chr = 'WS';
		}
		context = tokens[chr]( str, idx, ast, buf, context );

		if ( context & ( constants.CONTEXT_CLOSE_COMMENT |
						 constants.CONTEXT_CLOSE_DECL |
						 constants.CONTEXT_CLOSE_TAG |
						 constants.CONTEXT_CLOSE_TAG_NAME |
						 constants.CONTEXT_CLOSE_PARAM_NAME |
						 constants.CONTEXT_CLOSE_PARAM_VALUE |
						 constants.CONTEXT_CLOSE_OPEN_TAG |
						 constants.CONTEXT_CLOSE_ELEMENT |
						 constants.CONTEXT_OPEN_ELEMENT |
						 constants.CONTEXT_CLOSE_TEXT ) ) {
			buf = [];

			if ( context & ( constants.CONTEXT_CLOSE_ELEMENT |
			 				 constants.CONTEXT_CLOSE_TEXT |
					 		 constants.CONTEXT_CLOSE_DECL ) ) {
				unwireParent( ast );
			}
		}
	} else {
		if ( context & ( constants.CONTEXT_OPEN_TEXT |
						 constants.CONTEXT_OPEN_COMMENT |
						 constants.CONTEXT_OPEN_PARAM_VALUE |
						 constants.CONTEXT_CLOSE_PARAM_VALUE |
						 constants.CONTEXT_OPEN_PARAM_NAME |
						 constants.CONTEXT_OPEN_DECL_NAME |
						 constants.CONTEXT_OPEN_ELEMENT |
						 constants.CONTEXT_OPEN_TAG_NAME |
					  	 constants.CONTEXT_CLOSE_TAG_NAME ) ) {

			buf.push(chr);

			if ( context & constants.CONTEXT_CLOSE_PARAM_VALUE ) {
				context = constants.CONTEXT_OPEN_PARAM_NAME;
			}

			if ( context & constants.CONTEXT_CLOSE_TAG_NAME ) {
				context = constants.CONTEXT_OPEN_PARAM_NAME;
			}

			if ( context & constants.CONTEXT_OPEN_ELEMENT ){
				context = constants.CONTEXT_OPEN_TAG_NAME;
			}

		} else if ( context & ( constants.CONTEXT_OPEN_DECL ) ) {
			if ( !ast.current.name ) {
				context = constants.CONTEXT_OPEN_DECL_NAME;
				buf.push(chr);
			} else {
				ast.current.value += chr;
			}
		} else if ( context & ( constants.CONTEXT_CLOSE_OPEN_TAG |
								constants.CONTEXT_CLOSE_ELEMENT ) ) {
			context = constants.CONTEXT_OPEN_TEXT;
			addChildNode( ast, constants.NODETYPE_TEXT );
			buf.push(chr);
		}
	}

	return parser( str, ++idx, ast, buf, context );
};


module.exports = (html) => {
	return parser(html, 0);
};
