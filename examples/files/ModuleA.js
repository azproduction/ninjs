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