import path from 'path';

const replaceExt = function (fullPath, newExt) {
    newExt = newExt[0] == '.' ? newExt : '.' + newExt;
    var parsed = path.parse(fullPath);
    var newFullPath = path.join(parsed.root, parsed.dir, parsed.name + newExt);
    return newFullPath;
}

const error = function (msg) {
    var err = new Error(msg);
    err.showStack = false;
    return err;
}

export { replaceExt, error };
