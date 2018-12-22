import moment from 'moment';
import path from 'path';
import exists from 'path-exists';

import { replaceExt } from './utils.js'

function __include_block_html(paths, filename, args, optionName) {
    if (exists.sync(path.join(paths.source, filename)))
        args.push('--' + optionName + '=' + replaceExt(path.join(paths.build, filename), '.html'));
}

function build_opts(args) {
    return {
        from: 'markdown+smart+yaml_metadata_block+header_attributes+definition_lists-table_captions',
        to: 'html5',
        ext: '.html',
        args: args
    };
};

function build_base_args(paths, variables) {
    return ['--standalone', '--section-divs', '--template=' + paths.template,
        '--css=css/style.css', '--css=css/font-awesome.css', '--variable=date:' + moment().locale(variables.locale).format('LL')];
}

function build_public_args(paths, base_args) {
    var public_args = base_args.slice(0);
    __include_block_html(paths, 'before-body-public.md', public_args, 'include-before-body');
    __include_block_html(paths, 'after-body-public.md', public_args, 'include-after-body');

    return public_args;
}

function build_private_args(paths, base_args) {
    var private_args = base_args.slice(0);
    private_args.push('--variable=privatecv');
    __include_block_html(paths, 'before-body-private.md', private_args, 'include-before-body');
    __include_block_html(paths, 'after-body-private.md', private_args, 'include-after-body');

    return private_args;
}

export { build_opts, build_base_args, build_public_args, build_private_args };
