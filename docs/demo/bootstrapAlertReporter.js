(function(window, undefined) {
  'use strict';


  // This SHOULD NOT BE USED IN PRODUCTION!!!
  // This is a stupid way of building the log list.
  class BootstrapAlertReporter /* implements ILogsReporter */{
    constructor(el) {
      this._el = el;
    }
    register(message/* : LogMessage */) {
      this._el.innerHTML += this.getAlertString(message);
    }

    getAlertString(message) {
      var alertClass = message.level >= 4
        ? 'danger'
        : message.level === 3
          ? 'warning'
          : 'info';

      return `
      <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
        <strong>${message.message}</strong>
        <pre class="d-block"><code>${JSON.stringify(message, undefined, 2)}</code></pre>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      `;

      return
    }
  }


  window.BootstrapAlertReporter = BootstrapAlertReporter;
})(window, void 0)
