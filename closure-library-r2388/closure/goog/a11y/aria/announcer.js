// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Announcer that allows messages to be spoken by assistive
 * technologies.
 */

goog.provide('goog.a11y.aria.Announcer');

goog.require('goog.Disposable');
goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.LivePriority');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.object');



/**
 * Class that allows messages to be spoken by assistive technologies that the
 * user may have active.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.a11y.aria.Announcer = function(opt_domHelper) {
  goog.base(this);

  /**
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * Map of priority to live region elements to use for communicating updates.
   * Elements are created on demand.
   * @type {Object.<goog.a11y.aria.LivePriority, Element>}
   * @private
   */
  this.liveRegions_ = {};
};
goog.inherits(goog.a11y.aria.Announcer, goog.Disposable);


/** @override */
goog.a11y.aria.Announcer.prototype.disposeInternal = function() {
  goog.object.forEach(
      this.liveRegions_, this.domHelper_.removeNode, this.domHelper_);
  this.liveRegions_ = null;
  this.domHelper_ = null;
  goog.base(this, 'disposeInternal');
};


/**
 * Announce a message to be read by any assistive technologies the user may
 * have active.
 * @param {string} message The message to announce to screen readers.
 * @param {goog.a11y.aria.LivePriority=} opt_priority The priority of the
 *     message. Defaults to POLITE.
 */
goog.a11y.aria.Announcer.prototype.say = function(message, opt_priority) {
  goog.dom.setTextContent(this.getLiveRegion_(
      opt_priority || goog.a11y.aria.LivePriority.POLITE), message);
};


/**
 * Returns an aria-live region that can be used to communicate announcements.
 * @param {!goog.a11y.aria.LivePriority} priority The required priority.
 * @return {Element} A live region of the requested priority.
 * @private
 */
goog.a11y.aria.Announcer.prototype.getLiveRegion_ = function(priority) {
  if (this.liveRegions_[priority]) {
    return this.liveRegions_[priority];
  }
  var liveRegion;
  liveRegion = this.domHelper_.createElement('div');
  liveRegion.style.position = 'absolute';
  liveRegion.style.top = '-1000px';
  goog.a11y.aria.setState(liveRegion, goog.a11y.aria.State.LIVE,
      priority);
  goog.a11y.aria.setState(liveRegion, goog.a11y.aria.State.ATOMIC,
      'true');
  this.domHelper_.getDocument().body.appendChild(liveRegion);
  this.liveRegions_[priority] = liveRegion;
  return liveRegion;
};
