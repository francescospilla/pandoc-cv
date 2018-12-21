import gulp from 'gulp';
import { series, parallel } from 'gulp';

import autoprefixer from 'gulp-autoprefixer';
import pandoc from 'gulp-pandoc';
import rename from 'gulp-rename';
import sass from 'gulp-sass';

import del from 'del';
import path from 'path';
import exists from 'path-exists';

import { replaceExt, error } from './assets/gulp-js/utils.js';
import { build_opts, build_base_args, build_public_args, build_private_args } from './assets/gulp-js/pandoc_args.js';

const browserSync = require('browser-sync').create(),
      bourbon     = require('bourbon').includePaths,
      neat        = require('bourbon-neat').includePaths;

var variables = {
    locale : 'en',
};

var paths = {
    scaffolds: './assets/scaffolds/**/*',
    template: './assets/templates/cv.' + variables.locale + '.html',
    fonts: './assets/fonts/**/*',
    scss: './assets/stylesheets/**/*',
    assets: './assets/',
    build: './build/',
    source: './source/',
    output: './output/'
};

const pandoc_base_args = build_base_args(paths, variables);
const pandoc_public_args = build_public_args(paths, pandoc_base_args);
const pandoc_private_args = build_private_args(paths, pandoc_base_args);

function __pandoc(filepath, args, dest, renameFunc) {
    return gulp.src(filepath)
               .pipe(pandoc(build_opts(args)))
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

async function clean_build() {
    const cleaned = await del([
        path.join(paths.build, "/**")
    ]);
}

async function clean() {
    const cleaned = await del([
        path.join(paths.build, "/**"),
        path.join(paths.output, "/**")
    ]);
    if (cleaned.length > 0)
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

function build_blocks(done) {
  __build_block("before-body-public.md");
  __build_block("before-body-private.md");
  __build_block("after-body-public.md");
  __build_block("after-body-private.md");
  return done();
};

function html_public() { return __build_html('public.html', pandoc_public_args)};
function html_private() { return __build_html('private.html', pandoc_private_args)};

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
    done(exists.sync(paths.source) ? null : error("'" + paths.source + '" not found, did you run the "docker-compose run gulp make_scaffolds" yet?'));
}

const html = series(parallel(build_blocks, scss, copy_images, copy_assets), parallel(html_public, html_private), clean_build);

const make_scaffolds = series(scaffolds);
const make_html = series(clean, check_source, html);
const start = series(clean, check_source, parallel(html, watch, connect));

export { start,
         clean,
         make_scaffolds,
         make_html
       };
