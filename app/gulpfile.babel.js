import gulp from 'gulp';
import { series, parallel } from 'gulp';

import autoprefixer from 'gulp-autoprefixer';
import pandoc from 'gulp-pandoc';
import rename from 'gulp-rename';
import sass from 'gulp-sass';

import del from 'del';
import exists from 'path-exists';
import merge from 'merge';
import moment from 'moment';
import path from 'path';

const browserSync = require('browser-sync').create(),
      bourbon     = require('bourbon').includePaths,
      neat        = require('bourbon-neat').includePaths;

var variables = {
    locale : 'en',
};

var paths = {
    scaffolds: './scaffolds/**/*',
    template: './assets/templates/cv.' + variables.locale + '.html',
    fonts: './assets/fonts/**/*',
    scss: './assets/stylesheets/**/*',
    assets: './assets/',
    build: './tmp/',
    source: '../source/',
    output: '../output/'
};

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

function __include_block_html(filename, args, optionName){
    if (exists.sync(path.join(paths.source, filename)))
        args.push('--' + optionName + '=' + replaceExt(path.join(paths.build, filename), '.html'));
}

const baseArgs = ['--standalone', '--section-divs', '--template=' + paths.template,
'--css=css/style.css', '--css=css/font-awesome.css', '--variable=date:' + moment().locale(variables.locale).format('LL')];
const publicArgs = baseArgs.slice(0);
const privateArgs = baseArgs.slice(0);
privateArgs.push('--variable=privatecv');
__include_block_html('before-body-public.md', publicArgs, 'include-before-body');
__include_block_html('after-body-public.md', publicArgs, 'include-after-body');
__include_block_html('before-body-private.md', privateArgs, 'include-before-body');
__include_block_html('after-body-private.md', privateArgs, 'include-after-body');

function __pandoc(filepath, args, dest, renameFunc) {
    var opts = {
      from: 'markdown+smart+yaml_metadata_block+header_attributes+definition_lists-table_captions',
      to: 'html5',
      ext: '.html',
      args: args
    };

    return gulp.src(filepath)
               .pipe(pandoc(opts))
               .pipe(rename(renameFunc()))
               .pipe(gulp.dest(dest));
}

function __build_block(filename) {
    if (exists.sync(path.join(paths.source, filename)))
    return __pandoc(path.join(paths.source, filename), ['--section-divs'], paths.build, () => replaceExt(filename, '.html'));
}

function __build_html(renamepath, args) {
    return __pandoc(path.join(paths.source, "cv.md"), args, paths.output, () => renamepath);
}

async function clean() {
    const cleaned = await del([
        path.join(paths.build, "/**"),
        path.join(paths.output, "/**")
    ], {force: true});
    console.log("Cleaning leftovers...\n\t" + cleaned.join('\n\t'));
}

function scaffolds() {
    return gulp.src(paths.scaffolds)
               .pipe(gulp.dest(paths.source));
};

function copy_assets() {
    return gulp.src(paths.fonts, {base: paths.assets})
           .pipe(gulp.dest(paths.output));
  };

function copy_images() {
    return gulp.src(path.join(paths.source, "/images/**/*"), {base: paths.source})
           .pipe(gulp.dest(paths.output));
  };

function scss() {
    return gulp.src(paths.scss)
    .pipe(sass({
        sourcemaps: true,
        includePaths: [bourbon, neat]
    }))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest(path.join(paths.output, '/css')));
  };

function build_blocks() {
  var beforePublic  = __build_block("before-body-public.md");
  var beforePrivate = __build_block("before-body-private.md");
  var afterPublic   = __build_block("after-body-public.md");
  var afterPrivate  = __build_block("after-body-private.md");

  return merge(beforePublic, beforePrivate, afterPublic, afterPrivate);
};

function html_public() { return __build_html('public.html', publicArgs)};
function html_private() { return __build_html('private.html', privateArgs)};

function watch() {
    gulp.watch("*.html").on('change', browserSync.reload);
};

function connect() {
    return browserSync.init({
        server: {
            baseDir: paths.output,
            directory: true
        },
        open: false,
        ui: false
    });
}

function check_source(done) {
    done(exists.sync(paths.source) ? null : error("'" + paths.source + '" not found, did you run the "docker-compose run node make-scaffolds" yet?'));
}

const html = series(check_source, parallel(build_blocks, scss, copy_images, copy_assets), parallel(html_public, html_private));
const start = series(clean, check_source, parallel(html, watch, connect));

export { start as default,
         start,
         clean,
         scaffolds,
         html,
         build_blocks,
         scss,
         copy_assets,
         copy_images,
         html_public,
         html_private
       };
