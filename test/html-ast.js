import {parser as htmlAst} from '../html-ast';
import html5Json from './data/test_html5.json';
import assert from 'assert';
import fs from 'fs';

const html5 = fs.readFileSync(__dirname + '/data/test_html5.html', {encoding: 'utf-8'});

describe( 'HTML AST Parser', () => {
	describe( '#html5 parse', () => {
		// it( 'should parse HTML5 template into AST', () => {
		// 	assert.deepEqual( htmlAst(html5), html5Json, 'Result of parse does not match!' );
		// });

		it ( 'should parse head corectly', () => {
			const head = `<!doctype html>
			<html class="no-js" lang="">

			<head>
			  <meta charset="utf-8">
			  <title></title>
			  <meta name="description" content="">
			  <meta name="viewport" content="width=device-width, initial-scale=1">

			  <link rel="manifest" href="site.webmanifest">
			  <link rel="apple-touch-icon" href="icon.png">
			  <!-- Place favicon.ico in the root directory -->

			  <link rel="stylesheet" href="css/normalize.css">
			  <link rel="stylesheet" href="css/main.css">

			  <meta name="theme-color" content="#fafafa">
			</head>`;
			const expected = {
				doc: [
					{
						"type": 32,
						"name": "doctype",
						"value": "html",
						"parameters": [],
						"children": []
					}, {
						"type": 1,
						"name": "html",
						"value": "",
						"parameters": [{
							"name": "class",
							"value": "nojs"
						}, {
							"name": "lang",
							"value": ""
						}],
						"children": [{
							"type": 1,
							"name": "head",
							"value": "",
							"parameters": [],
							"children": [{
								"type": 1,
								"name": "meta",
								"value": "",
								"parameters": [{
									"name": "charset",
									"value": "utf8"
								}],
								"children": []
							}, {
								"type": 1,
								"name": "title",
								"value": "",
								"parameters": [],
								"children": []
							}, {
								"type": 1,
								"name": "meta",
								"value": "",
								"parameters": [{
									"name": "name",
									"value": "description"
								}, {
									"name": "content",
									"value": ""
								}],
								"children": []
							}, {
								"type": 1,
								"name": "meta",
								"value": "",
								"parameters": [{
									"name": "name",
									"value": "viewport"
								}, {
									"name": "content",
									"value": "width=devicewidth, initialscale=1"
								}],
								"children": []
							}, {
								"type": 1,
								"name": "link",
								"value": "",
								"parameters": [{
									"name": "rel",
									"value": "appletouchicon"
								}, {
									"name": "href",
									"value": "icon.png"
								}],
								"children": []
							}, {
								"type": 32,
								"name": "",
								"value": "",
								"parameters": [],
								"children": [{
									"type": 2,
									"name": "",
									"value": " Place favicon.ico in the root directory ",
									"parameters": [],
									"children": []
								}]
							}, {
								"type": 1,
								"name": "link",
								"value": "",
								"parameters": [{
									"name": "rel",
									"value": "manifest"
								}, {
									"name": "href",
									"value": "site.webmanifest"
								}],
								"children": []
							}, {
								"type": 1,
								"name": "meta",
								"value": "",
								"parameters": [{
									"name": "name",
									"value": "themecolor"
								}, {
									"name": "content",
									"value": "#fafafa"
								}],
								"children": []
							}, {
								"type": 1,
								"name": "link",
								"value": "",
								"parameters": [{
									"name": "rel",
									"value": "stylesheet"
								}, {
									"name": "href",
									"value": "css/main.css"
								}],
								"children": []
							}, {
								"type": 1,
								"name": "link",
								"value": "",
								"parameters": [{
									"name": "rel",
									"value": "stylesheet"
								}, {
									"name": "href",
									"value": "css/normalize.css"
								}],
								"children": []
							}]
						}]
					}
				]
			};

			assert( expected, htmlAst(head), 'Parsed head ast does not match expected ast!');
		});
	});

	describe( '#comments', () => {
      it( 'should parse simple comment into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 32,
					name: '',
					value: '',
					parameters: [],
					children: [
						{
							type: 2, // comment
							value: 'foobar',
							name: '',
							parameters: [],
							children: []
						}
					]
				}
			]
		};
		let html = "<!--foobar-->";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse multiple comments into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 32,
					name: '',
					value: '',
					parameters: [],
					children: [
						{
							type: 2, // comment
							value: 'foobar',
							name: '',
							parameters: [],
							children: []
						}
					]
				},
				{
					type: 32,
					name: '',
					value: '',
					parameters: [],
					children: [
						{
							type: 2, // comment
							value: 'bazfred',
							name: '',
							parameters: [],
							children: []
						}
					]
				}
			]
		};
		let html = "<!--foobar--><!--bazfred-->";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse multiple child comments into AST', ( done ) => {
		let expected = {
			doc: [
				{
					name: 'div',
					type: 1,
					value: '',
					parameters: [],
					children: [
						{
							type: 32,
							name: '',
							value: '',
							parameters: [],
							children: [
								{
									type: 2, // comment
									value: 'foobar',
									name: '',
									parameters: [],
									children: []
								}
							]
						},
						{
							type: 32,
							name: '',
							value: '',
							parameters: [],
							children: [
								{
									type: 2, // comment
									value: 'bazfred',
									name: '',
									parameters: [],
									children: []
								}
							]
						}
					]
				}
			]
		};
		let html = "<div><!--foobar--><!--bazfred--></div>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse comment with embedded comment delimiters into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 32,
					name: '',
					value: '',
					parameters: [],
					children: [
						{
							type: 2, // comment
							value: 'foo',
							name: '',
							parameters: [],
							children: []
						},
						{
							type: 2, // comment
							value: '>bar',
							name: '',
							parameters: [],
							children: []
						}
					]
				}
			]
		};
		const html = "<!--foo-- -->bar-->";
		const actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse conditional comments with embedded markup', () => {
		  const html = `<!--[if IE]><p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="https://browsehappy.com/">upgrade your browser</a> to improve your experience and security.</p><![endif]-->`;
		  const expected = {
			  doc: [
				  {
  					type: 32,
  					name: '',
  					value: '',
  					parameters: [],
  					children: [
  						{
  							type: 2, // comment
  							value: `[if IE]><p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="https://browsehappy.com/">upgrade your browser</a> to improve your experience and security.</p><![endif]`,
  							name: '',
  							parameters: [],
  							children: []
  						}
  					]
  				}
			  ]
		  };
		  assert.deepEqual( htmlAst(html), expected, 'Result of parse does not match!' );
	  });
  	});

	describe( '#doctype', () => {
	  it( 'should parse DOCTYPE into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 32,
					name: 'doctype',
					value: 'html',
					parameters: [],
					children: []
				},
				{
					type: 32,
					name: '',
					value: '',
					parameters: [],
					children: [
						{
							type: 2, // comment
							value: 'foo',
							name: '',
							parameters: [],
							children: []
						},
						{
							type: 2, // comment
							value: '>bar',
							name: '',
							parameters: [],
							children: []
						}
					]
				}
			]
		};
		let html = "<!doctype html><!--foo-- -->bar-->";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });
  	});

	describe( '#tags', () => {
	  it( 'should parse tag into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						}
					]
				}
			]
		};
		let html = "<h1>foobar</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse empty tag into AST', () => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'meta',
					value: '',
					parameters: [{
						name: 'lang',
						value: 'foo'
					}],
					children: []
				},
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						}
					]
				}
			]
		};
		let html = "<meta lang='foo'><h1>foobar</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
      });
  	});

	it( 'should parse tags and comment siblings into AST', ( done ) => {
	  let expected = {
		  doc: [
			  {
				  type: 1,
				  name: 'h1',
				  value: '',
				  parameters: [],
				  children: [
					  {
						  type: 4,
						  name: '',
						  children: [],
						  parameters: [],
						  value: 'foobar'
					  }
				  ]
			  },
			  {
				  type: 32,
				  name: '',
				  value: '',
				  parameters: [],
				  children: [
					  {
						  type: 2, // comment
						  value: 'baz',
						  name: '',
						  parameters: [],
						  children: []
					  }
				  ]
			  }
		  ]
	  };
	  let html = "<h1>foobar</h1><!--baz-->";
	  let actual = htmlAst( html );

	  assert.deepEqual( actual, expected, 'Result of parse does not match!' );
	  done();
	});

	describe( '#children', () => {
	  it( 'should parse mixed children into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						},
						{
							type: 1,
							name: 'span',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									value: 'dino',
									parameters: [],
									children: []
								}
							]
						},
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'bazfred'
						}
					]
				}
			]
		};
		let html = "<h1>foobar<span>dino</span>bazfred</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });
  	});

	describe( '#parameters', () => {
	  it( 'should parse tag parameter into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [
						{
							name: 'class',
							value: 'test'
						}
					],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						}
					]
				}
			]
		};
		let html = "<h1 class='test'>foobar</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse multiple tag parameter into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [
						{
							name: 'class',
							value: 'test'
						},
						{
							name: 'id',
							value: 'test2'
						}
					],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						}
					]
				}
			]
		};
		let html = "<h1 class='test' id='test2'>foobar</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse duplicate parameters to overwrite previous into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [
						{
							name: 'class',
							value: 'test2'
						}
					],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						}
					]
				}
			]
		};
		let html = "<h1 class='test' class='test2'>foobar</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });
  	});

	describe( '#script tags', () => {
	  it( 'should parse script tag into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'script',
					value: '',
					parameters: [],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						}
					]
				}
			]
		};
		let html = "<script>foobar</script>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse script tag with type parameter into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'script',
					value: '',
					parameters: [{
						name: 'type',
						value: 'application/javascript'
					}],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						}
					]
				}
			]
		};
		let html = "<script type='application/javascript'>foobar</script>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse script tag with embedded delimiters into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'script',
					value: '',
					parameters: [],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: "var foo = 'bar'; if (foo < 1) {alert('foo')}"
						}
					]
				}
			]
		};
		let html = "<script>var foo = 'bar'; if (foo < 1) {alert('foo')}</script>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });
  	});

	describe( '#whitespace', () => {
	  it( 'should parse whitespace into text node into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: "foobar\nbaz\t\t\tfred"
						}
					]
				}
			]
		};
		let html = "<h1>foobar\nbaz\t\t\tfred</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse collapse whitespace into spaces into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [
						{
							name: "class",
							value: "one two"
						},
						{
							name: "id",
							value: " test"
						}
					],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: "foobar"
						}
					]
				}
			]
		};
		let html = "<h1\n\nclass='one two'\rid='\n\ttest'>foobar</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });
  	});

	describe( '#child heirarchy', () => {
	  it( 'should parse heirarchical tags into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [],
					children: [
						{
							type: 1,
							name: 'span',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'foobar'
								}
							]
						}
					]
				}
			]
		};

		let html = "<h1><span>foobar</span></h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse sigbling tags into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						}
					]
				},
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'bazfred'
						}
					]
				}
			]
		};
		let html = "<h1>foobar</h1><h1>bazfred</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse heirarchical sigbling tags into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'div',
					value: '',
					parameters: [],
					children: [
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'foobar'
								}
							]
						},
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'bazfred'
								}
							]
						}
					]
				}
			]
		};
		let html = "<div><h1>foobar</h1><h1>bazfred</h1></div>";
		let actual = htmlAst( html );
		//console.log(JSON.stringify(actual));
		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse mixed sigblings into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'div',
					value: '',
					parameters: [],
					children: [
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'foobar'
								},
								{
									type: 1,
									name: 'span',
									parameters: [],
									children: [
										{
											type: 4,
											name: '',
											children: [],
											parameters: [],
											value: 'the baz'
										}
									],
									value: ''
								}
							]
						},
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'bazfred'
								}
							]
						}
					]
				}
			]
		};
		let html = "<div><h1>foobar<span>the baz</span></h1><h1>bazfred</h1></div>";
		let actual = htmlAst( html );
		//console.log(JSON.stringify(actual));
		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse heirarchical sigbling tags and multiple sibling comments into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'div',
					value: '',
					parameters: [],
					children: [
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'foobar'
								},
								{
									type: 32,
									name: '',
									value: '',
									parameters: [],
									children: [
										{
											type: 2,
											name: '',
											children: [],
											parameters: [],
											value: 'hello there'
										}
									]
								},
								{
									type: 32,
									name: '',
									value: '',
									parameters: [],
									children: [
										{
											type: 2,
											name: '',
											children: [],
											parameters: [],
											value: 'another comment'
										}
									]
								}
							]
						},
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'bazfred'
								}
							]
						}
					]
				}
			]
		};
		let html = "<div><h1>foobar<!--hello there--><!--another comment--></h1><h1>bazfred</h1></div>";
		let actual = htmlAst( html );
		//console.log(JSON.stringify(actual));
		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse heirarchical sigbling tags and sibling comments into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'div',
					value: '',
					parameters: [],
					children: [
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'foobar'
								},
								{
									type: 32,
									name: '',
									value: '',
									parameters: [],
									children: [
										{
											type: 2,
											name: '',
											children: [],
											parameters: [],
											value: 'hello there'
										}
									]
								},
								{
									type: 1,
									name: 'span',
									value: '',
									parameters: [],
									children: [
										{
											type: 4,
											name: '',
											children: [],
											parameters: [],
											value: 'dog'
										}
									]
								}
							]
						},
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'bazfred'
								}
							]
						}
					]
				}
			]
		};
		let html = "<div><h1>foobar<!--hello there--><span>dog</span></h1><h1>bazfred</h1></div>";
		let actual = htmlAst( html );
		//console.log(JSON.stringify(actual));
		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse heirarchical sigbling tags into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'div',
					value: '',
					parameters: [],
					children: [
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'foobar'
								},
								{
									type: 1,
									name: 'i',
									value: '',
									parameters: [],
									children: [
										{
											type: 4,
											name: '',
											children: [],
											parameters: [],
											value: 'a'
										}
									]
								},
								{
									type: 1,
									name: 'span',
									value: '',
									parameters: [],
									children: [
										{
											type: 4,
											name: '',
											children: [],
											parameters: [],
											value: 'dog'
										}
									]
								}
							]
						},
						{
							type: 1,
							name: 'h1',
							value: '',
							parameters: [],
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'bazfred'
								}
							]
						}
					]
				}
			]
		};
		let html = "<div><h1>foobar<i>a</i><span>dog</span></h1><h1>bazfred</h1></div>";
		let actual = htmlAst( html );
		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });
  	});

	describe( '#element context', () => {
	  it( 'should parse element context into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [{
						name: 'data-context',
						value: 'mobile'
					}],
					children: [
						{
							type: 4,
							name: '',
							children: [],
							parameters: [],
							value: 'foobar'
						}
					]
				}
			]
		};
		let html = "<h1 data-context='mobile'>foobar</h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });

	  it( 'should parse child element context into AST', ( done ) => {
		let expected = {
			doc: [
				{
					type: 1,
					name: 'h1',
					value: '',
					parameters: [{
						name: 'data-context',
						value: 'mobile'
					}],
					children: [
						{
							type: 1,
							name: 'span',
							children: [
								{
									type: 4,
									name: '',
									children: [],
									parameters: [],
									value: 'foobar'
								}
							],
							parameters: [
								{
									name: 'data-context',
									value: 'mobile'
								}
							],
							value: ''
						}
					]
				}
			]
		};
		let html = "<h1 data-context='mobile'><span data-context='mobile'>foobar</span></h1>";
		let actual = htmlAst( html );

		assert.deepEqual( actual, expected, 'Result of parse does not match!' );
		done();
      });
  	});

	describe( '#validation errors', () => {
	  it( 'should flag parameter value missing start delimiter', ( done ) => {
		let html = "<h1 foo=bar>foobar</h1>";
		assert.throws( () => { htmlAst( html ) }, /Undelimited parameter value or missing parameter value on line: 1/, 'Result of parse does not match!' );
		done();
      });

	  it( 'should flag parameter value missing end delimiter on line three', ( done ) => {
		let html = "<h1 \n\nfoo=bar>foobar</h1>";

		assert.throws( () => { htmlAst( html ) }, /Undelimited parameter value or missing parameter value on line: 3/, 'Result of parse does not match!' );
		done();
      });

  	});
});
