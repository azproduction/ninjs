# Usage example

Imagine, you have a project consists of 4 own modules and jQuery at CDN.

**ModuleA.js**
    // Uses ModuleB, ModuleC
    (function (window) {
        var ModuleA = {
            a: 'ModuleA.a',
            b: 2,
            c: function () {
                console.log(ModuleB.b === 'ModuleB.b');
            },
            d: function () {
                console.log(ModuleC.c === 'ModuleC.c');
            }
        };

        // Export
        window.ModuleA = ModuleA;
    }(window));

**ModuleB.js**
    // Uses ModuleA and jQuery
    (function (window, $) {
        var ModuleB = {
            a: 1,
            b: 'ModuleB.b',
            c: function () {
                console.log(ModuleA.a === 'ModuleA.a');
                console.log(typeof $ === 'function');
            }
        };

        // Export
        window.ModuleB = ModuleB;
    }(this, jQuery));

**ModuleC.js**
var ModuleC = (function (window) {
    var ModuleC = {
        a: 1,
        b: 2,
        c: 'ModuleC.c',
        d: function () {
            console.log(ModuleA.a === 'ModuleA.a');
            console.log(ModuleB.b === 'ModuleB.b');
        }
    };

    // Export
    return ModuleC;
}(window));

**ModuleD.js** - Bootstrap file
    // Uses ModuleA, ModuleB, ModuleC
    ModuleA.c();
    ModuleB.c();
    window.setTimeout(function () {
        ModuleC.d();
        ModuleA.d();
    }, 0);

All modules are included in that order: jQuery, ModuleA, ModuleB, ModuleD (bootstrap), ModuleC.
You have 5 extra global variables. You want to protect your own methods from user scripts (userscript, extensions, etc).
There is 3 ways to do it:
1. Make 1 huge file
2. Create compile system
3. Use Ninja js aka Ninjs (The Best)

**Makefile.js**
    var ninjs = new (require('../Ninjs.js').Ninjs);

    ninjs
    .add({ // Adding ModuleA
        file: './files/ModuleA.js',
        // It passive imports ModuleC and ModuleB
        imports: ['ModuleC', 'ModuleB'],
        // And active exports ModuleA
        exports: 'ModuleA'
    })
    .add({ // Adding ModuleB
        file: './files/ModuleB.js',
        // It passive imports ModuleA and active imports jQuery
        imports: 'ModuleA',
        // And active exports ModuleB
        exports: 'ModuleB'
    })
    .add({ // Adding ModuleD
        file: './files/ModuleD.js',
        // It passive imports ModuleA, ModuleB and ModuleC
        imports: ['ModuleA', 'ModuleB', 'ModuleC']
        // Nothing exports
    })
    .add({ // Adding ModuleC
        file: './files/ModuleC.js',
        // It passive imports ModuleA, ModuleB
        imports: ['ModuleA', 'ModuleB'],
        // And passive exports ModuleC
        exports: 'ModuleC',
        // Because it passive we must force active export it, add ModuleC to force export
        forceExports: 'ModuleC'
    })
    // Cleanup all globals
    .cleanup('ModuleA', 'ModuleB', 'ModuleC', '$', 'jQuery')
    // Print to STDOUT
    .print(true)
    // Minify
    ;

See examples/make_test.js for more details.

# What is active/passive export/import?

**Active export module example**

    (function (window) {
        var ModuleA = {};

        // Export
        window.ModuleA = ModuleA;
    }(window));

**Passive export module example**

    var ModuleC = (function (window) {
        var ModuleC = {};

        // Export
        return ModuleC;
    }(window));

**Active import module example**

    (function (window, $) {
        console.log($);
    }(this, jQuery));

*jQuery as $ is active imported*

**Passive import module example**

    (function (window) {
        console.log(ModuleC);
    }(this));

*ModuleC is passive imported*

# Licence

Copyright (C) 2011 by azproduction

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.