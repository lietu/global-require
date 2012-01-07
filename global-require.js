/**
 * "Globally" usable require() -function and module manager for JavaScript .. globally being a very loosely used term,
 * and means with Node.js, Require.js, and POSSIBLY in the future some other browser-side libraries.
 *
 * @license global-require 0.0.1 Copyright (c) 2012, Janne Enberg. All Rights Reserved.
 * Available via the MIT or new BSD license.
 * http://github.com/lietu/global-require
 */

// Strict mode is a good habit, in my opinion at least
"use strict";

// Check if we're running in nodeJS
var isNode = ( typeof process!=='undefined' && process.execPath && process.execPath.substr(-4)==='node' );

// Define the "global namespace"
var global = { debugMode: false };

// Define our require function for node
var nodeRequire = null;

// If we're not in node, we want to define the module object
if( isNode===false ) {
	var module;
}

/**
 * Set the require() function to use in node
 * @param newRequire The require() function
 */
global.setRequire = function( newRequire ) {

	// If not already defined, set the node require() function
	if( !nodeRequire ) {
		nodeRequire = newRequire;
	}
};

/**
 * Require components
 * @param requirements An array of things to require
 * @param callback Callback to execute when loading is complete, optional
 */
global.require = function(requirements, callback) {

	var requirementName;

	// Function to do error reporting with
	var reportError = function(errorText) {

		if( window ) {
			window.alert( errorText );

		} else if( console && console.log ) {
			console.log( errorText );

		} else {
			throw new Error( errorText );
		}
	};

	// If we have a require function
	if( typeof require==='function' ) {

		// Calculate how many items remaining to be loaded
		var remainingItems = 0;
		for( requirementName in requirements ) { ++remainingItems; }

		if( global.debugMode ) {
			console.log('Requiring ' + remainingItems + ' items');
		}

		// If we are running node.js
		if( isNode ) {

			// Loop though the requirements and require them
			for( requirementName in requirements ) {

				// If this requirement is loaded, skip it
				if( global[ requirementName ] ) {

					if( global.debugMode ) {
						console.log(requirementName + ' was already loaded, not loading again');
					}

					// .. but first check for remaining items
					if( --remainingItems===0  ) {

						// We should now call the onready callback
						if( callback ) {
							callback();
						}

					}

					continue;
				}

				// Asynchronously require, to achieve similar results as on browser side
				// .. make sure we preserve requirementName, even if we keep looping
				setTimeout((function(requirementName) {

					return function() {
						global[ requirementName ] = nodeRequire( requirements[ requirementName ] );

						if( global.debugMode ) {
							console.log('Loaded ' + requirementName);
						}

						// Check if this was the last item to load
						if( --remainingItems===0  ) {

							// We should now call the onready callback
							if( callback ) {
								callback();
							}

						}
					}
				})(requirementName), 0);
			}

		// Are we using require.js
		} else if( typeof requirejs!=='undefined' ) {

			// Loop though the requirements
			for( requirementName in requirements ) {

				// If this requirement is loaded, skip it
				if( global[ requirementName ] ) {

					if( global.debugMode ) {
						console.log(requirementName + ' was already loaded, not loading again');
					}

					// .. but first check for remaining items
					if( --remainingItems===0  ) {

						// We should now call the onready callback
						if( callback ) {
							callback();
						}

					}

					continue;
				}

				// Clear the module variable
				module = {};

				// Use require.js to require this item
				require([requirements[ requirementName ]], (function(requirementName) {

					return function() {

						// Handle the exports
						if( module.exports ) {

							global[ requirementName ] = module.exports;

						}

						if( global.debugMode ) {
							console.log('Loaded ' + requirementName);
						}

						// If no more items remaining to load
						if( --remainingItems===0  ) {

							// We should now call the onready callback
							if( callback ) {
								callback();
							}

						}
					}
				})(requirementName));
			}

		} else {

			reportError( 'Cannot determine running environment, might be an unsupported require() implementation.' );

		}

	// Cannot find require(), report the error however we can
	} else {
		reportError( 'Cannot find a require() function.' );
	}

};

// If running in node, we need to export our data
if( isNode ) {
	module.exports = global;
}