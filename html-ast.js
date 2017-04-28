/*
 * html-ast finite state machine
 * v1.0
 * author: Garrett Baker
 */
const constants = require( './html-consts' );
const elementTools = require( './element-tools' );

const tokens = {
	'<': elementTools.leftAngleDelimiter,
	'>': elementTools.rightAngleDelimiter,
	'/': elementTools.slashDelimiter,
	'=': elementTools.equalDelimiter,
	'"': elementTools.quoteDelimiter,
	"'": elementTools.quoteDelimiter,
	'!': elementTools.bangDelimiter,
	'-': elementTools.hyphenDelimiter
};
const parser = ( str ) => {
	let buf = [];
	let context = null;
	let ast = {
		lineCount: 1,
		current: null,
		parents: [],
		doc: []
	};
	let chr;
	let idx;

	ast.current = ast;

	if ( !str ) {
		delete ast.current;
		delete ast.parents;
		delete ast.lineCount;
		return ast;
	}

	for ( idx = 0; idx < str.length; idx++ ) {
		chr = str[idx];

		if ( tokens[chr] || /\s/.test(chr) ) {
			if ( /\s/.test(chr) ) {
				context = elementTools.whitespaceDelimiter( str, idx, ast, buf, context );
			} else {
				context = tokens[chr]( str, idx, ast, buf, context );
			}

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
					elementTools.unwireParent( ast );
				}
			}
		} else {
			if ( context & constants.CONTEXT_CLOSE_PARAM_NAME ) {
				throw new Error( 'Undelimited parameter value or missing parameter value on line: ' + ast.lineCount );
			}

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

				var isScript = context & constants.CONTEXT_SCRIPT_TAG;
				context = constants.CONTEXT_OPEN_TEXT;
				if (isScript){
					context |= constants.CONTEXT_SCRIPT_TAG;
				}

				elementTools.addChildNode( ast, constants.NODETYPE_TEXT );
				buf.push(chr);
			}
		}
	}

	delete ast.current;
	delete ast.parents;
	delete ast.lineCount;

	return ast;
};

module.exports = parser;
