/*
 * Copyright 2010 SOFTEC sa. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('debug', function() {
  var   // Logging methods, in "priority order". Not all console implementations
        // will utilize these, but they will be used in the callback passed to
        // setCallback.
        checkLogMethods = function(fn) {
          var log_methods = [ 'error', 'warn', 'info', 'debug', 'log', 'callTrace' ];
          var idx = log_methods.length
          while ( --idx >= 0 ) {
            fn(log_methods[idx],log_methods[Math.min(idx,4)],idx+1);
          }
        },

        // Pass these methods through to the console if they exist, otherwise just
        // fail gracefully. These methods are provided for convenience.
        checkPassMethods = function(fn) {
          var pass_methods = 'assert clear count dir dirxml exception group groupCollapsed groupEnd profile profileEnd table time timeEnd trace'.split(' ');
          var idx = pass_methods.length
          while ( --idx >= 0 ) {
            fn(pass_methods[idx]);
          }
        },

        con = window.console,
        debug = window.debug;

  it('define debug in global scope', function() {
    expect(debug).toBeDefined();
  });

  it('define debug in global scope', function() {
    expect(debug.isLogEnabled()).toBeTruthy();
    expect(debug.isCallTraceEnabled()).toBeFalsy();
    debug.setLevel(6);
    expect(debug.isCallTraceEnabled()).toBeTruthy();
  });

  checkPassMethods(
    function(method){
      it('define debug.' + method + '() method', function() {
        expect(debug[method]).toEqual(jasmine.any(Function));
      });
    }
  );

  checkLogMethods(
    function(method){
      it('define debug.' + method + '() method', function() {
        expect(debug[method]).toEqual(jasmine.any(Function));
      });
    }
  );

  checkPassMethods(
    function(method){
      it('pass debug.' + method + '() calls to console.' + method +'()', function() {
        con[method] = function() {};
        spyOn(con, method);
        debug[method]('an argument for ' + method,'another argument for ' + method);
        expect(con[method]).toHaveBeenCalledWith('an argument for ' + method,'another argument for ' + method);
      });
    }
  );

  checkLogMethods (
    function(method, logger){
      it('pass debug.' + method + '() calls to console.' + logger +'()', function() {
        con[logger] = function() {};
        spyOn(con, logger);
        debug[method]('an argument for ' + method,'another argument for ' + method);
        expect(con[logger]).toHaveBeenCalledWith(['an argument for ' + method,'another argument for ' + method]);
      });
    }
  );

  checkLogMethods (
    function(method, logger){
      if( logger == 'log' ) return;
      it('have debug.' + method + '() calls falling back to console.log()', function() {
        delete con[method];
        delete con['firebug'];
        delete con['firebuglite'];
        con['log'] = function() {};
        spyOn(con, 'log');
        debug[method]('an argument for ' + method,'another argument for ' + method);
        expect(con['log']).toHaveBeenCalledWith(['an argument for ' + method,'another argument for ' + method]);
      });
    }
  );

  it('calls a callback function when an log is done (forced)', function() {
    var callback = jasmine.createSpy();
    debug.setCallback(callback,true,0);
    checkLogMethods (
      function(method){
        debug[method]('an argument for ' + method,'another argument for ' + method);
        expect(callback).toHaveBeenCalledWith(method, 'an argument for ' + method, 'another argument for ' + method);
      }
    );
  });

  it('store a logs history and report it when a callback is attached (forced)', function() {
    var callback = jasmine.createSpy();
    debug.setCallback(callback,true,4);
    expect(callback).toHaveBeenCalledWith( 'debug', 'an argument for debug', 'another argument for debug' );
    expect(callback).toHaveBeenCalledWith( 'info', 'an argument for info', 'another argument for info' );
    expect(callback).toHaveBeenCalledWith( 'warn', 'an argument for warn', 'another argument for warn' );
    expect(callback).toHaveBeenCalledWith( 'error', 'an argument for error', 'another argument for error' );
  });

  it('calls a callback function when an log is done (console.log() is not defined)', function() {
    var callback = jasmine.createSpy();
    debug.setCallback(callback,true,0);
    checkLogMethods (
      function(method){
        debug[method]('an argument for ' + method,'another argument for ' + method);
        expect(callback).toHaveBeenCalledWith(method, 'an argument for ' + method, 'another argument for ' + method);
      }
    );
  });

  it('store a logs history and report it when a callback is attached (console.log() is not defined)', function() {
    var callback = jasmine.createSpy();
    delete con['log'];
    debug.setCallback(callback,false,4);
    expect(callback).toHaveBeenCalledWith( 'debug', 'an argument for debug', 'another argument for debug' );
    expect(callback).toHaveBeenCalledWith( 'info', 'an argument for info', 'another argument for info' );
    expect(callback).toHaveBeenCalledWith( 'warn', 'an argument for warn', 'another argument for warn' );
    expect(callback).toHaveBeenCalledWith( 'error', 'an argument for error', 'another argument for error' );
  });

  it('filter lower debug levels calls', function() {
    var callback = jasmine.createSpy();
    debug.setCallback(callback,true,0);
    debug.setLevel(-3);
    checkLogMethods (
      function(method, logger, level){
        con[logger] = function() {};
        spyOn(con, logger);
        debug[method]('an argument for ' + method,'another argument for ' + method);
        if( level <= 3 ) {
          expect(con[logger]).not.toHaveBeenCalled();
        } else {
          expect(con[logger]).toHaveBeenCalledWith(['an argument for ' + method,'another argument for ' + method]);
        }
      }
    );
    expect(callback).toHaveBeenCalledWith( 'callTrace', 'an argument for callTrace', 'another argument for callTrace' );
    expect(callback).toHaveBeenCalledWith( 'log', 'an argument for log', 'another argument for log' );
    expect(callback).toHaveBeenCalledWith( 'debug', 'an argument for debug', 'another argument for debug' );
    expect(callback).toHaveBeenCalledWith( 'info', 'an argument for info', 'another argument for info' );
    expect(callback).toHaveBeenCalledWith( 'warn', 'an argument for warn', 'another argument for warn' );
    expect(callback).toHaveBeenCalledWith( 'error', 'an argument for error', 'another argument for error' );
  });

  it('filter higher debug levels calls', function() {
    var callback = jasmine.createSpy();
    debug.setCallback(callback,true,0);
    debug.setLevel(3);
    checkLogMethods (
      function(method, logger, level){
        con[logger] = function() {};
        spyOn(con, logger);
        debug[method]('an argument for ' + method,'another argument for ' + method);
        if( level > 3 ) {
          expect(con[logger]).not.toHaveBeenCalled();
        } else {
          expect(con[logger]).toHaveBeenCalledWith(['an argument for ' + method,'another argument for ' + method]);
        }
      }
    );
    expect(callback).toHaveBeenCalledWith( 'callTrace', 'an argument for callTrace', 'another argument for callTrace' );
    expect(callback).toHaveBeenCalledWith( 'log', 'an argument for log', 'another argument for log' );
    expect(callback).toHaveBeenCalledWith( 'debug', 'an argument for debug', 'another argument for debug' );
    expect(callback).toHaveBeenCalledWith( 'info', 'an argument for info', 'another argument for info' );
    expect(callback).toHaveBeenCalledWith( 'warn', 'an argument for warn', 'another argument for warn' );
    expect(callback).toHaveBeenCalledWith( 'error', 'an argument for error', 'another argument for error' );
  });
});
