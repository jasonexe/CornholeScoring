Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value, replacer));
};
// Note that this will not return any class methods
Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value, reviver);
};
//# sourceMappingURL=storage_util.js.map