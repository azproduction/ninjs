/**
 * @fileOverview Ninjs class
 *
 * @example
 *
 *      var ninjs = new (require('../Ninjs.js').Ninjs);
 *
 *      ninjs
 *      .add({
 *          file: './files/ModuleA.js',
 *          imports: ['ModuleC', 'ModuleB'],
 *          exports: 'ModuleA'
 *      })
 *      .add({
 *          file: './files/ModuleB.js',
 *          imports: 'ModuleA',
 *          exports: 'ModuleB'
 *      })
 *      .add({
 *          file: './files/ModuleD.js',
 *          imports: ['ModuleA', 'ModuleB', 'ModuleC']
 *      })
 *      .add({
 *          file: './files/ModuleC.js',
 *          imports: ['ModuleA', 'ModuleB'],
 *          exports: 'ModuleC',
 *          forceExports: 'ModuleC'
 *      })
 *      .cleanup('ModuleA', 'ModuleB', 'ModuleC', '$', 'jQuery')
 *      .print(true);
 *
 * @author azproduction
 * @see    https://github.com/azproduction/ninjs
 */
var fs = require('fs');

/**
 * Ninjs
 *
 * @constructor
 */
function Ninjs() {
    this.blocks = [];
    this.cleanupVars = [];
    this.availGlobals = {};
    this.waitingForGlobals = {};
}

// fileName, imports, exports, forceExports, preventClosure
/**
 * Adds file to make list
 * @param {Object}          options
 * @param {String}          options.fileName         JavaScript file
 * @param {String|String[]} [options.imports]        List of passive imported modules
 * @param {String|String[]} [options.exports]        List of all exported modules
 * @param {String|String[]} [options.forceExports]   List of passive exported modules
 * @param {Boolean}         [options.preventClosure]
 */
Ninjs.prototype.add = function (options) {
    options = options || {};
    var code = fs.readFileSync(options.file, 'utf8');

    options.preventClosure = options.preventClosure || false;

    if (typeof options.imports === 'string') {
        options.imports = [options.imports];
    }

    if (typeof options.exports === 'string') {
        options.exports = [options.exports];
    }

    if (typeof options.forceExports === 'string') {
        options.forceExports = [options.forceExports];
    }

    this.blocks.push({
        type: 'code',
        name: options.file,
        code: code || '',
        imports: options.imports || [],
        exports: options.exports || [],
        forceExports: options.forceExports || [],
        preventClosure: options.preventClosure
    });
    return this;
};

/**
 * Call when some extra module ready
 */
Ninjs.prototype.ready = function (/* list of ready modules */) {
    var exports = Array.prototype.slice.call(arguments);
    this.blocks.push({
        type: 'ready',
        exports: exports
    });
    return this;
};

/**
 * Adds modules to cleanup list
 */
Ninjs.prototype.cleanup = function (/* list of modules */) {
    this.cleanupVars = this.cleanupVars.concat(Array.prototype.slice.call(arguments));
    return this;
};

/**
 * Registers global
 */
Ninjs.prototype.addGlobal = function (/* list of modules */) {
    for (var i = 0, c = arguments.length; i < c; i += 1) {
        this.availGlobals[arguments[i]] = true;
    }
    return this;
};

Ninjs.prototype.GLOBALS = 'window';

Ninjs.prototype._wrapCode = function (code) {
    var clientNinjsCode = fs.readFileSync(__dirname + '/Ninjs_client.js', 'utf8') + '\n';
    return '(function(' + this.GLOBALS + ',undefined){\n\n' + clientNinjsCode + code + '}(' + this.GLOBALS + '));\n';
};

Ninjs.prototype._cleanupGlobals = function (code) {
    code += '/* Cleanup */\n';
    for (var i = 0, c = this.cleanupVars.length; i < c; i += 1) {
        code += 'delete window["' + this.cleanupVars[i] + '"];\n';
    }
    return code;
};

Ninjs.prototype._processReadyBlock = function (block) {
    // Check all exports
    for (var i = 0, c = block.exports.length, globalVarName, view = ''; i < c; i += 1) {
         globalVarName = block.exports[i];
        if (!this.waitingForGlobals[globalVarName]) {
            // Someone requests this variable
            view += 'Ninjs.ready("' + globalVarName + '", ' + globalVarName + ');\n';
            // Complete request
            this.waitingForGlobals[globalVarName] = false;
        }
    }
    return view;
};

Ninjs.prototype._processCodeBlock = function (block) {
    var argumentNames = block.imports.join(','), view = '', globalVarName, i, c, argumentValues = [];

    if (!block.preventClosure && block.imports.length) {
        view += '/* Ninjs using camouflage on module ' + block.name + ' */\n';
        view += '(function(' + argumentNames + '){\n\n';
    }

    // Check all imports
    for (i = 0, c = block.imports.length; i < c; i += 1) {
        globalVarName = block.imports[i];
        if (!this.availGlobals[globalVarName]) {
            // Not avail - create internal export
            view += 'Ninjs.wait("' + globalVarName + '", function (value) {' + globalVarName + ' = value;});\n';
            // Add request
            this.waitingForGlobals[globalVarName] = true;
            argumentValues.push('undefined');
        } else {
            argumentValues.push(globalVarName);
        }
    }

    view += block.code + '\n\n';

    // Force exports
    for (i = 0, c = block.forceExports.length; i < c; i += 1) {
        view += 'window.' + block.forceExports[i] + ' = ' + block.forceExports[i] + ';\n';
    }

    // Check all exports
    for (i = 0, c = block.exports.length; i < c; i += 1) {
        globalVarName = block.exports[i];
        if (this.waitingForGlobals[globalVarName]) {
            // Someone requests this variable
            view += 'Ninjs.ready("' + globalVarName + '", ' + globalVarName + ');\n';
            // Complete request
            this.waitingForGlobals[globalVarName] = false;
        }
        this.addGlobal(globalVarName);
    }

    if (!block.preventClosure && block.imports.length) {
        view += '}(' + argumentValues + '));\n';
        view += '/* Module ' + block.name + ' is hidden now */\n';
    }

    return view;
};

/**
 * Compiles modules
 *
 * @param {Boolean} stdout return or print to STDUOT
 */
Ninjs.prototype.print = function (stdout) {
    var view = '', i, c;

    for (i = 0, c = this.blocks.length; i < c; i += 1) {
        if (this.blocks[i].type === 'code') {
            view += this._processCodeBlock(this.blocks[i]);
        } else {
            view += this._processReadyBlock(this.blocks[i]);
        }
    }

    view = this._wrapCode(this._cleanupGlobals(view));

    stdout = stdout || false;
    if (stdout) {
        process.stdout.write(view);
    } else {
        return view;
    }
};

exports.Ninjs = Ninjs;