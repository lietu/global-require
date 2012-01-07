// Load the global-require code, if needed
if( typeof global==='undefined' ) {
	var global = require('global-require');
	global.setRequire( require );
}

global.require({module1: './test-module1.js', module2: './test-module2.js'}, function() {
	global.module1('Hello, module 1!');
	global.module2('Hello, module 2!');
});

global.require({module1: './test-module1.js', module2: './test-module2.js'}, function() {
	console.log("Theoretically, I shouldn't load anything.");
});

console.log( global );
