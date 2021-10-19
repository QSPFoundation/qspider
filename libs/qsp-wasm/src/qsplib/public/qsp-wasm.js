var Module = (function () {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;

  return function (Module) {
    Module = Module || {};

    // The Module object: Our interface to the outside world. We import
    // and export values on it. There are various ways Module can be used:
    // 1. Not defined. We create it here
    // 2. A function parameter, function(Module) { ..generated code.. }
    // 3. pre-run appended it, var Module = {}; ..generated code..
    // 4. External script tag defines var Module.
    // We need to check if Module already exists (e.g. case 3 above).
    // Substitution will be replaced with actual code on later stage of the build,
    // this way Closure Compiler will not mangle it (e.g. case 4. above).
    // Note that if you want to run closure, and also to use Module
    // after the generated code, you will need to define   var Module = {};
    // before the code. Then that object will be used in the code, and you
    // can continue to use Module afterwards as well.
    var Module = typeof Module !== 'undefined' ? Module : {};

    // Set up the promise that indicates the Module is initialized
    var readyPromiseResolve, readyPromiseReject;
    Module['ready'] = new Promise(function (resolve, reject) {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_main')) {
      Object.defineProperty(Module['ready'], '_main', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _main on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_main', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _main on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_emscripten_stack_get_base')) {
      Object.defineProperty(Module['ready'], '_emscripten_stack_get_base', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _emscripten_stack_get_base on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_emscripten_stack_get_base', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _emscripten_stack_get_base on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_emscripten_stack_get_end')) {
      Object.defineProperty(Module['ready'], '_emscripten_stack_get_end', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _emscripten_stack_get_end on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_emscripten_stack_get_end', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _emscripten_stack_get_end on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_emscripten_stack_set_limits')) {
      Object.defineProperty(Module['ready'], '_emscripten_stack_set_limits', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _emscripten_stack_set_limits on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_emscripten_stack_set_limits', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _emscripten_stack_set_limits on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_emscripten_stack_get_free')) {
      Object.defineProperty(Module['ready'], '_emscripten_stack_get_free', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _emscripten_stack_get_free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_emscripten_stack_get_free', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _emscripten_stack_get_free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_emscripten_stack_init')) {
      Object.defineProperty(Module['ready'], '_emscripten_stack_init', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _emscripten_stack_init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_emscripten_stack_init', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _emscripten_stack_init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_stackSave')) {
      Object.defineProperty(Module['ready'], '_stackSave', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _stackSave on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_stackSave', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _stackSave on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_stackRestore')) {
      Object.defineProperty(Module['ready'], '_stackRestore', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _stackRestore on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_stackRestore', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _stackRestore on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_stackAlloc')) {
      Object.defineProperty(Module['ready'], '_stackAlloc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _stackAlloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_stackAlloc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _stackAlloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '___wasm_call_ctors')) {
      Object.defineProperty(Module['ready'], '___wasm_call_ctors', {
        configurable: true,
        get: function () {
          abort(
            'You are getting ___wasm_call_ctors on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '___wasm_call_ctors', {
        configurable: true,
        set: function () {
          abort(
            'You are setting ___wasm_call_ctors on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_fflush')) {
      Object.defineProperty(Module['ready'], '_fflush', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_fflush', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '___errno_location')) {
      Object.defineProperty(Module['ready'], '___errno_location', {
        configurable: true,
        get: function () {
          abort(
            'You are getting ___errno_location on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '___errno_location', {
        configurable: true,
        set: function () {
          abort(
            'You are setting ___errno_location on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_malloc')) {
      Object.defineProperty(Module['ready'], '_malloc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _malloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_malloc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _malloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_free')) {
      Object.defineProperty(Module['ready'], '_free', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_free', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '__get_tzname')) {
      Object.defineProperty(Module['ready'], '__get_tzname', {
        configurable: true,
        get: function () {
          abort(
            'You are getting __get_tzname on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '__get_tzname', {
        configurable: true,
        set: function () {
          abort(
            'You are setting __get_tzname on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '__get_daylight')) {
      Object.defineProperty(Module['ready'], '__get_daylight', {
        configurable: true,
        get: function () {
          abort(
            'You are getting __get_daylight on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '__get_daylight', {
        configurable: true,
        set: function () {
          abort(
            'You are setting __get_daylight on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '__get_timezone')) {
      Object.defineProperty(Module['ready'], '__get_timezone', {
        configurable: true,
        get: function () {
          abort(
            'You are getting __get_timezone on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '__get_timezone', {
        configurable: true,
        set: function () {
          abort(
            'You are setting __get_timezone on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_saveSetjmp')) {
      Object.defineProperty(Module['ready'], '_saveSetjmp', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _saveSetjmp on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_saveSetjmp', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _saveSetjmp on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_setThrew')) {
      Object.defineProperty(Module['ready'], '_setThrew', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _setThrew on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_setThrew', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _setThrew on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_init')) {
      Object.defineProperty(Module['ready'], '_init', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_init', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_dispose')) {
      Object.defineProperty(Module['ready'], '_dispose', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _dispose on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_dispose', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _dispose on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getVersion')) {
      Object.defineProperty(Module['ready'], '_getVersion', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getVersion on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getVersion', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getVersion on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_setErrorCallback')) {
      Object.defineProperty(Module['ready'], '_setErrorCallback', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _setErrorCallback on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_setErrorCallback', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _setErrorCallback on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getMainDesc')) {
      Object.defineProperty(Module['ready'], '_getMainDesc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getMainDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getMainDesc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getMainDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_isMainDescChanged')) {
      Object.defineProperty(Module['ready'], '_isMainDescChanged', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _isMainDescChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_isMainDescChanged', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _isMainDescChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getVarsDesc')) {
      Object.defineProperty(Module['ready'], '_getVarsDesc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getVarsDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getVarsDesc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getVarsDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_isVarsDescChanged')) {
      Object.defineProperty(Module['ready'], '_isVarsDescChanged', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _isVarsDescChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_isVarsDescChanged', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _isVarsDescChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getActions')) {
      Object.defineProperty(Module['ready'], '_getActions', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getActions on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getActions', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getActions on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_selectAction')) {
      Object.defineProperty(Module['ready'], '_selectAction', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _selectAction on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_selectAction', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _selectAction on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_executeSelAction')) {
      Object.defineProperty(Module['ready'], '_executeSelAction', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _executeSelAction on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_executeSelAction', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _executeSelAction on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_isActionsChanged')) {
      Object.defineProperty(Module['ready'], '_isActionsChanged', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _isActionsChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_isActionsChanged', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _isActionsChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getObjects')) {
      Object.defineProperty(Module['ready'], '_getObjects', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getObjects on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getObjects', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getObjects on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_selectObject')) {
      Object.defineProperty(Module['ready'], '_selectObject', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _selectObject on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_selectObject', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _selectObject on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_isObjectsChanged')) {
      Object.defineProperty(Module['ready'], '_isObjectsChanged', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _isObjectsChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_isObjectsChanged', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _isObjectsChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_loadGameData')) {
      Object.defineProperty(Module['ready'], '_loadGameData', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _loadGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_loadGameData', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _loadGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_restartGame')) {
      Object.defineProperty(Module['ready'], '_restartGame', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _restartGame on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_restartGame', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _restartGame on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_saveGameData')) {
      Object.defineProperty(Module['ready'], '_saveGameData', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _saveGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_saveGameData', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _saveGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_loadSavedGameData')) {
      Object.defineProperty(Module['ready'], '_loadSavedGameData', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _loadSavedGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_loadSavedGameData', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _loadSavedGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_execString')) {
      Object.defineProperty(Module['ready'], '_execString', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _execString on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_execString', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _execString on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_execCounter')) {
      Object.defineProperty(Module['ready'], '_execCounter', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _execCounter on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_execCounter', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _execCounter on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_execLoc')) {
      Object.defineProperty(Module['ready'], '_execLoc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _execLoc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_execLoc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _execLoc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_execUserInput')) {
      Object.defineProperty(Module['ready'], '_execUserInput', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _execUserInput on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_execUserInput', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _execUserInput on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getLastErrorData')) {
      Object.defineProperty(Module['ready'], '_getLastErrorData', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getLastErrorData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getLastErrorData', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getLastErrorData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getErrorDesc')) {
      Object.defineProperty(Module['ready'], '_getErrorDesc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getErrorDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getErrorDesc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getErrorDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getVarStringValue')) {
      Object.defineProperty(Module['ready'], '_getVarStringValue', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getVarStringValue on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getVarStringValue', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getVarStringValue on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getVarNumValue')) {
      Object.defineProperty(Module['ready'], '_getVarNumValue', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getVarNumValue on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getVarNumValue', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getVarNumValue on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_initCallBacks')) {
      Object.defineProperty(Module['ready'], '_initCallBacks', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _initCallBacks on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_initCallBacks', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _initCallBacks on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_setCallBack')) {
      Object.defineProperty(Module['ready'], '_setCallBack', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _setCallBack on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_setCallBack', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _setCallBack on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_freeItemsList')) {
      Object.defineProperty(Module['ready'], '_freeItemsList', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _freeItemsList on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_freeItemsList', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _freeItemsList on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_freeSaveBuffer')) {
      Object.defineProperty(Module['ready'], '_freeSaveBuffer', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _freeSaveBuffer on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_freeSaveBuffer', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _freeSaveBuffer on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], '___set_stack_limits')) {
      Object.defineProperty(Module['ready'], '___set_stack_limits', {
        configurable: true,
        get: function () {
          abort(
            'You are getting ___set_stack_limits on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '___set_stack_limits', {
        configurable: true,
        set: function () {
          abort(
            'You are setting ___set_stack_limits on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module['ready'], 'onRuntimeInitialized')) {
      Object.defineProperty(Module['ready'], 'onRuntimeInitialized', {
        configurable: true,
        get: function () {
          abort(
            'You are getting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], 'onRuntimeInitialized', {
        configurable: true,
        set: function () {
          abort(
            'You are setting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }

    // --pre-jses are emitted after the Module integration code, so that they can
    // refer to Module (if they choose; they can also define Module)
    // {{PRE_JSES}}

    // Sometimes an existing Module object exists with properties
    // meant to overwrite the default module functionality. Here
    // we collect those properties and reapply _after_ we configure
    // the current environment's defaults to avoid having to be so
    // defensive during initialization.
    var moduleOverrides = {};
    var key;
    for (key in Module) {
      if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key];
      }
    }

    var arguments_ = [];
    var thisProgram = './this.program';
    var quit_ = function (status, toThrow) {
      throw toThrow;
    };

    // Determine the runtime environment we are in. You can customize this by
    // setting the ENVIRONMENT setting at compile time (see settings.js).

    // Attempt to auto-detect the environment
    var ENVIRONMENT_IS_WEB = typeof window === 'object';
    var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
    // N.b. Electron.js environment is simultaneously a NODE-environment, but
    // also a web environment.
    var ENVIRONMENT_IS_NODE =
      typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
    var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

    if (Module['ENVIRONMENT']) {
      throw new Error(
        'Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)'
      );
    }

    // `/` should be present at the end if `scriptDirectory` is not empty
    var scriptDirectory = '';
    function locateFile(path) {
      if (Module['locateFile']) {
        return Module['locateFile'](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }

    // Hooks that are implemented differently in different runtime environments.
    var read_, readAsync, readBinary, setWindowTitle;

    if (ENVIRONMENT_IS_SHELL) {
      if (
        (typeof process === 'object' && typeof require === 'function') ||
        typeof window === 'object' ||
        typeof importScripts === 'function'
      )
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );

      if (typeof read != 'undefined') {
        read_ = function shell_read(f) {
          return read(f);
        };
      }

      readBinary = function readBinary(f) {
        var data;
        if (typeof readbuffer === 'function') {
          return new Uint8Array(readbuffer(f));
        }
        data = read(f, 'binary');
        assert(typeof data === 'object');
        return data;
      };

      readAsync = function readAsync(f, onload, onerror) {
        setTimeout(function () {
          onload(readBinary(f));
        }, 0);
      };

      if (typeof scriptArgs != 'undefined') {
        arguments_ = scriptArgs;
      } else if (typeof arguments != 'undefined') {
        arguments_ = arguments;
      }

      if (typeof quit === 'function') {
        quit_ = function (status) {
          quit(status);
        };
      }

      if (typeof print !== 'undefined') {
        // Prefer to use print/printErr where they exist, as they usually work better.
        if (typeof console === 'undefined') console = /** @type{!Console} */ ({});
        console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
        console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (
          typeof printErr !== 'undefined' ? printErr : print
        );
      }
    }

    // Note that this includes Node.js workers when relevant (pthreads is enabled).
    // Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
    // ENVIRONMENT_IS_NODE.
    else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        // Check worker, not web, since window could be polyfilled
        scriptDirectory = self.location.href;
      } else if (typeof document !== 'undefined' && document.currentScript) {
        // web
        scriptDirectory = document.currentScript.src;
      }
      // When MODULARIZE, this JS may be executed later, after document.currentScript
      // is gone, so we saved it, and we use it here instead of any other info.
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
      // otherwise, slice off the final part of the url to find the script directory.
      // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
      // and scriptDirectory will correctly be replaced with an empty string.
      if (scriptDirectory.indexOf('blob:') !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/') + 1);
      } else {
        scriptDirectory = '';
      }

      if (!(typeof window === 'object' || typeof importScripts === 'function'))
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );

      // Differentiate the Web Worker from the Node Worker case, as reading must
      // be done differently.
      {
        // include: web_or_worker_shell_read.js

        read_ = function (url) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false);
          xhr.send(null);
          return xhr.responseText;
        };

        if (ENVIRONMENT_IS_WORKER) {
          readBinary = function (url) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.responseType = 'arraybuffer';
            xhr.send(null);
            return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
          };
        }

        readAsync = function (url, onload, onerror) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.responseType = 'arraybuffer';
          xhr.onload = function () {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              // file URLs can return 0
              onload(xhr.response);
              return;
            }
            onerror();
          };
          xhr.onerror = onerror;
          xhr.send(null);
        };

        // end include: web_or_worker_shell_read.js
      }

      setWindowTitle = function (title) {
        document.title = title;
      };
    } else {
      throw new Error('environment detection error');
    }

    // Set up the out() and err() hooks, which are how we can print to stdout or
    // stderr, respectively.
    var out = Module['print'] || console.log.bind(console);
    var err = Module['printErr'] || console.warn.bind(console);

    // Merge back in the overrides
    for (key in moduleOverrides) {
      if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key];
      }
    }
    // Free the object hierarchy contained in the overrides, this lets the GC
    // reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
    moduleOverrides = null;

    // Emit code to handle expected values on the Module object. This applies Module.x
    // to the proper local x. This has two benefits: first, we only emit it if it is
    // expected to arrive, and second, by using a local everywhere else that can be
    // minified.

    if (Module['arguments']) arguments_ = Module['arguments'];
    if (!Object.getOwnPropertyDescriptor(Module, 'arguments')) {
      Object.defineProperty(Module, 'arguments', {
        configurable: true,
        get: function () {
          abort(
            'Module.arguments has been replaced with plain arguments_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }

    if (Module['thisProgram']) thisProgram = Module['thisProgram'];
    if (!Object.getOwnPropertyDescriptor(Module, 'thisProgram')) {
      Object.defineProperty(Module, 'thisProgram', {
        configurable: true,
        get: function () {
          abort(
            'Module.thisProgram has been replaced with plain thisProgram (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }

    if (Module['quit']) quit_ = Module['quit'];
    if (!Object.getOwnPropertyDescriptor(Module, 'quit')) {
      Object.defineProperty(Module, 'quit', {
        configurable: true,
        get: function () {
          abort(
            'Module.quit has been replaced with plain quit_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }

    // perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
    // Assertions on removed incoming Module JS APIs.
    assert(
      typeof Module['memoryInitializerPrefixURL'] === 'undefined',
      'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['pthreadMainPrefixURL'] === 'undefined',
      'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['cdInitializerPrefixURL'] === 'undefined',
      'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['filePackagePrefixURL'] === 'undefined',
      'Module.filePackagePrefixURL option was removed, use Module.locateFile instead'
    );
    assert(typeof Module['read'] === 'undefined', 'Module.read option was removed (modify read_ in JS)');
    assert(typeof Module['readAsync'] === 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
    assert(
      typeof Module['readBinary'] === 'undefined',
      'Module.readBinary option was removed (modify readBinary in JS)'
    );
    assert(
      typeof Module['setWindowTitle'] === 'undefined',
      'Module.setWindowTitle option was removed (modify setWindowTitle in JS)'
    );
    assert(typeof Module['TOTAL_MEMORY'] === 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');

    if (!Object.getOwnPropertyDescriptor(Module, 'read')) {
      Object.defineProperty(Module, 'read', {
        configurable: true,
        get: function () {
          abort(
            'Module.read has been replaced with plain read_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module, 'readAsync')) {
      Object.defineProperty(Module, 'readAsync', {
        configurable: true,
        get: function () {
          abort(
            'Module.readAsync has been replaced with plain readAsync (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module, 'readBinary')) {
      Object.defineProperty(Module, 'readBinary', {
        configurable: true,
        get: function () {
          abort(
            'Module.readBinary has been replaced with plain readBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }

    if (!Object.getOwnPropertyDescriptor(Module, 'setWindowTitle')) {
      Object.defineProperty(Module, 'setWindowTitle', {
        configurable: true,
        get: function () {
          abort(
            'Module.setWindowTitle has been replaced with plain setWindowTitle (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }
    var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
    var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
    var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
    var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';
    function alignMemory() {
      abort(
        '`alignMemory` is now a library function and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line'
      );
    }

    assert(
      !ENVIRONMENT_IS_NODE,
      "node environment detected but not enabled at build time.  Add 'node' to `-s ENVIRONMENT` to enable."
    );

    assert(
      !ENVIRONMENT_IS_SHELL,
      "shell environment detected but not enabled at build time.  Add 'shell' to `-s ENVIRONMENT` to enable."
    );

    var STACK_ALIGN = 16;

    function getNativeTypeSize(type) {
      switch (type) {
        case 'i1':
        case 'i8':
          return 1;
        case 'i16':
          return 2;
        case 'i32':
          return 4;
        case 'i64':
          return 8;
        case 'float':
          return 4;
        case 'double':
          return 8;
        default: {
          if (type[type.length - 1] === '*') {
            return 4; // A pointer
          } else if (type[0] === 'i') {
            var bits = Number(type.substr(1));
            assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
            return bits / 8;
          } else {
            return 0;
          }
        }
      }
    }

    function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }

    // include: runtime_functions.js

    // Wraps a JS function as a wasm function with a given signature.
    function convertJsFunctionToWasm(func, sig) {
      // If the type reflection proposal is available, use the new
      // "WebAssembly.Function" constructor.
      // Otherwise, construct a minimal wasm module importing the JS function and
      // re-exporting it.
      if (typeof WebAssembly.Function === 'function') {
        var typeNames = {
          i: 'i32',
          j: 'i64',
          f: 'f32',
          d: 'f64',
        };
        var type = {
          parameters: [],
          results: sig[0] == 'v' ? [] : [typeNames[sig[0]]],
        };
        for (var i = 1; i < sig.length; ++i) {
          type.parameters.push(typeNames[sig[i]]);
        }
        return new WebAssembly.Function(type, func);
      }

      // The module is static, with the exception of the type section, which is
      // generated based on the signature passed in.
      var typeSection = [
        0x01, // id: section,
        0x00, // length: 0 (placeholder)
        0x01, // count: 1
        0x60, // form: func
      ];
      var sigRet = sig.slice(0, 1);
      var sigParam = sig.slice(1);
      var typeCodes = {
        i: 0x7f, // i32
        j: 0x7e, // i64
        f: 0x7d, // f32
        d: 0x7c, // f64
      };

      // Parameters, length + signatures
      typeSection.push(sigParam.length);
      for (var i = 0; i < sigParam.length; ++i) {
        typeSection.push(typeCodes[sigParam[i]]);
      }

      // Return values, length + signatures
      // With no multi-return in MVP, either 0 (void) or 1 (anything else)
      if (sigRet == 'v') {
        typeSection.push(0x00);
      } else {
        typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
      }

      // Write the overall length of the type section back into the section header
      // (excepting the 2 bytes for the section id and length)
      typeSection[1] = typeSection.length - 2;

      // Rest of the module is static
      var bytes = new Uint8Array(
        [
          0x00,
          0x61,
          0x73,
          0x6d, // magic ("\0asm")
          0x01,
          0x00,
          0x00,
          0x00, // version: 1
        ].concat(typeSection, [
          0x02,
          0x07, // import section
          // (import "e" "f" (func 0 (type 0)))
          0x01,
          0x01,
          0x65,
          0x01,
          0x66,
          0x00,
          0x00,
          0x07,
          0x05, // export section
          // (export "f" (func 0 (type 0)))
          0x01,
          0x01,
          0x66,
          0x00,
          0x00,
        ])
      );

      // We can compile this wasm module synchronously because it is very small.
      // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
      var module = new WebAssembly.Module(bytes);
      var instance = new WebAssembly.Instance(module, {
        e: {
          f: func,
        },
      });
      var wrappedFunc = instance.exports['f'];
      return wrappedFunc;
    }

    var freeTableIndexes = [];

    // Weak map of functions in the table to their indexes, created on first use.
    var functionsInTableMap;

    function getEmptyTableSlot() {
      // Reuse a free index if there is one, otherwise grow.
      if (freeTableIndexes.length) {
        return freeTableIndexes.pop();
      }
      // Grow the table
      try {
        wasmTable.grow(1);
      } catch (err) {
        if (!(err instanceof RangeError)) {
          throw err;
        }
        throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
      }
      return wasmTable.length - 1;
    }

    // Add a wasm function to the table.
    function addFunctionWasm(func, sig) {
      // Check if the function is already in the table, to ensure each function
      // gets a unique index. First, create the map if this is the first use.
      if (!functionsInTableMap) {
        functionsInTableMap = new WeakMap();
        for (var i = 0; i < wasmTable.length; i++) {
          var item = wasmTable.get(i);
          // Ignore null values.
          if (item) {
            functionsInTableMap.set(item, i);
          }
        }
      }
      if (functionsInTableMap.has(func)) {
        return functionsInTableMap.get(func);
      }

      // It's not in the table, add it now.

      var ret = getEmptyTableSlot();

      // Set the new value.
      try {
        // Attempting to call this with JS function will cause of table.set() to fail
        wasmTable.set(ret, func);
      } catch (err) {
        if (!(err instanceof TypeError)) {
          throw err;
        }
        assert(typeof sig !== 'undefined', 'Missing signature argument to addFunction: ' + func);
        var wrapped = convertJsFunctionToWasm(func, sig);
        wasmTable.set(ret, wrapped);
      }

      functionsInTableMap.set(func, ret);

      return ret;
    }

    function removeFunction(index) {
      functionsInTableMap.delete(wasmTable.get(index));
      freeTableIndexes.push(index);
    }

    // 'sig' parameter is required for the llvm backend but only when func is not
    // already a WebAssembly function.
    function addFunction(func, sig) {
      assert(typeof func !== 'undefined');

      return addFunctionWasm(func, sig);
    }

    // end include: runtime_functions.js
    // include: runtime_debug.js

    // end include: runtime_debug.js
    var tempRet0 = 0;

    var setTempRet0 = function (value) {
      tempRet0 = value;
    };

    var getTempRet0 = function () {
      return tempRet0;
    };

    // === Preamble library stuff ===

    // Documentation for the public APIs defined in this file must be updated in:
    //    site/source/docs/api_reference/preamble.js.rst
    // A prebuilt local version of the documentation is available at:
    //    site/build/text/docs/api_reference/preamble.js.txt
    // You can also build docs locally as HTML or other formats in site/
    // An online HTML version (which may be of a different version of Emscripten)
    //    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

    var wasmBinary;
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
    if (!Object.getOwnPropertyDescriptor(Module, 'wasmBinary')) {
      Object.defineProperty(Module, 'wasmBinary', {
        configurable: true,
        get: function () {
          abort(
            'Module.wasmBinary has been replaced with plain wasmBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }
    var noExitRuntime = Module['noExitRuntime'] || true;
    if (!Object.getOwnPropertyDescriptor(Module, 'noExitRuntime')) {
      Object.defineProperty(Module, 'noExitRuntime', {
        configurable: true,
        get: function () {
          abort(
            'Module.noExitRuntime has been replaced with plain noExitRuntime (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }

    if (typeof WebAssembly !== 'object') {
      abort('no native wasm support detected');
    }

    // include: runtime_safe_heap.js

    // In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
    // In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

    /** @param {number} ptr
    @param {number} value
    @param {string} type
    @param {number|boolean=} noSafe */
    function setValue(ptr, value, type, noSafe) {
      type = type || 'i8';
      if (type.charAt(type.length - 1) === '*') type = 'i32'; // pointers are 32-bit
      switch (type) {
        case 'i1':
          HEAP8[ptr >> 0] = value;
          break;
        case 'i8':
          HEAP8[ptr >> 0] = value;
          break;
        case 'i16':
          HEAP16[ptr >> 1] = value;
          break;
        case 'i32':
          HEAP32[ptr >> 2] = value;
          break;
        case 'i64':
          (tempI64 = [
            value >>> 0,
            ((tempDouble = value),
            +Math.abs(tempDouble) >= 1.0
              ? tempDouble > 0.0
                ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0
              : 0),
          ]),
            (HEAP32[ptr >> 2] = tempI64[0]),
            (HEAP32[(ptr + 4) >> 2] = tempI64[1]);
          break;
        case 'float':
          HEAPF32[ptr >> 2] = value;
          break;
        case 'double':
          HEAPF64[ptr >> 3] = value;
          break;
        default:
          abort('invalid type for setValue: ' + type);
      }
    }

    /** @param {number} ptr
    @param {string} type
    @param {number|boolean=} noSafe */
    function getValue(ptr, type, noSafe) {
      type = type || 'i8';
      if (type.charAt(type.length - 1) === '*') type = 'i32'; // pointers are 32-bit
      switch (type) {
        case 'i1':
          return HEAP8[ptr >> 0];
        case 'i8':
          return HEAP8[ptr >> 0];
        case 'i16':
          return HEAP16[ptr >> 1];
        case 'i32':
          return HEAP32[ptr >> 2];
        case 'i64':
          return HEAP32[ptr >> 2];
        case 'float':
          return HEAPF32[ptr >> 2];
        case 'double':
          return HEAPF64[ptr >> 3];
        default:
          abort('invalid type for getValue: ' + type);
      }
      return null;
    }

    // end include: runtime_safe_heap.js
    // Wasm globals

    var wasmMemory;

    //========================================
    // Runtime essentials
    //========================================

    // whether we are quitting the application. no code should run after this.
    // set in exit() and abort()
    var ABORT = false;

    // set by exit() and abort().  Passed to 'onExit' handler.
    // NOTE: This is also used as the process return code code in shell environments
    // but only when noExitRuntime is false.
    var EXITSTATUS;

    /** @type {function(*, string=)} */
    function assert(condition, text) {
      if (!condition) {
        abort('Assertion failed: ' + text);
      }
    }

    // Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
    function getCFunc(ident) {
      var func = Module['_' + ident]; // closure exported function
      assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
      return func;
    }

    // C calling interface.
    /** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
    function ccall(ident, returnType, argTypes, args, opts) {
      // For fast lookup of conversion functions
      var toC = {
        string: function (str) {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) {
            // null string
            // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
            var len = (str.length << 2) + 1;
            ret = stackAlloc(len);
            stringToUTF8(str, ret, len);
          }
          return ret;
        },
        array: function (arr) {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        },
      };

      function convertReturnValue(ret) {
        if (returnType === 'string') return UTF8ToString(ret);
        if (returnType === 'boolean') return Boolean(ret);
        return ret;
      }

      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      assert(returnType !== 'array', 'Return type should not be "array".');
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func.apply(null, cArgs);
      function onDone(ret) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
      }
      var asyncMode = opts && opts.async;
      // Check if we started an async operation just now.
      if (Asyncify.currData) {
        // If so, the WASM function ran asynchronous and unwound its stack.
        // We need to return a Promise that resolves the return value
        // once the stack is rewound and execution finishes.
        assert(
          asyncMode,
          'The call to ' +
            ident +
            ' is running asynchronously. If this was intended, add the async option to the ccall/cwrap call.'
        );
        return Asyncify.whenDone().then(onDone);
      }

      ret = onDone(ret);
      // If this is an async ccall, ensure we return a promise
      if (asyncMode) return Promise.resolve(ret);
      return ret;
    }

    /** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
    function cwrap(ident, returnType, argTypes, opts) {
      return function () {
        return ccall(ident, returnType, argTypes, arguments, opts);
      };
    }

    // We used to include malloc/free by default in the past. Show a helpful error in
    // builds with assertions.

    var ALLOC_NORMAL = 0; // Tries to use _malloc()
    var ALLOC_STACK = 1; // Lives for the duration of the current function call

    // allocate(): This is for internal use. You can use it yourself as well, but the interface
    //             is a little tricky (see docs right below). The reason is that it is optimized
    //             for multiple syntaxes to save space in generated code. So you should
    //             normally not use allocate(), and instead allocate memory using _malloc(),
    //             initialize it with setValue(), and so forth.
    // @slab: An array of data.
    // @allocator: How to allocate memory, see ALLOC_*
    /** @type {function((Uint8Array|Array<number>), number)} */
    function allocate(slab, allocator) {
      var ret;
      assert(typeof allocator === 'number', 'allocate no longer takes a type argument');
      assert(typeof slab !== 'number', 'allocate no longer takes a number as arg0');

      if (allocator == ALLOC_STACK) {
        ret = stackAlloc(slab.length);
      } else {
        ret = _malloc(slab.length);
      }

      if (slab.subarray || slab.slice) {
        HEAPU8.set(/** @type {!Uint8Array} */ (slab), ret);
      } else {
        HEAPU8.set(new Uint8Array(slab), ret);
      }
      return ret;
    }

    // include: runtime_strings.js

    // runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

    // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
    // a copy of that string as a Javascript String object.

    var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

    /**
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
    function UTF8ArrayToString(heap, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
      // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
      while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

      if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(heap.subarray(idx, endPtr));
      } else {
        var str = '';
        // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
        while (idx < endPtr) {
          // For UTF8 byte structure, see:
          // http://en.wikipedia.org/wiki/UTF-8#Description
          // https://www.ietf.org/rfc/rfc2279.txt
          // https://tools.ietf.org/html/rfc3629
          var u0 = heap[idx++];
          if (!(u0 & 0x80)) {
            str += String.fromCharCode(u0);
            continue;
          }
          var u1 = heap[idx++] & 63;
          if ((u0 & 0xe0) == 0xc0) {
            str += String.fromCharCode(((u0 & 31) << 6) | u1);
            continue;
          }
          var u2 = heap[idx++] & 63;
          if ((u0 & 0xf0) == 0xe0) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
          } else {
            if ((u0 & 0xf8) != 0xf0)
              warnOnce(
                'Invalid UTF-8 leading byte 0x' +
                  u0.toString(16) +
                  ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!'
              );
            u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
          }

          if (u0 < 0x10000) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 0x10000;
            str += String.fromCharCode(0xd800 | (ch >> 10), 0xdc00 | (ch & 0x3ff));
          }
        }
      }
      return str;
    }

    // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
    // copy of that string as a Javascript String object.
    // maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
    //                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
    //                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
    //                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
    //                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
    //                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
    //                 throw JS JIT optimizations off, so it is worth to consider consistently using one
    //                 style or the other.
    /**
     * @param {number} ptr
     * @param {number=} maxBytesToRead
     * @return {string}
     */
    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    }

    // Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
    // encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
    // Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
    // Parameters:
    //   str: the Javascript string to copy.
    //   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
    //   outIdx: The starting offset in the array to begin the copying.
    //   maxBytesToWrite: The maximum number of bytes this function can write to the array.
    //                    This count should include the null terminator,
    //                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
    //                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
    // Returns the number of bytes written, EXCLUDING the null terminator.

    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0))
        // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
        return 0;

      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt(i); // possibly a lead surrogate
        if (u >= 0xd800 && u <= 0xdfff) {
          var u1 = str.charCodeAt(++i);
          u = (0x10000 + ((u & 0x3ff) << 10)) | (u1 & 0x3ff);
        }
        if (u <= 0x7f) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7ff) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xc0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xffff) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xe0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          if (u > 0x10ffff)
            warnOnce(
              'Invalid Unicode code point 0x' +
                u.toString(16) +
                ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).'
            );
          heap[outIdx++] = 0xf0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }

    // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
    // null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
    // Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
    // Returns the number of bytes written, EXCLUDING the null terminator.

    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      assert(
        typeof maxBytesToWrite == 'number',
        'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
      );
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }

    // Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
    function lengthBytesUTF8(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var u = str.charCodeAt(i); // possibly a lead surrogate
        if (u >= 0xd800 && u <= 0xdfff) u = (0x10000 + ((u & 0x3ff) << 10)) | (str.charCodeAt(++i) & 0x3ff);
        if (u <= 0x7f) ++len;
        else if (u <= 0x7ff) len += 2;
        else if (u <= 0xffff) len += 3;
        else len += 4;
      }
      return len;
    }

    // end include: runtime_strings.js
    // include: runtime_strings_extra.js

    // runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

    // Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
    // a copy of that string as a Javascript String object.

    function AsciiToString(ptr) {
      var str = '';
      while (1) {
        var ch = HEAPU8[ptr++ >> 0];
        if (!ch) return str;
        str += String.fromCharCode(ch);
      }
    }

    // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
    // null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

    function stringToAscii(str, outPtr) {
      return writeAsciiToMemory(str, outPtr, false);
    }

    // Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
    // a copy of that string as a Javascript String object.

    var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;

    function UTF16ToString(ptr, maxBytesToRead) {
      assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
      var endPtr = ptr;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
      // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
      endPtr = idx << 1;

      if (endPtr - ptr > 32 && UTF16Decoder) {
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
      } else {
        var str = '';

        // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
        // will always evaluate to true. The loop is then terminated on the first null char.
        for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
          var codeUnit = HEAP16[(ptr + i * 2) >> 1];
          if (codeUnit == 0) break;
          // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
          str += String.fromCharCode(codeUnit);
        }

        return str;
      }
    }

    // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
    // null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
    // Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
    // Parameters:
    //   str: the Javascript string to copy.
    //   outPtr: Byte address in Emscripten HEAP where to write the string to.
    //   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
    //                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
    //                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
    // Returns the number of bytes written, EXCLUDING the null terminator.

    function stringToUTF16(str, outPtr, maxBytesToWrite) {
      assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
      assert(
        typeof maxBytesToWrite == 'number',
        'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
      );
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 0x7fffffff;
      }
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2; // Null terminator.
      var startPtr = outPtr;
      var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        HEAP16[outPtr >> 1] = codeUnit;
        outPtr += 2;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP16[outPtr >> 1] = 0;
      return outPtr - startPtr;
    }

    // Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

    function lengthBytesUTF16(str) {
      return str.length * 2;
    }

    function UTF32ToString(ptr, maxBytesToRead) {
      assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
      var i = 0;

      var str = '';
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[(ptr + i * 4) >> 2];
        if (utf32 == 0) break;
        ++i;
        // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        if (utf32 >= 0x10000) {
          var ch = utf32 - 0x10000;
          str += String.fromCharCode(0xd800 | (ch >> 10), 0xdc00 | (ch & 0x3ff));
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }

    // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
    // null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
    // Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
    // Parameters:
    //   str: the Javascript string to copy.
    //   outPtr: Byte address in Emscripten HEAP where to write the string to.
    //   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
    //                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
    //                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
    // Returns the number of bytes written, EXCLUDING the null terminator.

    function stringToUTF32(str, outPtr, maxBytesToWrite) {
      assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
      assert(
        typeof maxBytesToWrite == 'number',
        'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
      );
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 0x7fffffff;
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        if (codeUnit >= 0xd800 && codeUnit <= 0xdfff) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = (0x10000 + ((codeUnit & 0x3ff) << 10)) | (trailSurrogate & 0x3ff);
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    }

    // Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

    function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 0xd800 && codeUnit <= 0xdfff) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
        len += 4;
      }

      return len;
    }

    // Allocate heap space for a JS string, and write it there.
    // It is the responsibility of the caller to free() that memory.
    function allocateUTF8(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret) stringToUTF8Array(str, HEAP8, ret, size);
      return ret;
    }

    // Allocate stack space for a JS string, and write it there.
    function allocateUTF8OnStack(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8Array(str, HEAP8, ret, size);
      return ret;
    }

    // Deprecated: This function should not be called because it is unsafe and does not provide
    // a maximum length limit of how many bytes it is allowed to write. Prefer calling the
    // function stringToUTF8Array() instead, which takes in a maximum length that can be used
    // to be secure from out of bounds writes.
    /** @deprecated
    @param {boolean=} dontAddNull */
    function writeStringToMemory(string, buffer, dontAddNull) {
      warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

      var /** @type {number} */ lastChar, /** @type {number} */ end;
      if (dontAddNull) {
        // stringToUTF8Array always appends null. If we don't want to do that, remember the
        // character that existed at the location where the null will be placed, and restore
        // that after the write (below).
        end = buffer + lengthBytesUTF8(string);
        lastChar = HEAP8[end];
      }
      stringToUTF8(string, buffer, Infinity);
      if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
    }

    function writeArrayToMemory(array, buffer) {
      assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)');
      HEAP8.set(array, buffer);
    }

    /** @param {boolean=} dontAddNull */
    function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (var i = 0; i < str.length; ++i) {
        assert((str.charCodeAt(i) === str.charCodeAt(i)) & 0xff);
        HEAP8[buffer++ >> 0] = str.charCodeAt(i);
      }
      // Null-terminate the pointer to the HEAP.
      if (!dontAddNull) HEAP8[buffer >> 0] = 0;
    }

    // end include: runtime_strings_extra.js
    // Memory management

    function alignUp(x, multiple) {
      if (x % multiple > 0) {
        x += multiple - (x % multiple);
      }
      return x;
    }

    var HEAP,
      /** @type {ArrayBuffer} */
      buffer,
      /** @type {Int8Array} */
      HEAP8,
      /** @type {Uint8Array} */
      HEAPU8,
      /** @type {Int16Array} */
      HEAP16,
      /** @type {Uint16Array} */
      HEAPU16,
      /** @type {Int32Array} */
      HEAP32,
      /** @type {Uint32Array} */
      HEAPU32,
      /** @type {Float32Array} */
      HEAPF32,
      /** @type {Float64Array} */
      HEAPF64;

    function updateGlobalBufferAndViews(buf) {
      buffer = buf;
      Module['HEAP8'] = HEAP8 = new Int8Array(buf);
      Module['HEAP16'] = HEAP16 = new Int16Array(buf);
      Module['HEAP32'] = HEAP32 = new Int32Array(buf);
      Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
      Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
      Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
      Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
      Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
    }

    var TOTAL_STACK = 5242880;
    if (Module['TOTAL_STACK'])
      assert(TOTAL_STACK === Module['TOTAL_STACK'], 'the stack size can no longer be determined at runtime');

    var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 268435456;
    if (!Object.getOwnPropertyDescriptor(Module, 'INITIAL_MEMORY')) {
      Object.defineProperty(Module, 'INITIAL_MEMORY', {
        configurable: true,
        get: function () {
          abort(
            'Module.INITIAL_MEMORY has been replaced with plain INITIAL_MEMORY (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
          );
        },
      });
    }

    assert(
      INITIAL_MEMORY >= TOTAL_STACK,
      'INITIAL_MEMORY should be larger than TOTAL_STACK, was ' + INITIAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')'
    );

    // check for full engine support (use string 'subarray' to avoid closure compiler confusion)
    assert(
      typeof Int32Array !== 'undefined' &&
        typeof Float64Array !== 'undefined' &&
        Int32Array.prototype.subarray !== undefined &&
        Int32Array.prototype.set !== undefined,
      'JS engine does not provide full typed array support'
    );

    // If memory is defined in wasm, the user can't provide it.
    assert(
      !Module['wasmMemory'],
      'Use of `wasmMemory` detected.  Use -s IMPORTED_MEMORY to define wasmMemory externally'
    );
    assert(
      INITIAL_MEMORY == 268435456,
      'Detected runtime INITIAL_MEMORY setting.  Use -s IMPORTED_MEMORY to define wasmMemory dynamically'
    );

    // include: runtime_init_table.js
    // In regular non-RELOCATABLE mode the table is exported
    // from the wasm module and this will be assigned once
    // the exports are available.
    var wasmTable;

    // end include: runtime_init_table.js
    // include: runtime_stack_check.js

    // Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
    function writeStackCookie() {
      var max = _emscripten_stack_get_end();
      assert((max & 3) == 0);
      // The stack grows downwards
      HEAPU32[(max >> 2) + 1] = 0x2135467;
      HEAPU32[(max >> 2) + 2] = 0x89bacdfe;
      // Also test the global address 0 for integrity.
      HEAP32[0] = 0x63736d65; /* 'emsc' */
    }

    function checkStackCookie() {
      if (ABORT) return;
      var max = _emscripten_stack_get_end();
      var cookie1 = HEAPU32[(max >> 2) + 1];
      var cookie2 = HEAPU32[(max >> 2) + 2];
      if (cookie1 != 0x2135467 || cookie2 != 0x89bacdfe) {
        abort(
          'Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x' +
            cookie2.toString(16) +
            ' ' +
            cookie1.toString(16)
        );
      }
      // Also test the global address 0 for integrity.
      if (HEAP32[0] !== 0x63736d65 /* 'emsc' */)
        abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
    }

    // end include: runtime_stack_check.js
    // include: runtime_assertions.js

    // Endianness check
    (function () {
      var h16 = new Int16Array(1);
      var h8 = new Int8Array(h16.buffer);
      h16[0] = 0x6373;
      if (h8[0] !== 0x73 || h8[1] !== 0x63)
        throw 'Runtime error: expected the system to be little-endian! (Run with -s SUPPORT_BIG_ENDIAN=1 to bypass)';
    })();

    // end include: runtime_assertions.js
    var __ATPRERUN__ = []; // functions called before the runtime is initialized
    var __ATINIT__ = []; // functions called during startup
    var __ATEXIT__ = []; // functions called during shutdown
    var __ATPOSTRUN__ = []; // functions called after the main() is called

    var runtimeInitialized = false;
    var runtimeExited = false;
    var runtimeKeepaliveCounter = 0;

    function keepRuntimeAlive() {
      return noExitRuntime || runtimeKeepaliveCounter > 0;
    }

    function preRun() {
      if (Module['preRun']) {
        if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
        while (Module['preRun'].length) {
          addOnPreRun(Module['preRun'].shift());
        }
      }

      callRuntimeCallbacks(__ATPRERUN__);
    }

    function initRuntime() {
      checkStackCookie();
      assert(!runtimeInitialized);
      runtimeInitialized = true;

      ___set_stack_limits(_emscripten_stack_get_base(), _emscripten_stack_get_end());

      callRuntimeCallbacks(__ATINIT__);
    }

    function exitRuntime() {
      // ASYNCIFY cannot be used once the runtime starts shutting down.
      Asyncify.state = Asyncify.State.Disabled;
      checkStackCookie();
      runtimeExited = true;
    }

    function postRun() {
      checkStackCookie();

      if (Module['postRun']) {
        if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
        while (Module['postRun'].length) {
          addOnPostRun(Module['postRun'].shift());
        }
      }

      callRuntimeCallbacks(__ATPOSTRUN__);
    }

    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }

    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }

    function addOnExit(cb) {}

    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }

    // include: runtime_math.js

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

    assert(
      Math.imul,
      'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    assert(
      Math.fround,
      'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    assert(
      Math.clz32,
      'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    assert(
      Math.trunc,
      'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );

    // end include: runtime_math.js
    // A counter of dependencies for calling run(). If we need to
    // do asynchronous work before running, increment this and
    // decrement it. Incrementing must happen in a place like
    // Module.preRun (used by emcc to add file preloading).
    // Note that you can add dependencies in preRun, even though
    // it happens right before run - run will be postponed until
    // the dependencies are met.
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
    var runDependencyTracking = {};

    function getUniqueRunDependency(id) {
      var orig = id;
      while (1) {
        if (!runDependencyTracking[id]) return id;
        id = orig + Math.random();
      }
    }

    function addRunDependency(id) {
      runDependencies++;

      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }

      if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
          // Check for missing dependencies every few seconds
          runDependencyWatcher = setInterval(function () {
            if (ABORT) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
              return;
            }
            var shown = false;
            for (var dep in runDependencyTracking) {
              if (!shown) {
                shown = true;
                err('still waiting on run dependencies:');
              }
              err('dependency: ' + dep);
            }
            if (shown) {
              err('(end of list)');
            }
          }, 10000);
        }
      } else {
        err('warning: run dependency added without ID');
      }
    }

    function removeRunDependency(id) {
      runDependencies--;

      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }

      if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id];
      } else {
        err('warning: run dependency removed without ID');
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback(); // can add another dependenciesFulfilled
        }
      }
    }

    Module['preloadedImages'] = {}; // maps url to image data
    Module['preloadedAudios'] = {}; // maps url to audio data

    /** @param {string|number=} what */
    function abort(what) {
      {
        if (Module['onAbort']) {
          Module['onAbort'](what);
        }
      }

      what += '';
      err(what);

      ABORT = true;
      EXITSTATUS = 1;

      var output = 'abort(' + what + ') at ' + stackTrace();
      what = output;

      // Use a wasm runtime error, because a JS error might be seen as a foreign
      // exception, which means we'd run destructors on it. We need the error to
      // simply make the program stop.
      var e = new WebAssembly.RuntimeError(what);

      readyPromiseReject(e);
      // Throw the error whether or not MODULARIZE is set because abort is used
      // in code paths apart from instantiation where an exception is expected
      // to be thrown when abort is called.
      throw e;
    }

    // {{MEM_INITIALIZER}}

    // include: memoryprofiler.js

    // end include: memoryprofiler.js
    // show errors on likely calls to FS when it was not included
    var FS = {
      error: function () {
        abort(
          'Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1'
        );
      },
      init: function () {
        FS.error();
      },
      createDataFile: function () {
        FS.error();
      },
      createPreloadedFile: function () {
        FS.error();
      },
      createLazyFile: function () {
        FS.error();
      },
      open: function () {
        FS.error();
      },
      mkdev: function () {
        FS.error();
      },
      registerDevice: function () {
        FS.error();
      },
      analyzePath: function () {
        FS.error();
      },
      loadFilesFromDB: function () {
        FS.error();
      },

      ErrnoError: function ErrnoError() {
        FS.error();
      },
    };
    Module['FS_createDataFile'] = FS.createDataFile;
    Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

    // include: URIUtils.js

    // Prefix of data URIs emitted by SINGLE_FILE and related options.
    var dataURIPrefix = 'data:application/octet-stream;base64,';

    // Indicates whether filename is a base64 data URI.
    function isDataURI(filename) {
      // Prefix of data URIs emitted by SINGLE_FILE and related options.
      return filename.startsWith(dataURIPrefix);
    }

    // Indicates whether filename is delivered via file protocol (as opposed to http/https)
    function isFileURI(filename) {
      return filename.startsWith('file://');
    }

    // end include: URIUtils.js
    function createExportWrapper(name, fixedasm) {
      return function () {
        var displayName = name;
        var asm = fixedasm;
        if (!fixedasm) {
          asm = Module['asm'];
        }
        assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
        assert(
          !runtimeExited,
          'native function `' +
            displayName +
            '` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)'
        );
        if (!asm[name]) {
          assert(asm[name], 'exported native function `' + displayName + '` not found');
        }
        return asm[name].apply(null, arguments);
      };
    }

    var wasmBinaryFile;
    wasmBinaryFile = 'qsp-wasm.wasm';
    if (!isDataURI(wasmBinaryFile)) {
      wasmBinaryFile = locateFile(wasmBinaryFile);
    }

    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        } else {
          throw 'both async and sync fetching of the wasm failed';
        }
      } catch (err) {
        abort(err);
      }
    }

    function getBinaryPromise() {
      // If we don't have the binary yet, try to to load it asynchronously.
      // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
      // See https://github.com/github/fetch/pull/92#issuecomment-140665932
      // Cordova or Electron apps are typically loaded from a file:// url.
      // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
      if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch === 'function') {
          return fetch(wasmBinaryFile, { credentials: 'same-origin' })
            .then(function (response) {
              if (!response['ok']) {
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
              }
              return response['arrayBuffer']();
            })
            .catch(function () {
              return getBinary(wasmBinaryFile);
            });
        }
      }

      // Otherwise, getBinary should be able to get it synchronously
      return Promise.resolve().then(function () {
        return getBinary(wasmBinaryFile);
      });
    }

    // Create the wasm instance.
    // Receives the wasm imports, returns the exports.
    function createWasm() {
      // prepare imports
      var info = {
        env: asmLibraryArg,
        wasi_snapshot_preview1: asmLibraryArg,
      };
      // Load the wasm module and create an instance of using native support in the JS engine.
      // handle a generated wasm instance, receiving its exports and
      // performing other necessary setup
      /** @param {WebAssembly.Module=} module*/
      function receiveInstance(instance, module) {
        var exports = instance.exports;

        exports = Asyncify.instrumentWasmExports(exports);

        Module['asm'] = exports;

        wasmMemory = Module['asm']['memory'];
        assert(wasmMemory, 'memory not found in wasm exports');
        // This assertion doesn't hold when emscripten is run in --post-link
        // mode.
        // TODO(sbc): Read INITIAL_MEMORY out of the wasm file in post-link mode.
        //assert(wasmMemory.buffer.byteLength === 268435456);
        updateGlobalBufferAndViews(wasmMemory.buffer);

        wasmTable = Module['asm']['__indirect_function_table'];
        assert(wasmTable, 'table not found in wasm exports');

        addOnInit(Module['asm']['__wasm_call_ctors']);

        removeRunDependency('wasm-instantiate');
      }
      // we can't run yet (except in a pthread, where we have a custom sync instantiator)
      addRunDependency('wasm-instantiate');

      // Prefer streaming instantiation if available.
      // Async compilation can be confusing when an error on the page overwrites Module
      // (for example, if the order of elements is wrong, and the one defining Module is
      // later), so we save Module and check it later.
      var trueModule = Module;
      function receiveInstantiationResult(result) {
        // 'result' is a ResultObject object which has both the module and instance.
        // receiveInstance() will swap in the exports (to Module.asm) so they can be called
        assert(
          Module === trueModule,
          'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?'
        );
        trueModule = null;
        // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
        // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
        receiveInstance(result['instance']);
      }

      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise()
          .then(function (binary) {
            return WebAssembly.instantiate(binary, info);
          })
          .then(function (instance) {
            return instance;
          })
          .then(receiver, function (reason) {
            err('failed to asynchronously prepare wasm: ' + reason);

            // Warn on some common problems.
            if (isFileURI(wasmBinaryFile)) {
              err(
                'warning: Loading from a file URI (' +
                  wasmBinaryFile +
                  ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing'
              );
            }
            abort(reason);
          });
      }

      function instantiateAsync() {
        if (
          !wasmBinary &&
          typeof WebAssembly.instantiateStreaming === 'function' &&
          !isDataURI(wasmBinaryFile) &&
          typeof fetch === 'function'
        ) {
          return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
            var result = WebAssembly.instantiateStreaming(response, info);

            return result.then(receiveInstantiationResult, function (reason) {
              // We expect the most common failure cause to be a bad MIME type for the binary,
              // in which case falling back to ArrayBuffer instantiation should work.
              err('wasm streaming compile failed: ' + reason);
              err('falling back to ArrayBuffer instantiation');
              return instantiateArrayBuffer(receiveInstantiationResult);
            });
          });
        } else {
          return instantiateArrayBuffer(receiveInstantiationResult);
        }
      }

      // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
      // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
      // to any other async startup actions they are performing.
      if (Module['instantiateWasm']) {
        try {
          var exports = Module['instantiateWasm'](info, receiveInstance);
          exports = Asyncify.instrumentWasmExports(exports);
          return exports;
        } catch (e) {
          err('Module.instantiateWasm callback failed with error: ' + e);
          return false;
        }
      }

      // If instantiation fails, reject the module ready promise.
      instantiateAsync().catch(readyPromiseReject);
      return {}; // no exports yet; we'll fill them in later
    }

    // Globals used by JS i64 conversions (see makeSetValue)
    var tempDouble;
    var tempI64;

    // === Body ===

    var ASM_CONSTS = {};

    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback(Module); // Pass the module as the first argument.
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            (function () {
              dynCall_v.call(null, func);
            })();
          } else {
            (function (a1) {
              dynCall_vi.apply(null, [func, a1]);
            })(callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }

    function demangle(func) {
      warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
      return func;
    }

    function demangleAll(text) {
      var regex = /\b_Z[\w\d_]+/g;
      return text.replace(regex, function (x) {
        var y = demangle(x);
        return x === y ? x : y + ' [' + x + ']';
      });
    }

    function handleException(e) {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      // Anything else is an unexpected exception and we treat it as hard error.
      var toLog = e;
      if (e && typeof e === 'object' && e.stack) {
        toLog = [e, e.stack];
      }
      err('exception thrown: ' + toLog);
      quit_(1, e);
    }

    function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error();
        } catch (e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

    function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

    function ___handle_stack_overflow() {
      // TODO(sbc): Improve this error message.   The old abortStackOverflow used
      // by asm.js used to do a better job:
      // abort('Stack overflow! Attempted to allocate ' + allocSize + ' bytes on the stack, but stack has only ' + (_emscripten_stack_get_free() + allocSize) + ' bytes available!');
      abort('stack overflow');
    }

    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

    function emscripten_realloc_buffer(size) {
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16); // .grow() takes a delta compared to the previous size
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1 /*success*/;
      } catch (e) {
        err(
          'emscripten_realloc_buffer: Attempted to grow heap from ' +
            buffer.byteLength +
            ' bytes to ' +
            size +
            ' bytes, but got error: ' +
            e
        );
      }
      // implicit 0 return to save code size (caller will cast "undefined" into 0
      // anyhow)
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      // With pthreads, races can happen (another thread might increase the size in between), so return a failure, and let the caller retry.
      assert(requestedSize > oldSize);

      // Memory resize rules:
      // 1. Always increase heap size to at least the requested size, rounded up to next page multiple.
      // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap geometrically: increase the heap size according to
      //                                         MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%),
      //                                         At most overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
      // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap linearly: increase the heap size by at least MEMORY_GROWTH_LINEAR_STEP bytes.
      // 3. Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
      // 4. If we were unable to allocate as much memory, it may be due to over-eager decision to excessively reserve due to (3) above.
      //    Hence if an allocation fails, cut down on the amount of excess growth, in an attempt to succeed to perform a smaller allocation.

      // A limit is set for how much we can grow. We should not exceed that
      // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
      // In CAN_ADDRESS_2GB mode, stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate full 4GB Wasm memories, the size will wrap
      // back to 0 bytes in Wasm side for any code that deals with heap sizes, which would require special casing all heap size related code to treat
      // 0 specially.
      var maxHeapSize = 2147483648;
      if (requestedSize > maxHeapSize) {
        err(
          'Cannot enlarge memory, asked to go up to ' +
            requestedSize +
            ' bytes, but the limit is ' +
            maxHeapSize +
            ' bytes!'
        );
        return false;
      }

      // Loop through potential heap size increases. If we attempt a too eager reservation that fails, cut down on the
      // attempted size and reserve a smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);

        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));

        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
          return true;
        }
      }
      err('Failed to grow the heap from ' + oldSize + ' bytes to ' + newSize + ' bytes, not enough memory!');
      return false;
    }

    var ENV = {};

    function getExecutableName() {
      return thisProgram || './this.program';
    }
    function getEnvStrings() {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
        var lang =
          ((typeof navigator === 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') +
          '.UTF-8';
        var env = {
          USER: 'web_user',
          LOGNAME: 'web_user',
          PATH: '/',
          PWD: '/',
          HOME: '/home/web_user',
          LANG: lang,
          _: getExecutableName(),
        };
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(x + '=' + env[x]);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    }

    var SYSCALLS = {
      mappings: {},
      buffers: [null, [], []],
      printChar: function (stream, curr) {
        var buffer = SYSCALLS.buffers[stream];
        assert(buffer);
        if (curr === 0 || curr === 10) {
          (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
          buffer.length = 0;
        } else {
          buffer.push(curr);
        }
      },
      varargs: undefined,
      get: function () {
        assert(SYSCALLS.varargs != undefined);
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
        return ret;
      },
      getStr: function (ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
      get64: function (low, high) {
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      },
    };
    function _environ_get(__environ, environ_buf) {
      var bufSize = 0;
      getEnvStrings().forEach(function (string, i) {
        var ptr = environ_buf + bufSize;
        HEAP32[(__environ + i * 4) >> 2] = ptr;
        writeAsciiToMemory(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    }

    function _environ_sizes_get(penviron_count, penviron_buf_size) {
      var strings = getEnvStrings();
      HEAP32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach(function (string) {
        bufSize += string.length + 1;
      });
      HEAP32[penviron_buf_size >> 2] = bufSize;
      return 0;
    }

    function flush_NO_FILESYSTEM() {
      // flush anything remaining in the buffers during shutdown
      if (typeof _fflush !== 'undefined') _fflush(0);
      var buffers = SYSCALLS.buffers;
      if (buffers[1].length) SYSCALLS.printChar(1, 10);
      if (buffers[2].length) SYSCALLS.printChar(2, 10);
    }
    function _fd_write(fd, iov, iovcnt, pnum) {
      // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[(iov + i * 8) >> 2];
        var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
        for (var j = 0; j < len; j++) {
          SYSCALLS.printChar(fd, HEAPU8[ptr + j]);
        }
        num += len;
      }
      HEAP32[pnum >> 2] = num;
      return 0;
    }

    function _setTempRet0(val) {
      setTempRet0(val);
    }

    function _time(ptr) {
      var ret = (Date.now() / 1000) | 0;
      if (ptr) {
        HEAP32[ptr >> 2] = ret;
      }
      return ret;
    }

    function runAndAbortIfError(func) {
      try {
        return func();
      } catch (e) {
        abort(e);
      }
    }

    function callUserCallback(func, synchronous) {
      if (ABORT) {
        err('user callback triggered after application aborted.  Ignoring.');
        return;
      }
      // For synchronous calls, let any exceptions propagate, and don't let the runtime exit.
      if (synchronous) {
        func();
        return;
      }
      try {
        func();
      } catch (e) {
        handleException(e);
      }
    }

    function runtimeKeepalivePush() {
      runtimeKeepaliveCounter += 1;
    }

    function runtimeKeepalivePop() {
      assert(runtimeKeepaliveCounter > 0);
      runtimeKeepaliveCounter -= 1;
    }
    var Asyncify = {
      State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 },
      state: 0,
      StackSize: 4096,
      currData: null,
      handleSleepReturnValue: 0,
      exportCallStack: [],
      callStackNameToId: {},
      callStackIdToName: {},
      callStackId: 0,
      asyncPromiseHandlers: null,
      sleepCallbacks: [],
      getCallStackId: function (funcName) {
        var id = Asyncify.callStackNameToId[funcName];
        if (id === undefined) {
          id = Asyncify.callStackId++;
          Asyncify.callStackNameToId[funcName] = id;
          Asyncify.callStackIdToName[id] = funcName;
        }
        return id;
      },
      instrumentWasmImports: function (imports) {
        var ASYNCIFY_IMPORTS = [
          'env.invoke_*',
          'env.emscripten_sleep',
          'env.emscripten_wget',
          'env.emscripten_wget_data',
          'env.emscripten_idb_load',
          'env.emscripten_idb_store',
          'env.emscripten_idb_delete',
          'env.emscripten_idb_exists',
          'env.emscripten_idb_load_blob',
          'env.emscripten_idb_store_blob',
          'env.SDL_Delay',
          'env.emscripten_scan_registers',
          'env.emscripten_lazy_load_code',
          'env.emscripten_fiber_swap',
          'wasi_snapshot_preview1.fd_sync',
          'env.__wasi_fd_sync',
          'env._emval_await',
          'env.dlopen',
          'env.__asyncjs__*',
        ].map(function (x) {
          return x.split('.')[1];
        });
        for (var x in imports) {
          (function (x) {
            var original = imports[x];
            if (typeof original === 'function') {
              imports[x] = function () {
                var originalAsyncifyState = Asyncify.state;
                try {
                  return original.apply(null, arguments);
                } finally {
                  // Only asyncify-declared imports are allowed to change the
                  // state.
                  var isAsyncifyImport = ASYNCIFY_IMPORTS.indexOf(x) >= 0 || x.startsWith('__asyncjs__');
                  // Changing the state from normal to disabled is allowed (in any
                  // function) as that is what shutdown does (and we don't have an
                  // explicit list of shutdown imports).
                  var changedToDisabled =
                    originalAsyncifyState === Asyncify.State.Normal && Asyncify.state === Asyncify.State.Disabled;
                  // invoke_* functions are allowed to change the state if we do
                  // not ignore indirect calls.
                  var ignoredInvoke = x.startsWith('invoke_') && true;
                  if (
                    Asyncify.state !== originalAsyncifyState &&
                    !isAsyncifyImport &&
                    !changedToDisabled &&
                    !ignoredInvoke
                  ) {
                    throw new Error('import ' + x + ' was not in ASYNCIFY_IMPORTS, but changed the state');
                  }
                }
              };
            }
          })(x);
        }
      },
      instrumentWasmExports: function (exports) {
        var ret = {};
        for (var x in exports) {
          (function (x) {
            var original = exports[x];
            if (typeof original === 'function') {
              ret[x] = function () {
                Asyncify.exportCallStack.push(x);
                try {
                  return original.apply(null, arguments);
                } finally {
                  if (!ABORT) {
                    var y = Asyncify.exportCallStack.pop();
                    assert(y === x);
                    Asyncify.maybeStopUnwind();
                  }
                }
              };
            } else {
              ret[x] = original;
            }
          })(x);
        }
        return ret;
      },
      maybeStopUnwind: function () {
        if (Asyncify.currData && Asyncify.state === Asyncify.State.Unwinding && Asyncify.exportCallStack.length === 0) {
          // We just finished unwinding.

          Asyncify.state = Asyncify.State.Normal;
          // Keep the runtime alive so that a re-wind can be done later.
          runAndAbortIfError(Module['_asyncify_stop_unwind']);
          if (typeof Fibers !== 'undefined') {
            Fibers.trampoline();
          }
        }
      },
      whenDone: function () {
        assert(Asyncify.currData, 'Tried to wait for an async operation when none is in progress.');
        assert(!Asyncify.asyncPromiseHandlers, 'Cannot have multiple async operations in flight at once');
        return new Promise(function (resolve, reject) {
          Asyncify.asyncPromiseHandlers = {
            resolve: resolve,
            reject: reject,
          };
        });
      },
      allocateData: function () {
        // An asyncify data structure has three fields:
        //  0  current stack pos
        //  4  max stack pos
        //  8  id of function at bottom of the call stack (callStackIdToName[id] == name of js function)
        //
        // The Asyncify ABI only interprets the first two fields, the rest is for the runtime.
        // We also embed a stack in the same memory region here, right next to the structure.
        // This struct is also defined as asyncify_data_t in emscripten/fiber.h
        var ptr = _malloc(12 + Asyncify.StackSize);
        Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
        Asyncify.setDataRewindFunc(ptr);
        return ptr;
      },
      setDataHeader: function (ptr, stack, stackSize) {
        HEAP32[ptr >> 2] = stack;
        HEAP32[(ptr + 4) >> 2] = stack + stackSize;
      },
      setDataRewindFunc: function (ptr) {
        var bottomOfCallStack = Asyncify.exportCallStack[0];
        var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
        HEAP32[(ptr + 8) >> 2] = rewindId;
      },
      getDataRewindFunc: function (ptr) {
        var id = HEAP32[(ptr + 8) >> 2];
        var name = Asyncify.callStackIdToName[id];
        var func = Module['asm'][name];
        return func;
      },
      doRewind: function (ptr) {
        var start = Asyncify.getDataRewindFunc(ptr);
        // Once we have rewound and the stack we no longer need to artificially keep
        // the runtime alive.

        return start();
      },
      handleSleep: function (startAsync) {
        assert(Asyncify.state !== Asyncify.State.Disabled, 'Asyncify cannot be done during or after the runtime exits');
        if (ABORT) return;
        if (Asyncify.state === Asyncify.State.Normal) {
          // Prepare to sleep. Call startAsync, and see what happens:
          // if the code decided to call our callback synchronously,
          // then no async operation was in fact begun, and we don't
          // need to do anything.
          var reachedCallback = false;
          var reachedAfterCallback = false;
          startAsync(function (handleSleepReturnValue) {
            assert(
              !handleSleepReturnValue ||
                typeof handleSleepReturnValue === 'number' ||
                typeof handleSleepReturnValue === 'boolean'
            ); // old emterpretify API supported other stuff
            if (ABORT) return;
            Asyncify.handleSleepReturnValue = handleSleepReturnValue || 0;
            reachedCallback = true;
            if (!reachedAfterCallback) {
              // We are happening synchronously, so no need for async.
              return;
            }
            // This async operation did not happen synchronously, so we did
            // unwind. In that case there can be no compiled code on the stack,
            // as it might break later operations (we can rewind ok now, but if
            // we unwind again, we would unwind through the extra compiled code
            // too).
            assert(
              !Asyncify.exportCallStack.length,
              'Waking up (starting to rewind) must be done from JS, without compiled code on the stack.'
            );
            Asyncify.state = Asyncify.State.Rewinding;
            runAndAbortIfError(function () {
              Module['_asyncify_start_rewind'](Asyncify.currData);
            });
            if (typeof Browser !== 'undefined' && Browser.mainLoop.func) {
              Browser.mainLoop.resume();
            }
            var asyncWasmReturnValue,
              isError = false;
            try {
              asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
            } catch (err) {
              asyncWasmReturnValue = err;
              isError = true;
            }
            // Track whether the return value was handled by any promise handlers.
            var handled = false;
            if (!Asyncify.currData) {
              // All asynchronous execution has finished.
              // `asyncWasmReturnValue` now contains the final
              // return value of the exported async WASM function.
              //
              // Note: `asyncWasmReturnValue` is distinct from
              // `Asyncify.handleSleepReturnValue`.
              // `Asyncify.handleSleepReturnValue` contains the return
              // value of the last C function to have executed
              // `Asyncify.handleSleep()`, where as `asyncWasmReturnValue`
              // contains the return value of the exported WASM function
              // that may have called C functions that
              // call `Asyncify.handleSleep()`.
              var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
              if (asyncPromiseHandlers) {
                Asyncify.asyncPromiseHandlers = null;
                (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
                handled = true;
              }
            }
            if (isError && !handled) {
              // If there was an error and it was not handled by now, we have no choice but to
              // rethrow that error into the global scope where it can be caught only by
              // `onerror` or `onunhandledpromiserejection`.
              throw asyncWasmReturnValue;
            }
          });
          reachedAfterCallback = true;
          if (!reachedCallback) {
            // A true async operation was begun; start a sleep.
            Asyncify.state = Asyncify.State.Unwinding;
            // TODO: reuse, don't alloc/free every sleep
            Asyncify.currData = Asyncify.allocateData();
            runAndAbortIfError(function () {
              Module['_asyncify_start_unwind'](Asyncify.currData);
            });
            if (typeof Browser !== 'undefined' && Browser.mainLoop.func) {
              Browser.mainLoop.pause();
            }
          }
        } else if (Asyncify.state === Asyncify.State.Rewinding) {
          // Stop a resume.
          Asyncify.state = Asyncify.State.Normal;
          runAndAbortIfError(Module['_asyncify_stop_rewind']);
          _free(Asyncify.currData);
          Asyncify.currData = null;
          // Call all sleep callbacks now that the sleep-resume is all done.
          Asyncify.sleepCallbacks.forEach(function (func) {
            callUserCallback(func);
          });
        } else {
          abort('invalid state: ' + Asyncify.state);
        }
        return Asyncify.handleSleepReturnValue;
      },
      handleAsync: function (startAsync) {
        return Asyncify.handleSleep(function (wakeUp) {
          // TODO: add error handling as a second param when handleSleep implements it.
          startAsync().then(wakeUp);
        });
      },
    };
    var ASSERTIONS = true;

    /** @type {function(string, boolean=, number=)} */
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array;
    }

    function intArrayToString(array) {
      var ret = [];
      for (var i = 0; i < array.length; i++) {
        var chr = array[i];
        if (chr > 0xff) {
          if (ASSERTIONS) {
            assert(
              false,
              'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.'
            );
          }
          chr &= 0xff;
        }
        ret.push(String.fromCharCode(chr));
      }
      return ret.join('');
    }

    var asmLibraryArg = {
      __handle_stack_overflow: ___handle_stack_overflow,
      emscripten_memcpy_big: _emscripten_memcpy_big,
      emscripten_resize_heap: _emscripten_resize_heap,
      environ_get: _environ_get,
      environ_sizes_get: _environ_sizes_get,
      fd_write: _fd_write,
      setTempRet0: _setTempRet0,
      time: _time,
    };
    Asyncify.instrumentWasmImports(asmLibraryArg);
    var asm = createWasm();
    /** @type {function(...*):?} */
    var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = createExportWrapper('__wasm_call_ctors'));

    /** @type {function(...*):?} */
    var _init = (Module['_init'] = createExportWrapper('init'));

    /** @type {function(...*):?} */
    var _dispose = (Module['_dispose'] = createExportWrapper('dispose'));

    /** @type {function(...*):?} */
    var _getVersion = (Module['_getVersion'] = createExportWrapper('getVersion'));

    /** @type {function(...*):?} */
    var _setErrorCallback = (Module['_setErrorCallback'] = createExportWrapper('setErrorCallback'));

    /** @type {function(...*):?} */
    var _getMainDesc = (Module['_getMainDesc'] = createExportWrapper('getMainDesc'));

    /** @type {function(...*):?} */
    var _isMainDescChanged = (Module['_isMainDescChanged'] = createExportWrapper('isMainDescChanged'));

    /** @type {function(...*):?} */
    var _getVarsDesc = (Module['_getVarsDesc'] = createExportWrapper('getVarsDesc'));

    /** @type {function(...*):?} */
    var _isVarsDescChanged = (Module['_isVarsDescChanged'] = createExportWrapper('isVarsDescChanged'));

    /** @type {function(...*):?} */
    var _getActions = (Module['_getActions'] = createExportWrapper('getActions'));

    /** @type {function(...*):?} */
    var _malloc = (Module['_malloc'] = createExportWrapper('malloc'));

    /** @type {function(...*):?} */
    var _selectAction = (Module['_selectAction'] = createExportWrapper('selectAction'));

    /** @type {function(...*):?} */
    var _executeSelAction = (Module['_executeSelAction'] = createExportWrapper('executeSelAction'));

    /** @type {function(...*):?} */
    var _isActionsChanged = (Module['_isActionsChanged'] = createExportWrapper('isActionsChanged'));

    /** @type {function(...*):?} */
    var _getObjects = (Module['_getObjects'] = createExportWrapper('getObjects'));

    /** @type {function(...*):?} */
    var _selectObject = (Module['_selectObject'] = createExportWrapper('selectObject'));

    /** @type {function(...*):?} */
    var _isObjectsChanged = (Module['_isObjectsChanged'] = createExportWrapper('isObjectsChanged'));

    /** @type {function(...*):?} */
    var _loadGameData = (Module['_loadGameData'] = createExportWrapper('loadGameData'));

    /** @type {function(...*):?} */
    var _restartGame = (Module['_restartGame'] = createExportWrapper('restartGame'));

    /** @type {function(...*):?} */
    var _saveGameData = (Module['_saveGameData'] = createExportWrapper('saveGameData'));

    /** @type {function(...*):?} */
    var _free = (Module['_free'] = createExportWrapper('free'));

    /** @type {function(...*):?} */
    var _loadSavedGameData = (Module['_loadSavedGameData'] = createExportWrapper('loadSavedGameData'));

    /** @type {function(...*):?} */
    var _execString = (Module['_execString'] = createExportWrapper('execString'));

    /** @type {function(...*):?} */
    var _execCounter = (Module['_execCounter'] = createExportWrapper('execCounter'));

    /** @type {function(...*):?} */
    var _execLoc = (Module['_execLoc'] = createExportWrapper('execLoc'));

    /** @type {function(...*):?} */
    var _execUserInput = (Module['_execUserInput'] = createExportWrapper('execUserInput'));

    /** @type {function(...*):?} */
    var _getLastErrorData = (Module['_getLastErrorData'] = createExportWrapper('getLastErrorData'));

    /** @type {function(...*):?} */
    var _getErrorDesc = (Module['_getErrorDesc'] = createExportWrapper('getErrorDesc'));

    /** @type {function(...*):?} */
    var _getVarStringValue = (Module['_getVarStringValue'] = createExportWrapper('getVarStringValue'));

    /** @type {function(...*):?} */
    var _getVarNumValue = (Module['_getVarNumValue'] = createExportWrapper('getVarNumValue'));

    /** @type {function(...*):?} */
    var _initCallBacks = (Module['_initCallBacks'] = createExportWrapper('initCallBacks'));

    /** @type {function(...*):?} */
    var _setCallBack = (Module['_setCallBack'] = createExportWrapper('setCallBack'));

    /** @type {function(...*):?} */
    var _freeItemsList = (Module['_freeItemsList'] = createExportWrapper('freeItemsList'));

    /** @type {function(...*):?} */
    var _freeSaveBuffer = (Module['_freeSaveBuffer'] = createExportWrapper('freeSaveBuffer'));

    /** @type {function(...*):?} */
    var _fflush = (Module['_fflush'] = createExportWrapper('fflush'));

    /** @type {function(...*):?} */
    var ___errno_location = (Module['___errno_location'] = createExportWrapper('__errno_location'));

    /** @type {function(...*):?} */
    var _emscripten_stack_get_base = (Module['_emscripten_stack_get_base'] = function () {
      return (_emscripten_stack_get_base = Module['_emscripten_stack_get_base'] =
        Module['asm']['emscripten_stack_get_base']).apply(null, arguments);
    });

    /** @type {function(...*):?} */
    var _emscripten_stack_get_end = (Module['_emscripten_stack_get_end'] = function () {
      return (_emscripten_stack_get_end = Module['_emscripten_stack_get_end'] =
        Module['asm']['emscripten_stack_get_end']).apply(null, arguments);
    });

    /** @type {function(...*):?} */
    var __get_tzname = (Module['__get_tzname'] = createExportWrapper('_get_tzname'));

    /** @type {function(...*):?} */
    var __get_daylight = (Module['__get_daylight'] = createExportWrapper('_get_daylight'));

    /** @type {function(...*):?} */
    var __get_timezone = (Module['__get_timezone'] = createExportWrapper('_get_timezone'));

    /** @type {function(...*):?} */
    var stackSave = (Module['stackSave'] = createExportWrapper('stackSave'));

    /** @type {function(...*):?} */
    var stackRestore = (Module['stackRestore'] = createExportWrapper('stackRestore'));

    /** @type {function(...*):?} */
    var stackAlloc = (Module['stackAlloc'] = createExportWrapper('stackAlloc'));

    /** @type {function(...*):?} */
    var _emscripten_stack_init = (Module['_emscripten_stack_init'] = function () {
      return (_emscripten_stack_init = Module['_emscripten_stack_init'] = Module['asm']['emscripten_stack_init']).apply(
        null,
        arguments
      );
    });

    /** @type {function(...*):?} */
    var _emscripten_stack_set_limits = (Module['_emscripten_stack_set_limits'] = function () {
      return (_emscripten_stack_set_limits = Module['_emscripten_stack_set_limits'] =
        Module['asm']['emscripten_stack_set_limits']).apply(null, arguments);
    });

    /** @type {function(...*):?} */
    var _emscripten_stack_get_free = (Module['_emscripten_stack_get_free'] = function () {
      return (_emscripten_stack_get_free = Module['_emscripten_stack_get_free'] =
        Module['asm']['emscripten_stack_get_free']).apply(null, arguments);
    });

    /** @type {function(...*):?} */
    var _saveSetjmp = (Module['_saveSetjmp'] = createExportWrapper('saveSetjmp'));

    /** @type {function(...*):?} */
    var _setThrew = (Module['_setThrew'] = createExportWrapper('setThrew'));

    /** @type {function(...*):?} */
    var ___set_stack_limits = (Module['___set_stack_limits'] = createExportWrapper('__set_stack_limits'));

    /** @type {function(...*):?} */
    var dynCall_iii = (Module['dynCall_iii'] = createExportWrapper('dynCall_iii'));

    /** @type {function(...*):?} */
    var dynCall_viii = (Module['dynCall_viii'] = createExportWrapper('dynCall_viii'));

    /** @type {function(...*):?} */
    var dynCall_iiiii = (Module['dynCall_iiiii'] = createExportWrapper('dynCall_iiiii'));

    /** @type {function(...*):?} */
    var dynCall_vi = (Module['dynCall_vi'] = createExportWrapper('dynCall_vi'));

    /** @type {function(...*):?} */
    var dynCall_iiii = (Module['dynCall_iiii'] = createExportWrapper('dynCall_iiii'));

    /** @type {function(...*):?} */
    var dynCall_ii = (Module['dynCall_ii'] = createExportWrapper('dynCall_ii'));

    /** @type {function(...*):?} */
    var dynCall_i = (Module['dynCall_i'] = createExportWrapper('dynCall_i'));

    /** @type {function(...*):?} */
    var dynCall_iidiiii = (Module['dynCall_iidiiii'] = createExportWrapper('dynCall_iidiiii'));

    /** @type {function(...*):?} */
    var dynCall_vii = (Module['dynCall_vii'] = createExportWrapper('dynCall_vii'));

    /** @type {function(...*):?} */
    var dynCall_jiji = (Module['dynCall_jiji'] = createExportWrapper('dynCall_jiji'));

    /** @type {function(...*):?} */
    var _asyncify_start_unwind = (Module['_asyncify_start_unwind'] = createExportWrapper('asyncify_start_unwind'));

    /** @type {function(...*):?} */
    var _asyncify_stop_unwind = (Module['_asyncify_stop_unwind'] = createExportWrapper('asyncify_stop_unwind'));

    /** @type {function(...*):?} */
    var _asyncify_start_rewind = (Module['_asyncify_start_rewind'] = createExportWrapper('asyncify_start_rewind'));

    /** @type {function(...*):?} */
    var _asyncify_stop_rewind = (Module['_asyncify_stop_rewind'] = createExportWrapper('asyncify_stop_rewind'));

    // === Auto-generated postamble setup entry stuff ===

    if (!Object.getOwnPropertyDescriptor(Module, 'intArrayFromString'))
      Module['intArrayFromString'] = function () {
        abort("'intArrayFromString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'intArrayToString'))
      Module['intArrayToString'] = function () {
        abort("'intArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'ccall'))
      Module['ccall'] = function () {
        abort("'ccall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    Module['cwrap'] = cwrap;
    if (!Object.getOwnPropertyDescriptor(Module, 'setValue'))
      Module['setValue'] = function () {
        abort("'setValue' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    Module['getValue'] = getValue;
    if (!Object.getOwnPropertyDescriptor(Module, 'allocate'))
      Module['allocate'] = function () {
        abort("'allocate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'UTF8ArrayToString'))
      Module['UTF8ArrayToString'] = function () {
        abort("'UTF8ArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'UTF8ToString'))
      Module['UTF8ToString'] = function () {
        abort("'UTF8ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stringToUTF8Array'))
      Module['stringToUTF8Array'] = function () {
        abort("'stringToUTF8Array' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stringToUTF8'))
      Module['stringToUTF8'] = function () {
        abort("'stringToUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'lengthBytesUTF8'))
      Module['lengthBytesUTF8'] = function () {
        abort("'lengthBytesUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stackTrace'))
      Module['stackTrace'] = function () {
        abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'addOnPreRun'))
      Module['addOnPreRun'] = function () {
        abort("'addOnPreRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'addOnInit'))
      Module['addOnInit'] = function () {
        abort("'addOnInit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'addOnPreMain'))
      Module['addOnPreMain'] = function () {
        abort("'addOnPreMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'addOnExit'))
      Module['addOnExit'] = function () {
        abort("'addOnExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'addOnPostRun'))
      Module['addOnPostRun'] = function () {
        abort("'addOnPostRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeStringToMemory'))
      Module['writeStringToMemory'] = function () {
        abort("'writeStringToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeArrayToMemory'))
      Module['writeArrayToMemory'] = function () {
        abort("'writeArrayToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeAsciiToMemory'))
      Module['writeAsciiToMemory'] = function () {
        abort("'writeAsciiToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'addRunDependency'))
      Module['addRunDependency'] = function () {
        abort(
          "'addRunDependency' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'removeRunDependency'))
      Module['removeRunDependency'] = function () {
        abort(
          "'removeRunDependency' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'FS_createFolder'))
      Module['FS_createFolder'] = function () {
        abort("'FS_createFolder' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'FS_createPath'))
      Module['FS_createPath'] = function () {
        abort(
          "'FS_createPath' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'FS_createDataFile'))
      Module['FS_createDataFile'] = function () {
        abort(
          "'FS_createDataFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'FS_createPreloadedFile'))
      Module['FS_createPreloadedFile'] = function () {
        abort(
          "'FS_createPreloadedFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'FS_createLazyFile'))
      Module['FS_createLazyFile'] = function () {
        abort(
          "'FS_createLazyFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'FS_createLink'))
      Module['FS_createLink'] = function () {
        abort("'FS_createLink' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'FS_createDevice'))
      Module['FS_createDevice'] = function () {
        abort(
          "'FS_createDevice' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'FS_unlink'))
      Module['FS_unlink'] = function () {
        abort(
          "'FS_unlink' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getLEB'))
      Module['getLEB'] = function () {
        abort("'getLEB' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getFunctionTables'))
      Module['getFunctionTables'] = function () {
        abort("'getFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'alignFunctionTables'))
      Module['alignFunctionTables'] = function () {
        abort("'alignFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerFunctions'))
      Module['registerFunctions'] = function () {
        abort("'registerFunctions' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    Module['addFunction'] = addFunction;
    if (!Object.getOwnPropertyDescriptor(Module, 'removeFunction'))
      Module['removeFunction'] = function () {
        abort("'removeFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getFuncWrapper'))
      Module['getFuncWrapper'] = function () {
        abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'prettyPrint'))
      Module['prettyPrint'] = function () {
        abort("'prettyPrint' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'dynCall'))
      Module['dynCall'] = function () {
        abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getCompilerSetting'))
      Module['getCompilerSetting'] = function () {
        abort("'getCompilerSetting' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'print'))
      Module['print'] = function () {
        abort("'print' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'printErr'))
      Module['printErr'] = function () {
        abort("'printErr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getTempRet0'))
      Module['getTempRet0'] = function () {
        abort("'getTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'setTempRet0'))
      Module['setTempRet0'] = function () {
        abort("'setTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'callMain'))
      Module['callMain'] = function () {
        abort("'callMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'abort'))
      Module['abort'] = function () {
        abort("'abort' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'keepRuntimeAlive'))
      Module['keepRuntimeAlive'] = function () {
        abort("'keepRuntimeAlive' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'zeroMemory'))
      Module['zeroMemory'] = function () {
        abort("'zeroMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stringToNewUTF8'))
      Module['stringToNewUTF8'] = function () {
        abort("'stringToNewUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'setFileTime'))
      Module['setFileTime'] = function () {
        abort("'setFileTime' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'emscripten_realloc_buffer'))
      Module['emscripten_realloc_buffer'] = function () {
        abort("'emscripten_realloc_buffer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'ENV'))
      Module['ENV'] = function () {
        abort("'ENV' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'ERRNO_CODES'))
      Module['ERRNO_CODES'] = function () {
        abort("'ERRNO_CODES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'ERRNO_MESSAGES'))
      Module['ERRNO_MESSAGES'] = function () {
        abort("'ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'setErrNo'))
      Module['setErrNo'] = function () {
        abort("'setErrNo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'inetPton4'))
      Module['inetPton4'] = function () {
        abort("'inetPton4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'inetNtop4'))
      Module['inetNtop4'] = function () {
        abort("'inetNtop4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'inetPton6'))
      Module['inetPton6'] = function () {
        abort("'inetPton6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'inetNtop6'))
      Module['inetNtop6'] = function () {
        abort("'inetNtop6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'readSockaddr'))
      Module['readSockaddr'] = function () {
        abort("'readSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeSockaddr'))
      Module['writeSockaddr'] = function () {
        abort("'writeSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'DNS'))
      Module['DNS'] = function () {
        abort("'DNS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getHostByName'))
      Module['getHostByName'] = function () {
        abort("'getHostByName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'GAI_ERRNO_MESSAGES'))
      Module['GAI_ERRNO_MESSAGES'] = function () {
        abort("'GAI_ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'Protocols'))
      Module['Protocols'] = function () {
        abort("'Protocols' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'Sockets'))
      Module['Sockets'] = function () {
        abort("'Sockets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getRandomDevice'))
      Module['getRandomDevice'] = function () {
        abort("'getRandomDevice' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'traverseStack'))
      Module['traverseStack'] = function () {
        abort("'traverseStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'UNWIND_CACHE'))
      Module['UNWIND_CACHE'] = function () {
        abort("'UNWIND_CACHE' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'withBuiltinMalloc'))
      Module['withBuiltinMalloc'] = function () {
        abort("'withBuiltinMalloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'readAsmConstArgsArray'))
      Module['readAsmConstArgsArray'] = function () {
        abort("'readAsmConstArgsArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'readAsmConstArgs'))
      Module['readAsmConstArgs'] = function () {
        abort("'readAsmConstArgs' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'mainThreadEM_ASM'))
      Module['mainThreadEM_ASM'] = function () {
        abort("'mainThreadEM_ASM' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'jstoi_q'))
      Module['jstoi_q'] = function () {
        abort("'jstoi_q' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'jstoi_s'))
      Module['jstoi_s'] = function () {
        abort("'jstoi_s' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getExecutableName'))
      Module['getExecutableName'] = function () {
        abort("'getExecutableName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'listenOnce'))
      Module['listenOnce'] = function () {
        abort("'listenOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'autoResumeAudioContext'))
      Module['autoResumeAudioContext'] = function () {
        abort("'autoResumeAudioContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'dynCallLegacy'))
      Module['dynCallLegacy'] = function () {
        abort("'dynCallLegacy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getDynCaller'))
      Module['getDynCaller'] = function () {
        abort("'getDynCaller' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'dynCall'))
      Module['dynCall'] = function () {
        abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'callRuntimeCallbacks'))
      Module['callRuntimeCallbacks'] = function () {
        abort("'callRuntimeCallbacks' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'handleException'))
      Module['handleException'] = function () {
        abort("'handleException' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'runtimeKeepalivePush'))
      Module['runtimeKeepalivePush'] = function () {
        abort("'runtimeKeepalivePush' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'runtimeKeepalivePop'))
      Module['runtimeKeepalivePop'] = function () {
        abort("'runtimeKeepalivePop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'callUserCallback'))
      Module['callUserCallback'] = function () {
        abort("'callUserCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'maybeExit'))
      Module['maybeExit'] = function () {
        abort("'maybeExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'safeSetTimeout'))
      Module['safeSetTimeout'] = function () {
        abort("'safeSetTimeout' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'asmjsMangle'))
      Module['asmjsMangle'] = function () {
        abort("'asmjsMangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'asyncLoad'))
      Module['asyncLoad'] = function () {
        abort("'asyncLoad' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'alignMemory'))
      Module['alignMemory'] = function () {
        abort("'alignMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'mmapAlloc'))
      Module['mmapAlloc'] = function () {
        abort("'mmapAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'reallyNegative'))
      Module['reallyNegative'] = function () {
        abort("'reallyNegative' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'unSign'))
      Module['unSign'] = function () {
        abort("'unSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'reSign'))
      Module['reSign'] = function () {
        abort("'reSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'formatString'))
      Module['formatString'] = function () {
        abort("'formatString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'PATH'))
      Module['PATH'] = function () {
        abort("'PATH' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'PATH_FS'))
      Module['PATH_FS'] = function () {
        abort("'PATH_FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'SYSCALLS'))
      Module['SYSCALLS'] = function () {
        abort("'SYSCALLS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'syscallMmap2'))
      Module['syscallMmap2'] = function () {
        abort("'syscallMmap2' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'syscallMunmap'))
      Module['syscallMunmap'] = function () {
        abort("'syscallMunmap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getSocketFromFD'))
      Module['getSocketFromFD'] = function () {
        abort("'getSocketFromFD' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getSocketAddress'))
      Module['getSocketAddress'] = function () {
        abort("'getSocketAddress' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'JSEvents'))
      Module['JSEvents'] = function () {
        abort("'JSEvents' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerKeyEventCallback'))
      Module['registerKeyEventCallback'] = function () {
        abort("'registerKeyEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'specialHTMLTargets'))
      Module['specialHTMLTargets'] = function () {
        abort("'specialHTMLTargets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'maybeCStringToJsString'))
      Module['maybeCStringToJsString'] = function () {
        abort("'maybeCStringToJsString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'findEventTarget'))
      Module['findEventTarget'] = function () {
        abort("'findEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'findCanvasEventTarget'))
      Module['findCanvasEventTarget'] = function () {
        abort("'findCanvasEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getBoundingClientRect'))
      Module['getBoundingClientRect'] = function () {
        abort("'getBoundingClientRect' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'fillMouseEventData'))
      Module['fillMouseEventData'] = function () {
        abort("'fillMouseEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerMouseEventCallback'))
      Module['registerMouseEventCallback'] = function () {
        abort("'registerMouseEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerWheelEventCallback'))
      Module['registerWheelEventCallback'] = function () {
        abort("'registerWheelEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerUiEventCallback'))
      Module['registerUiEventCallback'] = function () {
        abort("'registerUiEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerFocusEventCallback'))
      Module['registerFocusEventCallback'] = function () {
        abort("'registerFocusEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'fillDeviceOrientationEventData'))
      Module['fillDeviceOrientationEventData'] = function () {
        abort("'fillDeviceOrientationEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerDeviceOrientationEventCallback'))
      Module['registerDeviceOrientationEventCallback'] = function () {
        abort(
          "'registerDeviceOrientationEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'fillDeviceMotionEventData'))
      Module['fillDeviceMotionEventData'] = function () {
        abort("'fillDeviceMotionEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerDeviceMotionEventCallback'))
      Module['registerDeviceMotionEventCallback'] = function () {
        abort("'registerDeviceMotionEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'screenOrientation'))
      Module['screenOrientation'] = function () {
        abort("'screenOrientation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'fillOrientationChangeEventData'))
      Module['fillOrientationChangeEventData'] = function () {
        abort("'fillOrientationChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerOrientationChangeEventCallback'))
      Module['registerOrientationChangeEventCallback'] = function () {
        abort(
          "'registerOrientationChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'fillFullscreenChangeEventData'))
      Module['fillFullscreenChangeEventData'] = function () {
        abort("'fillFullscreenChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerFullscreenChangeEventCallback'))
      Module['registerFullscreenChangeEventCallback'] = function () {
        abort(
          "'registerFullscreenChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerRestoreOldStyle'))
      Module['registerRestoreOldStyle'] = function () {
        abort("'registerRestoreOldStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'hideEverythingExceptGivenElement'))
      Module['hideEverythingExceptGivenElement'] = function () {
        abort("'hideEverythingExceptGivenElement' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'restoreHiddenElements'))
      Module['restoreHiddenElements'] = function () {
        abort("'restoreHiddenElements' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'setLetterbox'))
      Module['setLetterbox'] = function () {
        abort("'setLetterbox' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'currentFullscreenStrategy'))
      Module['currentFullscreenStrategy'] = function () {
        abort("'currentFullscreenStrategy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'restoreOldWindowedStyle'))
      Module['restoreOldWindowedStyle'] = function () {
        abort("'restoreOldWindowedStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'softFullscreenResizeWebGLRenderTarget'))
      Module['softFullscreenResizeWebGLRenderTarget'] = function () {
        abort(
          "'softFullscreenResizeWebGLRenderTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'doRequestFullscreen'))
      Module['doRequestFullscreen'] = function () {
        abort("'doRequestFullscreen' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'fillPointerlockChangeEventData'))
      Module['fillPointerlockChangeEventData'] = function () {
        abort("'fillPointerlockChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerPointerlockChangeEventCallback'))
      Module['registerPointerlockChangeEventCallback'] = function () {
        abort(
          "'registerPointerlockChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerPointerlockErrorEventCallback'))
      Module['registerPointerlockErrorEventCallback'] = function () {
        abort(
          "'registerPointerlockErrorEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'requestPointerLock'))
      Module['requestPointerLock'] = function () {
        abort("'requestPointerLock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'fillVisibilityChangeEventData'))
      Module['fillVisibilityChangeEventData'] = function () {
        abort("'fillVisibilityChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerVisibilityChangeEventCallback'))
      Module['registerVisibilityChangeEventCallback'] = function () {
        abort(
          "'registerVisibilityChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerTouchEventCallback'))
      Module['registerTouchEventCallback'] = function () {
        abort("'registerTouchEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'fillGamepadEventData'))
      Module['fillGamepadEventData'] = function () {
        abort("'fillGamepadEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerGamepadEventCallback'))
      Module['registerGamepadEventCallback'] = function () {
        abort("'registerGamepadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerBeforeUnloadEventCallback'))
      Module['registerBeforeUnloadEventCallback'] = function () {
        abort("'registerBeforeUnloadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'fillBatteryEventData'))
      Module['fillBatteryEventData'] = function () {
        abort("'fillBatteryEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'battery'))
      Module['battery'] = function () {
        abort("'battery' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'registerBatteryEventCallback'))
      Module['registerBatteryEventCallback'] = function () {
        abort("'registerBatteryEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'setCanvasElementSize'))
      Module['setCanvasElementSize'] = function () {
        abort("'setCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getCanvasElementSize'))
      Module['getCanvasElementSize'] = function () {
        abort("'getCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'polyfillSetImmediate'))
      Module['polyfillSetImmediate'] = function () {
        abort("'polyfillSetImmediate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'demangle'))
      Module['demangle'] = function () {
        abort("'demangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'demangleAll'))
      Module['demangleAll'] = function () {
        abort("'demangleAll' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'jsStackTrace'))
      Module['jsStackTrace'] = function () {
        abort("'jsStackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stackTrace'))
      Module['stackTrace'] = function () {
        abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getEnvStrings'))
      Module['getEnvStrings'] = function () {
        abort("'getEnvStrings' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'checkWasiClock'))
      Module['checkWasiClock'] = function () {
        abort("'checkWasiClock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'flush_NO_FILESYSTEM'))
      Module['flush_NO_FILESYSTEM'] = function () {
        abort("'flush_NO_FILESYSTEM' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeI53ToI64'))
      Module['writeI53ToI64'] = function () {
        abort("'writeI53ToI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeI53ToI64Clamped'))
      Module['writeI53ToI64Clamped'] = function () {
        abort("'writeI53ToI64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeI53ToI64Signaling'))
      Module['writeI53ToI64Signaling'] = function () {
        abort("'writeI53ToI64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeI53ToU64Clamped'))
      Module['writeI53ToU64Clamped'] = function () {
        abort("'writeI53ToU64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeI53ToU64Signaling'))
      Module['writeI53ToU64Signaling'] = function () {
        abort("'writeI53ToU64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'readI53FromI64'))
      Module['readI53FromI64'] = function () {
        abort("'readI53FromI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'readI53FromU64'))
      Module['readI53FromU64'] = function () {
        abort("'readI53FromU64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'convertI32PairToI53'))
      Module['convertI32PairToI53'] = function () {
        abort("'convertI32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'convertU32PairToI53'))
      Module['convertU32PairToI53'] = function () {
        abort("'convertU32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'uncaughtExceptionCount'))
      Module['uncaughtExceptionCount'] = function () {
        abort("'uncaughtExceptionCount' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'exceptionLast'))
      Module['exceptionLast'] = function () {
        abort("'exceptionLast' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'exceptionCaught'))
      Module['exceptionCaught'] = function () {
        abort("'exceptionCaught' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'ExceptionInfo'))
      Module['ExceptionInfo'] = function () {
        abort("'ExceptionInfo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'CatchInfo'))
      Module['CatchInfo'] = function () {
        abort("'CatchInfo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'exception_addRef'))
      Module['exception_addRef'] = function () {
        abort("'exception_addRef' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'exception_decRef'))
      Module['exception_decRef'] = function () {
        abort("'exception_decRef' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'Browser'))
      Module['Browser'] = function () {
        abort("'Browser' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'funcWrappers'))
      Module['funcWrappers'] = function () {
        abort("'funcWrappers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'getFuncWrapper'))
      Module['getFuncWrapper'] = function () {
        abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'setMainLoop'))
      Module['setMainLoop'] = function () {
        abort("'setMainLoop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'wget'))
      Module['wget'] = function () {
        abort("'wget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'FS'))
      Module['FS'] = function () {
        abort("'FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'MEMFS'))
      Module['MEMFS'] = function () {
        abort("'MEMFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'TTY'))
      Module['TTY'] = function () {
        abort("'TTY' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'PIPEFS'))
      Module['PIPEFS'] = function () {
        abort("'PIPEFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'SOCKFS'))
      Module['SOCKFS'] = function () {
        abort("'SOCKFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, '_setNetworkCallback'))
      Module['_setNetworkCallback'] = function () {
        abort("'_setNetworkCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'tempFixedLengthArray'))
      Module['tempFixedLengthArray'] = function () {
        abort("'tempFixedLengthArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'miniTempWebGLFloatBuffers'))
      Module['miniTempWebGLFloatBuffers'] = function () {
        abort("'miniTempWebGLFloatBuffers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'heapObjectForWebGLType'))
      Module['heapObjectForWebGLType'] = function () {
        abort("'heapObjectForWebGLType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'heapAccessShiftForWebGLHeap'))
      Module['heapAccessShiftForWebGLHeap'] = function () {
        abort("'heapAccessShiftForWebGLHeap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'GL'))
      Module['GL'] = function () {
        abort("'GL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'emscriptenWebGLGet'))
      Module['emscriptenWebGLGet'] = function () {
        abort("'emscriptenWebGLGet' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'computeUnpackAlignedImageSize'))
      Module['computeUnpackAlignedImageSize'] = function () {
        abort("'computeUnpackAlignedImageSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'emscriptenWebGLGetTexPixelData'))
      Module['emscriptenWebGLGetTexPixelData'] = function () {
        abort("'emscriptenWebGLGetTexPixelData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'emscriptenWebGLGetUniform'))
      Module['emscriptenWebGLGetUniform'] = function () {
        abort("'emscriptenWebGLGetUniform' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'webglGetUniformLocation'))
      Module['webglGetUniformLocation'] = function () {
        abort("'webglGetUniformLocation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'webglPrepareUniformLocationsBeforeFirstUse'))
      Module['webglPrepareUniformLocationsBeforeFirstUse'] = function () {
        abort(
          "'webglPrepareUniformLocationsBeforeFirstUse' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'webglGetLeftBracePos'))
      Module['webglGetLeftBracePos'] = function () {
        abort("'webglGetLeftBracePos' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'emscriptenWebGLGetVertexAttrib'))
      Module['emscriptenWebGLGetVertexAttrib'] = function () {
        abort("'emscriptenWebGLGetVertexAttrib' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'writeGLArray'))
      Module['writeGLArray'] = function () {
        abort("'writeGLArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'AL'))
      Module['AL'] = function () {
        abort("'AL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'SDL_unicode'))
      Module['SDL_unicode'] = function () {
        abort("'SDL_unicode' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'SDL_ttfContext'))
      Module['SDL_ttfContext'] = function () {
        abort("'SDL_ttfContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'SDL_audio'))
      Module['SDL_audio'] = function () {
        abort("'SDL_audio' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'SDL'))
      Module['SDL'] = function () {
        abort("'SDL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'SDL_gfx'))
      Module['SDL_gfx'] = function () {
        abort("'SDL_gfx' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'GLUT'))
      Module['GLUT'] = function () {
        abort("'GLUT' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'EGL'))
      Module['EGL'] = function () {
        abort("'EGL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'GLFW_Window'))
      Module['GLFW_Window'] = function () {
        abort("'GLFW_Window' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'GLFW'))
      Module['GLFW'] = function () {
        abort("'GLFW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'GLEW'))
      Module['GLEW'] = function () {
        abort("'GLEW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'IDBStore'))
      Module['IDBStore'] = function () {
        abort("'IDBStore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'runAndAbortIfError'))
      Module['runAndAbortIfError'] = function () {
        abort("'runAndAbortIfError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    Module['Asyncify'] = Asyncify;
    if (!Object.getOwnPropertyDescriptor(Module, 'Fibers'))
      Module['Fibers'] = function () {
        abort("'Fibers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'warnOnce'))
      Module['warnOnce'] = function () {
        abort("'warnOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stackSave'))
      Module['stackSave'] = function () {
        abort("'stackSave' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stackRestore'))
      Module['stackRestore'] = function () {
        abort("'stackRestore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stackAlloc'))
      Module['stackAlloc'] = function () {
        abort("'stackAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'AsciiToString'))
      Module['AsciiToString'] = function () {
        abort("'AsciiToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stringToAscii'))
      Module['stringToAscii'] = function () {
        abort("'stringToAscii' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'UTF16ToString'))
      Module['UTF16ToString'] = function () {
        abort("'UTF16ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'stringToUTF16'))
      Module['stringToUTF16'] = function () {
        abort("'stringToUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'lengthBytesUTF16'))
      Module['lengthBytesUTF16'] = function () {
        abort("'lengthBytesUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    Module['UTF32ToString'] = UTF32ToString;
    Module['stringToUTF32'] = stringToUTF32;
    Module['lengthBytesUTF32'] = lengthBytesUTF32;
    if (!Object.getOwnPropertyDescriptor(Module, 'allocateUTF8'))
      Module['allocateUTF8'] = function () {
        abort("'allocateUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    if (!Object.getOwnPropertyDescriptor(Module, 'allocateUTF8OnStack'))
      Module['allocateUTF8OnStack'] = function () {
        abort("'allocateUTF8OnStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
      };
    Module['writeStackCookie'] = writeStackCookie;
    Module['checkStackCookie'] = checkStackCookie;
    if (!Object.getOwnPropertyDescriptor(Module, 'ALLOC_NORMAL'))
      Object.defineProperty(Module, 'ALLOC_NORMAL', {
        configurable: true,
        get: function () {
          abort("'ALLOC_NORMAL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
        },
      });
    if (!Object.getOwnPropertyDescriptor(Module, 'ALLOC_STACK'))
      Object.defineProperty(Module, 'ALLOC_STACK', {
        configurable: true,
        get: function () {
          abort("'ALLOC_STACK' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)");
        },
      });

    var calledRun;

    /**
     * @constructor
     * @this {ExitStatus}
     */
    function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }

    var calledMain = false;

    dependenciesFulfilled = function runCaller() {
      // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
    };

    function stackCheckInit() {
      // This is normally called automatically during __wasm_call_ctors but need to
      // get these values before even running any of the ctors so we call it redundantly
      // here.
      // TODO(sbc): Move writeStackCookie to native to to avoid this.
      _emscripten_stack_init();
      writeStackCookie();
    }

    /** @type {function(Array=)} */
    function run(args) {
      args = args || arguments_;

      if (runDependencies > 0) {
        return;
      }

      stackCheckInit();

      preRun();

      // a preRun added a dependency, run will be called later
      if (runDependencies > 0) {
        return;
      }

      function doRun() {
        // run may have just been called through dependencies being fulfilled just in this very frame,
        // or while the async setStatus time below was happening
        if (calledRun) return;
        calledRun = true;
        Module['calledRun'] = true;

        if (ABORT) return;

        initRuntime();

        readyPromiseResolve(Module);
        if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

        assert(
          !Module['_main'],
          'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'
        );

        postRun();
      }

      if (Module['setStatus']) {
        Module['setStatus']('Running...');
        setTimeout(function () {
          setTimeout(function () {
            Module['setStatus']('');
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
      checkStackCookie();
    }
    Module['run'] = run;

    function checkUnflushedContent() {
      // Compiler settings do not allow exiting the runtime, so flushing
      // the streams is not possible. but in ASSERTIONS mode we check
      // if there was something to flush, and if so tell the user they
      // should request that the runtime be exitable.
      // Normally we would not even include flush() at all, but in ASSERTIONS
      // builds we do so just for this check, and here we see if there is any
      // content to flush, that is, we check if there would have been
      // something a non-ASSERTIONS build would have not seen.
      // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
      // mode (which has its own special function for this; otherwise, all
      // the code is inside libc)
      var oldOut = out;
      var oldErr = err;
      var has = false;
      out = err = function (x) {
        has = true;
      };
      try {
        // it doesn't matter if it fails
        var flush = flush_NO_FILESYSTEM;
        if (flush) flush();
      } catch (e) {}
      out = oldOut;
      err = oldErr;
      if (has) {
        warnOnce(
          'stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.'
        );
        warnOnce(
          '(this may also be due to not including full filesystem support - try building with -s FORCE_FILESYSTEM=1)'
        );
      }
    }

    /** @param {boolean|number=} implicit */
    function exit(status, implicit) {
      EXITSTATUS = status;

      checkUnflushedContent();

      if (keepRuntimeAlive()) {
        // if exit() was called, we may warn the user if the runtime isn't actually being shut down
        if (!implicit) {
          var msg =
            'program exited (with status: ' +
            status +
            '), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)';
          readyPromiseReject(msg);
          err(msg);
        }
      } else {
        exitRuntime();
      }

      procExit(status);
    }

    function procExit(code) {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        if (Module['onExit']) Module['onExit'](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    }

    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
      while (Module['preInit'].length > 0) {
        Module['preInit'].pop()();
      }
    }

    run();

    return Module.ready;
  };
})();
if (typeof exports === 'object' && typeof module === 'object') module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], function () {
    return Module;
  });
else if (typeof exports === 'object') exports['Module'] = Module;
