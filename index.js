var fs     = require('fs-extra');
var path   = require('path');
var xml2js = require('xml2js');
//var ig     = require('imagemagick');
var colors = require('colors');
var _      = require('underscore');
var Q      = require('q');
var argv   = require('minimist')(process.argv.slice(2));
var gm     = require('gm');

var isEmpty = (object) => {
  return JSON.stringify(object) == "{}";
}


/**
 * @var {Object} settings - names of the config file and of the icon image
 */
var settings = {};
settings.GEN_PUSH_ICON = argv.dopushicon || true;
settings.GEN_ICON = argv.doicon || true;
settings.GEN_SPLASH = argv.dosplash || true;
settings.CONFIG_FILE = argv.config || 'config.xml';
settings.PUSH_ICON_FILE = argv.pushicon || 'ic_notification_icon.png';
settings.PUSH_ICON_NAME = argv.pushiconname || 'ic_notification_icon';
settings.ICON_FILE = argv.icon || 'icon.png';
settings.SPLASH_FILE   = argv.splash || 'splash.png';
settings.OLD_XCODE_PATH = argv.xcodeold || false;
settings.OLD_ANDROID_PATH = argv.androidold || false;
settings.ICON_NAME = argv.name || null;
settings.TARGET_DP = argv.dp || 48;
settings.USE_PLATFORMS_PATH = argv.useplatformspath || true;
settings.RESOURCE_PATH = argv.resourcepath || 'res'; // without trailing slash
settings.ICON_DIR = argv.icondir || 'icon'; // without trailing slash
settings.SPLASH_DIR = argv.splashdir || 'screen'; // without trailing slash

var androidMult = settings.TARGET_DP / 48;

/**
 * Check which platforms are added to the project and return their icon names and sizes
 *
 * @param  {String} projectName
 * @return {Promise} resolves with an array of platforms
 */
var getPlatforms = function (projectName) {
  var deferred = Q.defer();
  var platforms = [];
  var xcodeFolder = '/Images.xcassets/AppIcon.appiconset/';

  if (settings.OLD_XCODE_PATH) {
    xcodeFolder = '/Resources/icons/';
  }
  var xcodeSplashFolder = '/Images.xcassets/LaunchImage.launchimage/';

  if (settings.OLD_XCODE_PATH) {
    xcodeSplashFolder = '/Resources/screens/';
  }

  var iconName = settings.ICON_NAME || 'icon';
  var pushIconName = settings.PUSH_ICON_NAME || 'ic_notification_icon';
  var appIconName = settings.ICON_NAME || 'AppIcon';

  platforms.push({
    name : 'ios',
    // TODO: use async fs.exists
    isAdded : fs.existsSync('platforms/ios'),
    platformIconsPath : 'platforms/ios/' + projectName + xcodeFolder,
    //iconsPath : 'res/icon/ios/',
    iconsPath : (settings.RESOURCE_PATH + '/' + settings.ICON_DIR + '/ios/').replace('//', '/'),
    icons : [
      { name: ''+iconName+'-20.png',             size : 20   },
      { name: ''+iconName+'-20@2x.png',          size : 40   },
      { name: ''+iconName+'-20@3x.png',          size : 60   },
      { name: ''+iconName+'-24.png',             size : 24   },
      { name: ''+iconName+'-24@2x.png',          size : 48   },
      { name: ''+iconName+'-24@3x.png',          size : 72   },
      { name: ''+iconName+'-27.5.png',           size : 27.5   },
      { name: ''+iconName+'-27.5@2x.png',        size : 55   },
      { name: ''+iconName+'-27.5@3x.png',        size : 82.5   },
      { name: ''+iconName+'-29.png',             size : 29   },
      { name: ''+iconName+'-29@2x.png',          size : 58   },
      { name: ''+iconName+'-29@2x-1.png',        size : 58   },
      { name: ''+iconName+'-29@3x.png',          size : 87   },
      { name: ''+iconName+'-30.png',             size : 30   },
      { name: ''+iconName+'-30@2x.png',          size : 60   },
      { name: ''+iconName+'-30@3x.png',          size : 90   },
      { name: ''+iconName+'-40.png',             size : 40   },
      { name: ''+iconName+'-40@2x.png',          size : 80   },
      { name: ''+iconName+'-44.png',             size : 44   },
      { name: ''+iconName+'-44@2x.png',          size : 88   },
      { name: ''+iconName+'-50.png',             size : 50   },
      { name: ''+iconName+'-50@2x.png',          size : 100  },
      { name: ''+iconName+'-60@2x.png',          size : 120  },
      { name: ''+iconName+'-60@3x.png',          size : 180  },
      { name: ''+iconName+'-72.png',             size : 72   },
      { name: ''+iconName+'-72@2x.png',          size : 144  },
      { name: ''+iconName+'-76.png',             size : 76   },
      { name: ''+iconName+'-76@2x.png',          size : 152  },
      { name: ''+iconName+'-83.5@2x.png',        size : 167  },
      { name: ''+iconName+'-86.png',             size : 86  },
      { name: ''+iconName+'-86@2x.png',          size : 172  },
      { name: ''+iconName+'-98.png',             size : 98  },
      { name: ''+iconName+'-98@2x.png',          size : 196  },
      { name: ''+iconName+'-1024.png',           size : 1024 },
      { name: ''+iconName+'-small.png',          size : 29   },
      { name: ''+iconName+'-small@2x.png',       size : 58   },
      { name: ''+iconName+'-small@3x.png',       size : 87   },
      { name: ''+iconName+'.png',                size : 57   },
      { name: ''+iconName+'@2x.png',             size : 114  },
      { name: ''+appIconName+'24x24@2x.png',     size : 48   },
      { name: ''+appIconName+'27.5x27.5@2x.png', size : 55   },
      { name: ''+appIconName+'29x29@2x.png',     size : 58   },
      { name: ''+appIconName+'29x29@3x.png',     size : 87   },
      { name: ''+appIconName+'40x40@2x.png',     size : 80   },
      { name: ''+appIconName+'44x44@2x.png',     size : 88   },
      { name: ''+appIconName+'86x86@2x.png',     size : 172  },
      { name: ''+appIconName+'98x98@2x.png',     size : 196  }
    ],
    platformPushIconsPath : 'platforms/ios/' + projectName + xcodeFolder,
    pushIconsPath : (settings.RESOURCE_PATH + '/' + settings.ICON_DIR + '/ios/').replace('//', '/'),
    pushIcons : [
      { name: ''+pushIconName+'-20.png',             size : 20   },
      { name: ''+pushIconName+'-20@2x.png',          size : 40   },
      { name: ''+pushIconName+'-20@3x.png',          size : 60   },
      { name: ''+pushIconName+'-40.png',             size : 40   },
      { name: ''+pushIconName+'-40@2x.png',          size : 80   },
      { name: ''+pushIconName+'-50.png',             size : 50   },
      { name: ''+pushIconName+'-50@2x.png',          size : 100  },
      { name: ''+pushIconName+'-60@2x.png',          size : 120  },
      { name: ''+pushIconName+'-60@3x.png',          size : 180  },
      { name: ''+pushIconName+'-72.png',             size : 72   },
      { name: ''+pushIconName+'-72@2x.png',          size : 144  },
      { name: ''+pushIconName+'-76.png',             size : 76   },
      { name: ''+pushIconName+'-76@2x.png',          size : 152  },
      { name: ''+pushIconName+'-83.5@2x.png',        size : 167  },
      { name: ''+pushIconName+'-1024.png',           size : 1024 },
      { name: ''+pushIconName+'-small.png',          size : 29   },
      { name: ''+pushIconName+'-small@2x.png',       size : 58   },
      { name: ''+pushIconName+'-small@3x.png',       size : 87   },
      { name: ''+pushIconName+'.png',                size : 57   },
      { name: ''+pushIconName+'@2x.png',             size : 114  },
    ],
    //splashPath : 'res/screen/ios/',
    splashPath : (settings.RESOURCE_PATH + '/' + settings.SPLASH_DIR + '/ios/').replace('//', '/'),
    platformSplashPath : 'platforms/ios/' + projectName + xcodeSplashFolder,
    splashes : [
      // iPhone
      { name: 'Default~iphone.png',            width: 320,  height: 480  },
      { name: 'Default@2x~iphone.png',         width: 640,  height: 960  },
      { name: 'Default-568h@2x~iphone.png',    width: 640,  height: 1136 },
      { name: 'Default-667h.png',              width: 750,  height: 1334 },
      { name: 'Default-736h.png',              width: 1242, height: 2208 },
      { name: 'Default-Landscape-736h.png',    width: 2208, height: 1242 },
      { name: 'Default-2436h.png',             width: 1125, height: 2436 },
      { name: 'Default-Landscape-2436h.png',   width: 2436, height: 1125 },
      // iPad
      { name: 'Default-Portrait~ipad.png',     width: 768,  height: 1024 },
      { name: 'Default-Portrait@2x~ipad.png',  width: 1536, height: 2048 },
      { name: 'Default-Portrait@~ipadpro.png', width: 2048, height: 2732 },
      { name: 'Default-Landscape~ipad.png',    width: 1024, height: 768  },
      { name: 'Default-Landscape@2x~ipad.png', width: 2048, height: 1536 },
      { name: 'Default-Landscape@~ipadpro.png', width: 2732, height: 2048 },
      // Universal
      { name: 'Default@2x~universal~anyany.png',   width: 2732, height: 2732 }
    ]
  });
  platforms.push({
    name : 'android',
    isAdded : fs.existsSync('platforms/android'),
    //iconsPath : 'platforms/android/res/',
    //iconsPath : 'res/icon/android/',
    platformIconsPath: settings.OLD_ANDROID_PATH  ?  'platforms/android/res/' : 'platforms/android/app/src/main/res/',
    iconsPath : (settings.RESOURCE_PATH + '/' + settings.ICON_DIR + '/android/').replace('//', '/'),
    icons : [
      { name : 'drawable/'+iconName+'.png',       size : 96 * androidMult },
      { name : 'drawable-ldpi/'+iconName+'.png',  size : 36 * androidMult },
      { name : 'drawable-mdpi/'+iconName+'.png',  size : 48 * androidMult },
      { name : 'drawable-hdpi/'+iconName+'.png',  size : 72 * androidMult },
      { name : 'drawable-xhdpi/'+iconName+'.png', size : 96 * androidMult },
      { name : 'drawable-xxhdpi/'+iconName+'.png', size : 144 * androidMult },
      { name : 'drawable-xxxhdpi/'+iconName+'.png', size : 192 * androidMult },
      { name : 'drawable-land-ldpi/'+iconName+'.png',  size : 36 * androidMult },
      { name : 'drawable-land-mdpi/'+iconName+'.png',  size : 48 * androidMult },
      { name : 'drawable-land-hdpi/'+iconName+'.png',  size : 72 * androidMult },
      { name : 'drawable-land-xhdpi/'+iconName+'.png', size : 96 * androidMult },
      { name : 'drawable-land-xxhdpi/'+iconName+'.png', size : 144 * androidMult },
      { name : 'drawable-land-xxxhdpi/'+iconName+'.png', size : 192 * androidMult },
      { name : 'drawable-port-ldpi/'+iconName+'.png',  size : 36 * androidMult },
      { name : 'drawable-port-mdpi/'+iconName+'.png',  size : 48 * androidMult },
      { name : 'drawable-port-hdpi/'+iconName+'.png',  size : 72 * androidMult },
      { name : 'drawable-port-xhdpi/'+iconName+'.png', size : 96 * androidMult },
      { name : 'drawable-port-xxhdpi/'+iconName+'.png', size : 144 * androidMult },
      { name : 'drawable-port-xxxhdpi/'+iconName+'.png', size : 192 * androidMult },
      { name : 'mipmap-ldpi/'+iconName+'.png',  size : 36 * androidMult },
      { name : 'mipmap-mdpi/'+iconName+'.png',  size : 48 * androidMult },
      { name : 'mipmap-hdpi/'+iconName+'.png',  size : 72 * androidMult },
      { name : 'mipmap-xhdpi/'+iconName+'.png', size : 96 * androidMult },
      { name : 'mipmap-xxhdpi/'+iconName+'.png', size : 144 * androidMult },
      { name : 'mipmap-xxxhdpi/'+iconName+'.png', size : 192 * androidMult }
    ],
    platformPushIconsPath: settings.OLD_ANDROID_PATH  ?  'platforms/android/res/' : 'platforms/android/app/src/main/res/',
    pushIconsPath : (settings.RESOURCE_PATH + '/' + settings.ICON_DIR + '/android/').replace('//', '/'),
    pushIcons : [
      { name : 'drawable/'+pushIconName+'.png',       size : 96 * androidMult },
      { name : 'drawable-ldpi/'+pushIconName+'.png',  size : 18 * androidMult },
      { name : 'drawable-mdpi/'+pushIconName+'.png',  size : 24 * androidMult },
      { name : 'drawable-hdpi/'+pushIconName+'.png',  size : 36 * androidMult },
      { name : 'drawable-xhdpi/'+pushIconName+'.png', size : 48 * androidMult },
      { name : 'drawable-xxhdpi/'+pushIconName+'.png', size : 72 * androidMult },
      { name : 'drawable-xxxhdpi/'+pushIconName+'.png', size : 96 * androidMult },
      { name : 'drawable-land-ldpi/'+pushIconName+'.png',  size : 18 * androidMult },
      { name : 'drawable-land-mdpi/'+pushIconName+'.png',  size : 24 * androidMult },
      { name : 'drawable-land-hdpi/'+pushIconName+'.png',  size : 36 * androidMult },
      { name : 'drawable-land-xhdpi/'+pushIconName+'.png', size : 48 * androidMult },
      { name : 'drawable-land-xxhdpi/'+pushIconName+'.png', size : 72 * androidMult },
      { name : 'drawable-land-xxxhdpi/'+pushIconName+'.png', size : 96 * androidMult },
      { name : 'drawable-port-ldpi/'+pushIconName+'.png',  size : 18 * androidMult },
      { name : 'drawable-port-mdpi/'+pushIconName+'.png',  size : 24 * androidMult },
      { name : 'drawable-port-hdpi/'+pushIconName+'.png',  size : 36 * androidMult },
      { name : 'drawable-port-xhdpi/'+pushIconName+'.png', size : 48 * androidMult },
      { name : 'drawable-port-xxhdpi/'+pushIconName+'.png', size : 72 * androidMult },
      { name : 'drawable-port-xxxhdpi/'+pushIconName+'.png', size : 96 * androidMult },
      { name : 'mipmap-ldpi/'+pushIconName+'.png',  size : 18 * androidMult },
      { name : 'mipmap-mdpi/'+pushIconName+'.png',  size : 24 * androidMult },
      { name : 'mipmap-hdpi/'+pushIconName+'.png',  size : 36 * androidMult },
      { name : 'mipmap-xhdpi/'+pushIconName+'.png', size : 48 * androidMult },
      { name : 'mipmap-xxhdpi/'+pushIconName+'.png', size : 72 * androidMult },
      { name : 'mipmap-xxxhdpi/'+pushIconName+'.png', size : 96 * androidMult }
    ],
    //splashPath : 'res/screen/android/',
    platformSplashPath : settings.OLD_ANDROID_PATH  ?  'platforms/android/res/' : 'platforms/android/app/src/main/res/',
    splashPath : (settings.RESOURCE_PATH + '/' + settings.SPLASH_DIR + '/android/').replace('//', '/'),
    splashes : [
      // Landscape
      { name: 'drawable-land-ldpi-screen.png',  width: 320,  height: 200  },
      { name: 'drawable-land-mdpi-screen.png',  width: 480,  height: 320  },
      { name: 'drawable-land-hdpi-screen.png',  width: 800,  height: 480  },
      { name: 'drawable-land-xhdpi-screen.png', width: 1280, height: 720  },
      { name: 'drawable-land-xxhdpi-screen.png', width: 1600, height: 960  },
      { name: 'drawable-land-xxxhdpi-screen.png', width: 1920, height: 1280  },
      // Portrait
      { name: 'drawable-port-ldpi-screen.png',  width: 200,  height: 320  },
      { name: 'drawable-port-mdpi-screen.png',  width: 320,  height: 480  },
      { name: 'drawable-port-hdpi-screen.png',  width: 480,  height: 800  },
      { name: 'drawable-port-xhdpi-screen.png', width: 720,  height: 1280 },
      { name: 'drawable-port-xxhdpi-screen.png', width: 960, height: 1600  },
      { name: 'drawable-port-xxxhdpi-screen.png', width: 1280, height: 1920  },
      // Landscape
      { name: 'splash-land-ldpi.png', width:320, height: 200},
      { name: 'splash-land-mdpi.png', width:480, height: 320},
      { name: 'splash-land-hdpi.png', width:800, height: 480},
      { name: 'splash-land-xhdpi.png', width:1280, height: 720},
      { name: 'splash-land-xxhdpi.png', width:1600, height: 960},
      { name: 'splash-land-xxxhdpi.png', width:1920, height: 1280},
      // Portrait
      { name: 'splash-port-ldpi.png', width: 200, height: 320},
      { name: 'splash-port-mdpi.png', width:320, height: 480},
      { name: 'splash-port-hdpi.png', width:480, height: 800},
      { name: 'splash-port-xhdpi.png', width:720, height: 1280},
      { name: 'splash-port-xxhdpi.png', width:960, height: 1600},
      { name: 'splash-port-xxxhdpi.png', width:1280, height: 1920}
    ]
  });
  platforms.push({
    name : 'osx',
    // TODO: use async fs.exists
    isAdded : fs.existsSync('platforms/osx'),
    platformIconsPath : 'platforms/osx/' + projectName + xcodeFolder,
    iconsPath : (settings.RESOURCE_PATH + '/' + settings.ICON_DIR + '/osx/').replace('//', '/'),
    icons : [
      { name : ''+iconName+'-16x16.png',    size : 16  },
      { name : ''+iconName+'-32x32.png',    size : 32  },
      { name : ''+iconName+'-64x64.png',    size : 64  },
      { name : ''+iconName+'-128x128.png',  size : 128 },
      { name : ''+iconName+'-256x256.png',  size : 256 },
      { name : ''+iconName+'-512x512.png',  size : 512 }
    ],
    platformSplashPath: 'platforms/osx/' + projectName + xcodeFolder,
    splashPath : (settings.RESOURCE_PATH + '/' + settings.SPLASH_DIR + '/osx/').replace('//', '/'),
    // TODO : Correct filenames for osx
    splashes : [
      { name: 'SplashScreen.scale-100.png', width: 620,  height: 300  },
      { name: 'SplashScreen.scale-125.png', width: 775,  height: 375  },
      { name: 'SplashScreen.scale-150.png', width: 930,  height: 450  },
      { name: 'SplashScreen.scale-200.png', width: 1240, height: 600  },
      { name: 'SplashScreen.scale-400.png', width: 2480, height: 1200 }
    ]
  });
  platforms.push({
    name : 'windows',
    isAdded : fs.existsSync('platforms/windows'),
    iconsPath : (settings.RESOURCE_PATH + '/' + settings.ICON_DIR + '/windows/').replace('//', '/'),
    platformIconsPath: 'platforms/windows/images/',
    icons : [
      { name : 'StoreLogo.scale-100.png', size : 50  },
      { name : 'StoreLogo.scale-125.png', size : 63  },
      { name : 'StoreLogo.scale-140.png', size : 70  },
      { name : 'StoreLogo.scale-150.png', size : 75  },
      { name : 'StoreLogo.scale-180.png', size : 90  },
      { name : 'StoreLogo.scale-200.png', size : 100 },
      { name : 'StoreLogo.scale-240.png', size : 120 },
      { name : 'StoreLogo.scale-400.png', size : 200 },

      { name : 'Square30x30Logo.scale-80.png', size : 24 },
      { name : 'Square30x30Logo.scale-100.png', size : 30 },
      { name : 'Square30x30Logo.scale-140.png', size : 42 },
      { name : 'Square30x30Logo.scale-180.png', size : 54 },

      { name : 'Square30x30Logo.targetsize-16.png', size : 16 },
      { name : 'Square30x30Logo.targetsize-32.png', size : 32 },
      { name : 'Square30x30Logo.targetsize-48.png', size : 48 },
      { name : 'Square30x30Logo.targetsize-256.png', size : 256 },

      { name : 'Square44x44Logo.scale-100.png', size : 44  },
      { name : 'Square44x44Logo.scale-125.png', size : 55  },
      { name : 'Square44x44Logo.scale-140.png', size : 62  },
      { name : 'Square44x44Logo.scale-150.png', size : 66  },
      { name : 'Square44x44Logo.scale-200.png', size : 88  },
      { name : 'Square44x44Logo.scale-240.png', size : 106  },
      { name : 'Square44x44Logo.scale-400.png', size : 176 },

      { name : 'Square70x70Logo.scale-80.png', size : 56  },
      { name : 'Square70x70Logo.scale-100.png', size : 70  },
      { name : 'Square70x70Logo.scale-140.png', size : 98  },
      { name : 'Square70x70Logo.scale-180.png', size : 126 },

      { name : 'Square71x71Logo.scale-100.png', size : 71  },
      { name : 'Square71x71Logo.scale-125.png', size : 89  },
      { name : 'Square71x71Logo.scale-140.png', size : 99 },
      { name : 'Square71x71Logo.scale-150.png', size : 107 },
      { name : 'Square71x71Logo.scale-200.png', size : 142 },
      { name : 'Square71x71Logo.scale-240.png', size : 170 },
      { name : 'Square71x71Logo.scale-400.png', size : 284 },

      { name : 'Square150x150Logo.scale-80.png', size : 120 },
      { name : 'Square150x150Logo.scale-100.png', size : 150 },
      { name : 'Square150x150Logo.scale-125.png', size : 188 },
      { name : 'Square150x150Logo.scale-140.png', size : 210 },
      { name : 'Square150x150Logo.scale-150.png', size : 225 },
      { name : 'Square150x150Logo.scale-180.png', size : 270 },
      { name : 'Square150x150Logo.scale-200.png', size : 300 },
      { name : 'Square150x150Logo.scale-240.png', size : 360 },
      { name : 'Square150x150Logo.scale-400.png', size : 600 },

      { name : 'Square310x310Logo.scale-80.png', size : 248 },
      { name : 'Square310x310Logo.scale-100.png', size : 310  },
      { name : 'Square310x310Logo.scale-125.png', size : 388  },
      { name : 'Square310x310Logo.scale-140.png', size : 434  },
      { name : 'Square310x310Logo.scale-150.png', size : 465  },
      { name : 'Square310x310Logo.scale-180.png', size : 558  },
      { name : 'Square310x310Logo.scale-200.png', size : 620  },
      { name : 'Square310x310Logo.scale-400.png', size : 1240 },

      { name : 'Wide310x150Logo.scale-80.png', size : 248, height : 120  },
      { name : 'Wide310x150Logo.scale-100.png', size : 310, height : 150  },
      { name : 'Wide310x150Logo.scale-125.png', size : 388, height : 188  },
      { name : 'Wide310x150Logo.scale-140.png', size : 434, height : 210  },
      { name : 'Wide310x150Logo.scale-150.png', size : 465, height : 225  },
      { name : 'Wide310x150Logo.scale-180.png', size : 558, height : 270  },
      { name : 'Wide310x150Logo.scale-200.png', size : 620, height : 300  },
      { name : 'Wide310x150Logo.scale-240.png', size : 744, height : 360  },
      { name : 'Wide310x150Logo.scale-400.png', size : 1240, height : 600 }
    ],
    splashPath : (settings.RESOURCE_PATH + '/' + settings.SPLASH_DIR + '/windows/').replace('//', '/'),
    platformSplashPath: 'platforms/windows/images/',
    splashes : [
      { name: 'SplashScreen.scale-100.png', width: 620,  height: 300  },
      { name: 'SplashScreen.scale-125.png', width: 775,  height: 375  },
      { name: 'SplashScreen.scale-150.png', width: 930,  height: 450  },
      { name: 'SplashScreen.scale-200.png', width: 1240, height: 600  },
      { name: 'SplashScreen.scale-400.png', width: 2480, height: 1200 }
    ]
  });
  // TODO: add missing platforms
  deferred.resolve(platforms);
  return deferred.promise;
};

/**
 * @var {Object} console utils
 */
var display = {};
display.success = function (str) {
  str = '✓  '.green + str;
  console.log('  ' + str);
};
display.error = function (str) {
  str = '✗  '.red + str;
  console.log('  ' + str);
};
display.header = function (str) {
  console.log('');
  console.log(' ' + str.cyan.underline);
  console.log('');
};

/**
 * read the config file and get the project name
 *
 * @return {Promise} resolves to a string - the project's name
 */
var getProjectName = function () {
  var deferred = Q.defer();
  var parser = new xml2js.Parser();
  fs.readFile(settings.CONFIG_FILE, function (err, data) {
    if (err) {
      deferred.reject(err);
    }
    parser.parseString(data, function (err, result) {
      if (err) {
        deferred.reject(err);
      }
      var projectName = result.widget.name[0];
      if (typeof projectName == "object") {
        projectName = projectName._.trim()
      }
      display.success('project ' + projectName + ' exists');
      deferred.resolve(projectName);
    });
  });
  return deferred.promise;
};

/**
 * Calculates MD5 hash of source file.
 *
 * @return {Promise}
 */
var calculateHash = function(filepath) {
  var deferred = Q.defer();
  var file     = fs.createReadStream(filepath);
  var hash     = crypto.createHash('sha1');

  hash.setEncoding('hex');

  // read all file and pipe it (write it) to the hash object
  file.pipe(hash);
  file.on('end', function() {
    hash.end();
    deferred.resolve(hash.read());
  });

  return deferred.promise;
};

/**
 * Create a directory. If parent directory dont exists, this will be created to.
 *
 * @return {String} with the created path
 */
var mkdirRecursive = function(dirPath) {
  var sep = path.sep;
  var array = dirPath.split(sep);
  array.splice(-1, 1); // remove file name
  var fullPath = array.join(path.sep);

  if (!fs.existsSync(fullPath)) {
    array.reduce(function(parent, child) {
      if (parent && !fs.existsSync(parent)) {
        try {
          fs.mkdirSync(path.resolve(parent));
        } catch(error) {
          console.log(error);
        }
      }
      var finalPath = path.resolve(parent, child);
      if (!fs.existsSync(finalPath)) {
        try {
          fs.mkdirSync(finalPath);
        } catch(error) {
          console.error(error);
        }
      }
      return finalPath;
    });
  }
  return fullPath;
};

/**
 * Resizes, crops (if needed) and creates a new icon in the platform's folder.
 *
 * @param  {Object} platform
 * @param  {Object} icon
 * @return {Promise}
 */
var generateIcon = function (platform, icon) {
  var deferred = Q.defer();
  var srcPath = settings.ICON_FILE;
  var platformPath = srcPath.replace(/\.png$/, '-' + platform.name + '.png');
  if (fs.existsSync(platformPath)) {
    srcPath = platformPath;
  }
  var dstPath = (settings.USE_PLATFORMS_PATH ?
    platform.platformIconsPath : platform.iconsPath) + icon.name;
  var dst = path.dirname(dstPath);
  if (!fs.existsSync(dst)) {
    fs.mkdirsSync(dst);
  }
  gm(srcPath)
  .resize(icon.size,icon.size)
  .write(dstPath, function(err){
    if (err) {
      deferred.reject(err);
      display.error('Failed to create ' + icon.name + '[' + dstPath + ']');
    } else {
      deferred.resolve();
      display.success(icon.name + ' created [' + dstPath + ']');
    }
  });
  if (icon.height) {
    gm(srcPath)
      .crop(icon.size,icon.height)
      .write(dstPath, function(err){
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
          display.success(icon.name + ' cropped');
        }
    });
  }
  return deferred.promise;
};

/**
 * Resizes, crops (if needed) and creates a new icon in the platform's folder.
 *
 * @param  {Object} platform
 * @param  {Object} icon
 * @return {Promise}
 */
var generatePushIcon = function (platform, icon) {
  var deferred = Q.defer();
  var srcPath = settings.PUSH_ICON_FILE;
  var platformPath = srcPath.replace(/\.png$/, '-' + platform.name + '.png');
  if (fs.existsSync(platformPath)) {
    srcPath = platformPath;
  }
  var dstPath = (settings.USE_PLATFORMS_PATH ?
    platform.platformPushIconsPath : platform.pushIconsPath) + icon.name;
  var dst = path.dirname(dstPath);
  if (!fs.existsSync(dst)) {
    fs.mkdirsSync(dst);
  }
  if(platform.name == 'android'){
    gm(srcPath)
    .out("-define")
    .out("png:color-type=2")
    .resize(icon.size,icon.size)
    .write(dstPath, function(err){
      if (err) {
        deferred.reject(err);
        display.error('Failed to create ' + icon.name + '[' + dstPath + ']');
      } else {
        deferred.resolve();
        display.success(icon.name + ' created [' + dstPath + ']');
      }
    });
  }
  else {
    gm(srcPath)
    .resize(icon.size,icon.size)
    .write(dstPath, function(err){
      if (err) {
        deferred.reject(err);
        display.error('Failed to create ' + icon.name + '[' + dstPath + ']');
      } else {
        deferred.resolve();
        display.success(icon.name + ' created [' + dstPath + ']');
      }
    });
  }
  if (icon.height) {
    gm(srcPath)
      .crop(icon.size,icon.height)
      .write(dstPath, function(err){
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
          display.success(icon.name + ' cropped');
        }
    });
  }
  return deferred.promise;
};

/**
 * Generates icons based on the platform object
 *
 * @param  {Object} platform
 * @return {Promise}
 */
var generateIconsForPlatform = function (platform) {
  display.header('Generating Icons for ' + platform.name);
  var all = [];
  var icons = platform.icons;
  icons.forEach(function (icon) {
    all.push(generateIcon(platform, icon));
  });
  return Promise.all(all);
};

/**
 * Generates icons based on the platform object
 *
 * @param  {Object} platform
 * @return {Promise}
 */
var generatePushIconsForPlatform = function (platform) {
  display.header('Generating Push Icons for ' + platform.name);
  var all = [];
  var icons = platform.pushIcons;
  icons.forEach(function (icon) {
    all.push(generatePushIcon(platform, icon));
  });
  return Promise.all(all);
};

/**
 * Goes over all the platforms and triggers icon generation
 *
 * @param  {Array} platforms
 * @return {Promise}
 */
var generateIcons = function (platforms) {
  var deferred = Q.defer();
  var sequence = Q();
  var all = [];
  _(platforms).where({ isAdded : true }).forEach(function (platform) {
    sequence = sequence.then(function () {
      return generateIconsForPlatform(platform);
    });
    all.push(sequence);
  });
  Q.all(all).then(function () {
    deferred.resolve();
  });
  return deferred.promise;
};

/**
 * Crops and creates a new splash in the platform's folder.
 *
 * @param  {Object} platform
 * @param  {Object} splash
 * @return {Promise}
 */
var generateSplash = function (platform, splash) {
  var deferred = Q.defer();
  var srcPath = settings.SPLASH_FILE;
  var platformPath = srcPath.replace(/\.png$/, '-' + platform.name + '.png');
  if (fs.existsSync(platformPath)) {
    srcPath = platformPath;
  }
  var dstPath = (settings.USE_PLATFORMS_PATH ?
    platform.platformSplashPath : platform.splashPath) + splash.name;
  var dst = path.dirname(dstPath);
  if (!fs.existsSync(dst)) {
    fs.mkdirsSync(dst);
  }
  var x = (Math.max(splash.width, splash.height) - splash.width)/2;
  var y = (Math.max(splash.width, splash.height) - splash.height)/2;
  gm(srcPath)
    .resize(Math.max(splash.width, splash.height))
    .crop(splash.width, splash.height,x,y)
    .write(dstPath, function(err){
      if (err) {
        deferred.reject(err);
        display.error('Failed to create ' + splash.name + '[' + dstPath + ']');
      } else {
        deferred.resolve();
        display.success(splash.name + ' created [' + dstPath + ']');
      }
  });
  return deferred.promise;
};

/**
 * Generates splash based on the platform object
 *
 * @param  {Object} platform
 * @return {Promise}
 */
var generateSplashForPlatform = function (platform) {
  display.header('Generating splash screen for ' + platform.name);
  var all = [];
  var splashes = platform.splashes;
  splashes.forEach(function (splash) {
    all.push(generateSplash(platform, splash));
  });
  return Promise.all(all);
};

/**
 * Goes over all the platforms and triggers splash screen generation
 *
 * @param  {Array} platforms
 * @return {Promise}
 */
var generateSplashes = function (platforms) {
  var deferred = Q.defer();
  var sequence = Q();
  var all = [];
  _(platforms).where({ isAdded : true }).forEach(function (platform) {
    sequence = sequence.then(function () {
      return generateSplashForPlatform(platform);
    });
    all.push(sequence);
  });
  Q.all(all).then(function () {
    deferred.resolve();
  });
  return deferred.promise;
};

/**
 * Goes over all the platforms and triggers splash screen generation
 *
 * @param  {Array} platforms
 * @return {Promise}
 */
var generateResources = function (platforms) {
  var deferred = Q.defer();
  var sequence = Q();
  var all = [];
  _(platforms).where({ isAdded : true }).forEach(function (platform) {
    sequence = sequence.then(function () {
      if(settings.GEN_ICON) {
        return generateIconsForPlatform(platform);
      }
    }).then(function () {
      if(settings.GEN_SPLASH) {
        return generateSplashForPlatform(platform);
      }
    }).then(function () {
      if(settings.GEN_PUSH_ICON) {
        return generatePushIconsForPlatform(platform);
      }
    });
    all.push(sequence);
  });
  Q.all(all).then(function () {
    deferred.resolve();
  }).catch(function (err) {
    if (err) {
      deferred.reject(err);
    }
  });
  return deferred.promise;
};


/**
 * Checks if at least one platform was added to the project
 *
 * @return {Promise} resolves if at least one platform was found, rejects otherwise
 */
var atLeastOnePlatformFound = function () {
  var deferred = Q.defer();
  getPlatforms().then(function (platforms) {
    var activePlatforms = _(platforms).where({ isAdded : true });
    if (activePlatforms.length > 0) {
      display.success('platforms found: ' + _(activePlatforms).pluck('name').join(', '));
      deferred.resolve();
    } else {
      display.error('No cordova platforms found. ' +
                    'Make sure you are in the root folder of your Cordova project ' +
                    'and add platforms with \'cordova platform add\'');
      deferred.reject();
    }
  });
  return deferred.promise;
};

/**
 * Checks if a valid icon file exists
 *
 * @return {Promise} resolves if exists, rejects otherwise
 */
var validIconExists = function () {
  var deferred = Q.defer();
  fs.exists(settings.ICON_FILE, function (exists) {
    if (exists) {
      display.success(settings.ICON_FILE + ' exists');
      deferred.resolve();
    } else {
      display.error(settings.ICON_FILE + ' does not exist');
      deferred.reject();
    }
  });
  return deferred.promise;
};


/**
 * Checks if a valid splash file exists
 *
 * @return {Promise} resolves if exists, rejects otherwise
 */
var validSplashExists = function () {
  var deferred = Q.defer();
  fs.exists(settings.SPLASH_FILE, function (exists) {
    if (exists) {
      display.success(settings.SPLASH_FILE + ' exists');
      deferred.resolve();
    } else {
      display.error(settings.SPLASH_FILE + ' does not exist in the root folder');
      deferred.reject();
    }
  });
  return deferred.promise;
};

/**
 * Checks if a config.xml file exists
 *
 * @return {Promise} resolves if exists, rejects otherwise
 */
var configFileExists = function () {
  var deferred = Q.defer();
  fs.exists(settings.CONFIG_FILE, function (exists) {
    if (exists) {
      display.success(settings.CONFIG_FILE + ' exists');
      deferred.resolve();
    } else {
      display.error('cordova\'s ' + settings.CONFIG_FILE + ' does not exist');
      deferred.reject();
    }
  });
  return deferred.promise;
};

display.header('Checking Project, Splash & Icon');

atLeastOnePlatformFound()
  .then(validIconExists)
  .then(validSplashExists)
  .then(configFileExists)
  .then(getProjectName)
  .then(getPlatforms)
  .then(generateResources)
  .catch(function (err) {
    if (err) {
      console.log(err);
    }
  }).then(function () {
    console.log('');
  });
