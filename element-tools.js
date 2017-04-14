import * as constants from './html-consts';

export let createNodeOfType = (type) => {
	return {
		type: type || '',
		name: '',
		value: '',
		parameters: [],
		children: []
	};
};

export let addChildNode = (ast, type) => {
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

export let assignContext = (ast, value) => {
	ast.current.context = value || '*' ;
};

export let addParameter = (ast, name, value) => {
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

export let unwireParent = (ast) => {
	ast.parents.pop();
	ast.current = ast.parents.length ? ast.parents[ast.parents.length-1] : ast;
};

export let quoteDelimiter = (str, idx, ast, buf, context) => {
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

export let whitespaceDelimiter = (str, idx, ast, buf, context) => {
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
