const { src, dest, watch, parallel, series} = require ('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer'); 
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp'); // конвертирует картинки в webp
const imagemin = require('gulp-imagemin'); // минимизирует картинки
const newer = require('gulp-newer'); // вместо cacher
const fonter = require('gulp-fonter'); // конвертирует в формат wof всё, что угодно и не только
const ttf2woff2 = require('gulp-ttf2woff2'); // конвертирует только ttf в woff

    function browsersync () {
  browserSync.init({
        server: {
          baseDir: 'app/'
        }
    })
}

//конвертор шрифта
function fonts(){
    return src('app/fonts/src/*.*') // берет шрифты от сюда и кидает в выбранную папку
    .pipe(fonter({
        formats: ['woff', 'ttf'] // конертирует в эти форматы 
    }))
    .pipe(src('app/fonts/*.ttf')) // вот он указанный путь
    .pipe(ttf2woff2()) // это работает только с ttf и начнет работать только после woff по этому надо указать ещё один путь (он будет выше)
    .pipe(dest('app/fonts')) // и закидывает сюда
}

// конвертация картинок
function images() {
    return src(['app/images/src/**/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images'))
    .pipe(avif({quality : 50}))

    .pipe(src('app/images/src/**/*.*')) // путь к орегиналам, чтобы не пытался перевести с avif в webp
    .pipe(newer('app/images'))
    .pipe(webp())

    .pipe(src('app/images/src/**/*.*')) // тут тоже нужны оригиналы
    .pipe(newer('app/images')) 
    .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
  ])) 

    .pipe(dest('app/images'))
} 


function scripts() {
    return src ([
     // 'node_modules/swiper/swiper-bundle.min.js',
     // 'node_modules/wow.js/dist/wow.js',
      'app/js/main.js'
    ])
    //  src ([ 'node_modules\swiper\swiper-bundle.js', 'app/js/main.js',]) 
    // Так записываем когда нужно подключить несколько файлов js. Ситили аналогично, но лучше делать Import в scss
    // Пример когда нужно поключить все js, но кроме освновного, чтобы не зависнуть в цикле
    // 'app/js/*.js', - подключает всё файлы .js
    //'!app/js/main.min.js' - кроме этого
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles() {
    return src ('app/scss/styles.scss')
    .pipe(scss({ outputStyle: 'expanded' }).on('error', scss.logError))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 2 version'], grid: true, cascade: false})) 
    .pipe(concat('styles.min.scss'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
    
}

// эта функция следит за всеми измениями в указанных файлах
function watching(){
    watch(['app/**/*.scss'], styles)
    watch(['app/images/src/**/*.*'], images)
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload); // app/**/*.html - вот так найдёт абсолютно все html

}


function cleanDist() {
    return src('dist')
    .pipe(clean())
}

// указываем из чего мы строим сборку
function building() {
    return src([
        'app/css/styles.min.css',
        'app/images/**/*.*', // выбираем все файлы (картинки)
        'app/fonts/*.*',
        'app/js/main.min.js',
        'app/**/*.html',
        'app/lang/**/*.json'
    ], {base : 'app'})
    .pipe(dest('dist'))
}

// запускаем все процессы главное, чтобы они были структурированы и до watching и 
exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.building = building;
exports.watching = watching;

exports.build = series(cleanDist, images, building);
exports.default = parallel(styles, images, scripts, browsersync, watching);