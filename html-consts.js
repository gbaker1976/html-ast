module.exports =  {
	CONTEXT_OPEN_TAG:  1,
	CONTEXT_CLOSE_TAG:  2,
	CONTEXT_OPEN_ELEMENT:  4,
	CONTEXT_CLOSE_ELEMENT:  8,
	CONTEXT_OPEN_COMMENT:  16,
	CONTEXT_CLOSE_COMMENT:  32,
	CONTEXT_OPEN_TEXT:  64,
	CONTEXT_CLOSE_TEXT:  128,
	CONTEXT_OPEN_PARAM_NAME:  256,
	CONTEXT_CLOSE_PARAM_NAME:  512,
	CONTEXT_PARAM_NAME_DELIMIT:  1024,
	CONTEXT_OPEN_PARAM_VALUE:  2048,
	CONTEXT_CLOSE_PARAM_VALUE:  4096,
	CONTEXT_OPEN_DECL:  8192,
	CONTEXT_CLOSE_DECL:  16384,
	CONTEXT_OPEN_DECL_NAME:  32768,
	CONTEXT_OPEN_TAG_NAME:  65536,
	CONTEXT_CLOSE_TAG_NAME:  131072,
	CONTEXT_CLOSE_OPEN_TAG:  262144,

	NODETYPE_ELEMENT:  1,
	NODETYPE_COMMENT:  2,
	NODETYPE_TEXT:  4,
	NODETYPE_PARAM:  8,
	NODETYPE_PARAM_VALUE:  16,
	NODETYPE_DECL:  32
};
