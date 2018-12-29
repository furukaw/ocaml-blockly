/**
 * @fileoverview Class managing errors during a block drag.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

goog.provide('Blockly.DiagnosisManager');
goog.provide('Blockly.ErrorCollector');
goog.provide('Blockly.ErrorItem');

goog.require('goog.asserts');

/**
 * Class to show a dialog to explain reasons why a dragged block is not allowed
 * to connect to the closest connection, why it's dropped in the current
 * position, or etc during a block drag.
 * @constructor
 */
Blockly.DiagnosisManager = function() {
  this.unboundCollector_ = new Blockly.ErrorCollector()
};

/**
 * Update the error dialog during a block drag.
 * @param {Blockly.ConnectionDB.errorReason} closestError The reason why the
 *     closest connection is incompatible with the dragged block. Null if it's
 *     compatible.
 */
Blockly.DiagnosisManager.prototype.update = function(closestError) {
  var message = null;
  if (closestError) {
    var collector = /** @type {!Blockly.ErrorCollector_} */closestError.error;
    message = collector.toMessage();
  } else if (!this.unboundCollector_.isEmpty()) {
    message = this.unboundCollector_.toMessage();
  }

  this.updateErrorDialog_(message);
  this.unboundCollector_.clear();
};

/**
 * Update message on the error dialog or hide the dialog.
 * @param {string} Message to be shown in a dialog. Null to hide the dialog.
 */
Blockly.DiagnosisManager.prototype.updateErrorDialog_ = function(message) {
  // TODO(harukam): Create dialog element.
  if (!message) {
    return;
  }
  console.log(message);
};

/**
 * Returns object to collect unbound errors. It may be updated by caller.
 * @return {!Blockly.ErrorCollector}
 */
Blockly.DiagnosisManager.prototype.getUnboundCollector = function() {
  return this.unboundCollector_;
};

/**
 * Dispose of the manager.
 */
Blockly.DiagnosisManager.prototype.dispose = function() {
};

/**
 * Class to collect errors.
 * @constructor
 */
Blockly.ErrorCollector = function() {
  /** @type {!Array.<!Blockly.ErrorItem>} */
  this.errors_ = [];
};

/**
 * Creates error message from collected errors.
 * @return {!string} Error message.
 */
Blockly.ErrorCollector.prototype.toMessage = function() {
  if (this.errors_.length == 0) {
    return '';
  }
  var firstError = this.errors_[0];
  return firstError.toMessage();
};

/**
 * Returns whether the collector doesn't hold any error.
 */
Blockly.ErrorCollector.prototype.isEmpty = function() {
  return this.errors_.length == 0;
};

/**
 * Clear collected errors.
 */
Blockly.ErrorCollector.prototype.clear = function() {
  this.errors_.length = 0;
};

/**
 * @param {!Blockly.ErrorItem} item
 * @private
 */
Blockly.ErrorCollector.prototype.addItem_ = function(item) {
  this.errors_.push(item);
};

/**
 * Gets a list of variables from collected errors.
 * @return {!Array.<!Blockly.BoundVariableValueReference>}
 */
Blockly.ErrorCollector.prototype.getUnboundVariables = function() {
  var unresolved = [];
  for (var i = 0, err; err = this.errors_[i]; i++) {
    var reference = err.errorElement;
    unresolved.push(reference);
  }
  return unresolved;
};

/**
 * @param {!Blockly.BoundVariableValueReference} reference The variable found
 *     to be unbound.
 * @param {Blockly.BoundVariableValue} wrongValue The wrong variable value in
 *     the reference's context. If null, the reference is just undefined in the
 *     context.
 */
Blockly.ErrorCollector.prototype.addUnboundVariable = function(reference,
    wrongValue) {
  var item = new Blockly.ErrorItem(Blockly.ErrorItem.UNBOUND_VARIABLE,
      reference, wrongValue);
  this.addItem_(item);
};

/**
 * @param {!Blockly.TypeExpr.Error} err The caused error object.
 */
Blockly.ErrorCollector.prototype.addTypeError = function(typeError) {
  var item = new Blockly.ErrorItem(Blockly.ErrorItem.TYPE_ERROR, typeError);
  this.addItem_(item);
};

/**
 * @constructor
 */
Blockly.ErrorItem = function(label, errorElement, errorTarget) {
  this.label = label;
  this.errorElement = errorElement;
  this.errorTarget = errorTarget;
};

Blockly.ErrorItem.UNBOUND_VARIABLE = 1;
Blockly.ErrorItem.TYPE_ERROR = 2;

/**
 * Returns error message.
 * @return {!string} Error message.
 */
Blockly.ErrorItem.prototype.toMessage = function() {
  var msg = '';
  if (this.label == Blockly.ErrorItem.UNBOUND_VARIABLE) {
    var name = this.errorElement.getVariableName();
    msg += 'Variable `' + name + '\' is ';
    if (this.errorTarget) {
      msg += 'bound to unexpected variable value.';
    } else {
      msg += 'unbound.';
    }
  } else if (this.label == Blockly.ErrorItem.TYPE_ERROR) {
    msg = this.errorElement.toMessage();
  } else {
    goog.asserts.fail('Unknown label');
  }
  return msg;
};
