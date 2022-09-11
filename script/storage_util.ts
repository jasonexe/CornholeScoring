Storage.prototype.setObject = function (key: string, value: Object) {
    this.setItem(key, JSON.stringify(value, replacer));
}

// Note that this will not return any class methods
Storage.prototype.getObject = function (key: string) {
    var value = this.getItem(key);
    return value && JSON.parse(value, reviver);
}