(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a tree of dependent objects.
 * @class
 */
var DependenTree = function () {

  /**
   * Creates a new instance of a DependenTree.
   * @param {Object} [options] - A configuration object.
   * @param {Object} options.logger - Any object which implements a `log` function.
   * @param {function(string): Array<string>} options.resolver - A function which, given a uuid, will return an array of dependent IDs.
   */
  function DependenTree() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, DependenTree);

    this.setLogger(options.logger);
    this.setResolver(options.resolver);
  }

  /**
   * Starts the resolution of a dependency tree for a single uuid.
   * @param {string} uuid - The topmost uuid for this particular tree.
   * @public
   */


  _createClass(DependenTree, [{
    key: "build",
    value: function build(uuid) {
      this.head = this.newNode(uuid);
    }

    /**
     * Performs the given operation on the tree from the bottom to the the top.
     *
     * The given function should return a Promise. A node in the tree will not
     * have the operation performed until all of it's dependencies have
     * successfully had the same operation performed. That is, the Promise
     * returned for all of its children have been resolved.
     *
     * @param {function(string): Promise} applicator - A function which given a UUID returns a Promise that should be resolved before moving up the dependency tree.
     * @public
     */

  }, {
    key: "rollUp",
    value: function rollUp(applicator) {
      var _this = this;

      var promisify = function promisify(node) {
        return new Promise(function (resolve, reject) {
          Promise.all(node.children.map(promisify)).then(function (success) {
            _this.attend(node, applicator).then(function (nodeSuccess) {
              resolve(nodeSuccess);
            }).catch(function (nodeReason) {
              reject(nodeReason);
            });
          }).catch(function (reason) {
            reject(reason);
          });
        });
      };

      return promisify(this.head);
    }

    /**
     * Set the dependency resolver to be used to recursively build the tree.
     * @param {function(string): Array<string>} resolver - A function which, given a uuid, will return an array of dependent IDs.
     * @public
     */

  }, {
    key: "setResolver",
    value: function setResolver() {
      var _this2 = this;

      var resolver = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var fallback = function fallback(uuid) {
        _this2.log("Attempted to resolve " + uuid + ", but no resolver has been configured.");
        return [];
      };
      this.resolver = resolver || fallback;
    }

    /**
     * Set the logger to be used.
     * @param {Object} options.logger - Any object which implements a `log` function.
     * @public
     */

  }, {
    key: "setLogger",
    value: function setLogger() {
      var logger = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this.logger = logger || console;
    }

    /**
     * Applies the applicator to a given node, wrapping logging around it.
     * @param {TreeNode} node - The node with which to apply the applicator.
     * @param {function(string): Promise} node - The function applicator which returns a Promise.
     * @protected
     */

  }, {
    key: "attend",
    value: function attend(node, applicator) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        applicator(node.uuid).then(function (success) {
          _this3.log("Successfully rolled up " + node.uuid + ".");
          resolve(success);
        }).catch(function (reason) {
          _this3.log("Attempted to roll up " + node.uuid + ". However, the process failed with error: \"" + reason + "\"");
          reject(reason);
        });
      });
    }

    /**
     * Recursively creates TreeNodes.
     * @protected
     */

  }, {
    key: "newNode",
    value: function newNode(uuid) {
      var _this4 = this;

      return new TreeNode(uuid, this.resolve(uuid).map(function (child) {
        return _this4.newNode(child);
      }));
    }

    /**
     * Uses the configured resolver to resolve dependencies given some uuid.
     * @protected
     */

  }, {
    key: "resolve",
    value: function resolve(uuid) {
      if (!this.resolver) {
        this.setResolver();
      }
      return this.resolver(uuid);
    }

    /**
     * Logs a message.
     * @protected
     */

  }, {
    key: "log",
    value: function log() {
      var _logger;

      if (!this.logger) {
        this.setLogger();
      }
      (_logger = this.logger).log.apply(_logger, arguments);
    }
  }]);

  return DependenTree;
}();

/**
 * Represents a particular item which can live anywhere in a dependency tree.
 * @class
 */


var TreeNode =

/**
 * Creates a new instance of a TreeNode.
 * @param {string} uuid - The uuid of this particular node.
 * @param {TreeNode[]} [children=[]] - An array of dependent TreeNodes.
 */
function TreeNode(uuid) {
  var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  _classCallCheck(this, TreeNode);

  this.uuid = uuid;
  this.children = children;
};

exports.default = DependenTree;

/***/ })
/******/ ]);
});