// Uses ModuleA, ModuleB
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