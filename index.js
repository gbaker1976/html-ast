/*
 * html-ast finite state machine
 * v1.0
 * author: Garrett Baker
 */
import * as constants from './html-consts';
import * as elementTools from './element-tools';

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
const parser = (str, idx, ast, buf, context) => {
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
			elementTools.addChildNode( ast, constants.NODETYPE_TEXT );
			buf.push(chr);
		}
	}

	return parser( str, ++idx, ast, buf, context );
};


module.exports = (html) => {
	return parser(html, 0);
};
