/*
 * Derived work
 * Copyright 2010 SOFTEC sa. All rights reserved.
 *
 * Original work
 *   JavaScript Debug - v0.4 - 6/22/2010
 *   http://benalman.com/projects/javascript-debug-console-log/
 *   Copyright (c) 2010 "Cowboy" Ben Alman
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Here is a bookmarket for activating firebuglite and dump the history log:
 * javascript:(function(F,i,r,e,b,u,g,L,I,T,E){if(F.getElementById(b))return;E=F[i+'NS']&&F.documentElement.namespaceURI;E=E?F[i+'NS'](E,'script'):F[i]('script');E[r]('id',b);E[r]('src',I+g);E[r](b,u);E.text=T;(F[e]('head')[0]||F[e]('body')[0]).appendChild(E);E=new%20Image;E[r]('src',I+L);})(document,'createElement','setAttribute','getElementsByTagName','FirebugLite','4','firebug-lite.js','releases/lite/latest/skin/xp/sprite.png','https://getfirebug.com/','{startOpened:true,onLoad:function(){if(window.debug&&debug.setCallback){debug.setCallback(function(b){var a=Array.prototype.slice.call(arguments,!!console[b]),b=console[b]||((a[0]=b.toUpperCase())&&console.log);b.apply(console,a);},true)}}}');
 */

var debug = (function(debug, window){

  // Some convenient shortcuts.
  var aps = Array.prototype.slice,
      con = window.console,

      callback_func,
      callback_force,

      // Default logging level, show everything but code traces.
      default_log_level = 5,
      log_level = 5,

      // Logging methods, in "priority order". Not all console implementations
      // will utilize these, but they will be used in the callback passed to
      // setCallback. Last one is a special addition to allow a lower level
      // than log to exist and be used for special purposes.
      log_methods = [ 'error', 'warn', 'info', 'debug', 'log', 'callTrace' ],

      // Pass these methods through to the console if they exist, otherwise just
      // fail gracefully. These methods are provided for convenience.
      pass_methods = 'assert clear count dir dirxml exception group groupCollapsed groupEnd profile profileEnd table time timeEnd trace'.split(' '),
      idx = pass_methods.length,

      // Logs are stored here so that they can be recalled as necessary.
      logs = [];

  while ( --idx >= 0 ) {
    (function( method ){

      /**
       * Generate pass-through methods. These methods will be called, if they
       * exist, as long as the logging level is non-zero.
       * This function is applied for assert(), clear(), count(), dir(), dirxml(), exception(),
       * group(), groupCollapsed(), groupEnd(), profile(), profileEnd(), table(), time(),
       * timeEnd() and trace().
       */
      debug[ method ] = function() {
        log_level !== 0 && con && con[ method ] && con[ method ].apply
          && con[ method ].apply( con, arguments );
      }

    })( pass_methods[idx] );
  }

  idx = log_methods.length;
  while ( --idx >= 0 ) {
    (function( idx, level, logger, Ulevel, withLevel ){
      /**
       * Call the console equivalent method if available, otherwise call console.log.
       * Adds an entry into the logs array for a future callback that could be specified via
       * <debug.setCallback>.
       * This function is applied for callTrace(), log(), debug(), info(), warn() and error()
       */
      debug[ level ] = function() {
        var args = aps.call( arguments ),
            log_arr = [ level ].concat( args );

        logs.push( log_arr );
        exec_callback( log_arr );

        if ( !con || !is_level( idx ) ) { return; }

        if( withLevel ) { args = [ Ulevel ].concat( args ); }

        (con.firebug || con.firebuglite || con.markTimeline) ? con[ logger ].apply( con, args )
          : (con.log === print) ? con[ logger ].call( window, args ) // workaround for a consolex issue
          : con[ logger ] ? con[ logger ]( args )
          : con.log( (withLevel) ? args : [ Ulevel ].concat( args ) );
      };

      /**
       * Check if provided level is currently actively logged
       * @param level
       */
      debug['is'+level.substring(0,1).toUpperCase()+level.substring(1)+'Enabled'] = function() {
        return is_level(idx);
      };

    })( idx, log_methods[idx], log_methods[Math.min(idx,4)], log_methods[idx].toUpperCase(), idx>4 );
  }

  /**
   * Execute the callback function if set.
   * @private
   */
  function exec_callback( args ) {
    if ( callback_func && (callback_force || !con || !con.log) ) {
      callback_func.apply( window, args );
    }
  }

  /**
   * Set a minimum or maximum logging level for the console. Doesn't affect
   * the <debug.setCallback> callback function, but if set to 0 to disable
   * logging, <Pass-through console methods> will be disabled as well.
   *
   * @param {number} level If 0, disables logging.
   *                       If negative, shows N lowest priority levels of log messages.
   *                       callTrace(1) < log (2) < debug (3) < info (4) < warn (5) < error (6)
   *                       If positive, shows N highest priority levels of log messages.
   *                       callTrace(6) > log (5) > debug (4) > info (3) > warn (2) > error (1)
   */
  debug.setLevel = function( level ) {
    log_level = typeof level === 'number' ? level : default_log_level;
  };

  /**
   * Determine if the level is visible given the current log_level.
   * Note that level is minus one compared to log_level
   * @private
   * @param {number} level to check
   */
  function is_level( level ) {
    return log_level > 0
      ? log_level > level
      : log_methods.length + log_level <= level;
  }

  /**
   * Set a callback to be used if logging isn't possible due to console.log
   * not existing. If unlogged logs exist when callback is set, they will all
   * be logged immediately unless a limit is specified.
   *
   * @param {function} callback The aforementioned callback function. The first
   *                            argument is the logging level, and all subsequent
   *                            arguments are those passed to the initial debug
   *                            logging method.
   * @param {boolean} force If false, log to console.log if available, otherwise
   *                        callback. If true, log to both console.log and callback.
   * @param {number} limit If specified, number of lines to limit initial scrollback
   *                       to.
   */
  debug.setCallback = function() {
    var args = aps.call( arguments ),
      max = logs.length,
      i = max;

    callback_func = args.shift() || null;
    callback_force = typeof args[0] === 'boolean' ? args.shift() : false;

    i -= typeof args[0] === 'number' ? args.shift() : max;

    while ( i < max ) {
      exec_callback( logs[i++] );
    }
  };

  return debug;
})(debug || {}, typeof window !== "undefined") ? window : this);
