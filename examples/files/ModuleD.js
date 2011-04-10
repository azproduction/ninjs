// Uses ModuleA, ModuleB, ModuleC
ModuleA.c();
ModuleB.c();
window.setTimeout(function () {
    ModuleC.d();
    ModuleA.d();
}, 0);