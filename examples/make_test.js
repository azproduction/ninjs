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
    // Because it passive we must force active export it, add ModuleC to porce export
    forceExports: 'ModuleC'
})
// Cleanup all globals
.cleanup('ModuleA', 'ModuleB', 'ModuleC', '$', 'jQuery')
// Print to STDOUT
.print(true)
;