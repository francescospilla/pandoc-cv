import chalk from 'chalk';
import fancy_log from 'fancy-log';
import path from 'path';

const chalk_levels = {
    info: chalk.reset,
    warn: chalk.keyword('orange'),
    error: chalk.bold.red
};

const replaceExt = function (fullPath, newExt) {
    newExt = newExt[0] == '.' ? newExt : '.' + newExt;
    var parsed = path.parse(fullPath);
    var newFullPath = path.join(parsed.root, parsed.dir, parsed.name + newExt);
    return newFullPath;
}

const error_notrace = function (msg) {
    var err = new Error(chalk_levels.error(msg));
    err.showStack = false;
    return err;
}

const log = {
    info: (msg) => fancy_log(chalk_levels.info(msg)),
    warn: (msg) => fancy_log("Warning: " + chalk_levels.warn(msg)),
    error: (msg) => fancy_log("Error: " + chalk_levels.error(msg))
};

export { log, error_notrace, replaceExt };
