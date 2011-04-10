var Ninjs = {
    _waiting: {},

    ready: function (globalName, globalValue) {
        if (this._waiting.hasOwnProperty(globalName)) {
            for (var i = 0, c = this._waiting[globalName].length; i < c; i += 1) {
                this._waiting[globalName][i](globalValue);
            }
        }
    },

    wait: function (globalName, callback) {
        if (!this._waiting.hasOwnProperty(globalName)) {
            this._waiting[globalName] = [];
        }
        this._waiting[globalName].push(callback);
    }
};