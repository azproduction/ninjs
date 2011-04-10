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