/*
 * html-ast finite state machine
 * v1.0
 * author: Garrett Baker
 */
import {CONSTS} from './html-consts';
import {elementTools} from './element-tools';

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
export const parser = ( str ) => {
	let buf = [];
	let context = null;
	const ast = {
		lineCount: 0,
		current: null,
		doc: []
	};
	let chr;
	let idx;

	ast.current = ast;

	if ( !str ) {
		delete ast.current;
		delete ast.lineCount;
		return ast;
	}

	// todo: handle end of string with incomplete markup
	for ( idx = 0; idx < str.length; idx++ ) {
		chr = str[idx];

		if ( tokens[chr] || /\s/.test(chr) ) {
			if ( /\s/.test(chr) ) {
				context = elementTools.whitespaceDelimiter( str, idx, ast, buf, context );
			} else {
				context = tokens[chr]( str, idx, ast, buf, context );
			}

			if ( context & ( CONSTS.CONTEXT_CLOSE_COMMENT |
							 CONSTS.CONTEXT_CLOSE_DECL |
							 CONSTS.CONTEXT_CLOSE_TAG |
							 CONSTS.CONTEXT_CLOSE_TAG_NAME |
							 CONSTS.CONTEXT_CLOSE_PARAM_NAME |
							 CONSTS.CONTEXT_CLOSE_PARAM_VALUE |
							 CONSTS.CONTEXT_CLOSE_OPEN_TAG |
							 CONSTS.CONTEXT_CLOSE_ELEMENT |
							 CONSTS.CONTEXT_OPEN_ELEMENT |
							 CONSTS.CONTEXT_CLOSE_TEXT ) ) {
				buf = [];

				if ( context & ( CONSTS.CONTEXT_CLOSE_ELEMENT |
				 				 CONSTS.CONTEXT_CLOSE_TEXT |
						 		 CONSTS.CONTEXT_CLOSE_DECL ) ) {
					elementTools.unwireParent(ast);
				}
			}
		} else {
			if ( context & CONSTS.CONTEXT_CLOSE_PARAM_NAME ) {
				throw new Error( 'Undelimited parameter value or missing parameter value on line: ' + ast.lineCount );
			}

			if ( context & ( CONSTS.CONTEXT_OPEN_TEXT |
							 CONSTS.CONTEXT_OPEN_COMMENT |
							 CONSTS.CONTEXT_OPEN_PARAM_VALUE |
							 CONSTS.CONTEXT_CLOSE_PARAM_VALUE |
							 CONSTS.CONTEXT_OPEN_PARAM_NAME |
							 CONSTS.CONTEXT_OPEN_DECL_NAME |
							 CONSTS.CONTEXT_OPEN_ELEMENT |
							 CONSTS.CONTEXT_OPEN_TAG_NAME |
						  	 CONSTS.CONTEXT_CLOSE_TAG_NAME ) ) {

				buf.push(chr);

				if ( context & CONSTS.CONTEXT_CLOSE_PARAM_VALUE ) {
					context = CONSTS.CONTEXT_OPEN_PARAM_NAME;
				}

				if ( context & CONSTS.CONTEXT_CLOSE_TAG_NAME ) {
					context = CONSTS.CONTEXT_OPEN_PARAM_NAME;
				}

				if ( context & CONSTS.CONTEXT_OPEN_ELEMENT ){
					context = CONSTS.CONTEXT_OPEN_TAG_NAME;
				}

			} else if ( context & ( CONSTS.CONTEXT_OPEN_DECL ) ) {
				if ( !ast.current.name ) {
					context = CONSTS.CONTEXT_OPEN_DECL_NAME;
					buf.push(chr);
				} else {
					ast.current.value += chr;
				}
			} else if ( context & ( CONSTS.CONTEXT_CLOSE_OPEN_TAG |
									CONSTS.CONTEXT_CLOSE_ELEMENT ) ) {

				var isScript = context & CONSTS.CONTEXT_SCRIPT_TAG;
				context = CONSTS.CONTEXT_OPEN_TEXT;
				if (isScript){
					context |= CONSTS.CONTEXT_SCRIPT_TAG;
				}

				elementTools.addChildNode( ast, elementTools.createNodeOfType(CONSTS.NODETYPE_TEXT) );
				buf.push(chr);
			}
		}
	}

	delete ast.current;
	delete ast.lineCount;

	return ast;
};

export default parser;
