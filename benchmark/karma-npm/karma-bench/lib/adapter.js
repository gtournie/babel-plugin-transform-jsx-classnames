;(function (window) {
  window.__karma__.start = function () {
    window.__karmaLog__ = function (msg) {
      window.__karma__.info({ log: msg })
    }
    window.__karmaComplete__ = function (obj) {
      window.__karma__.info({ log: obj, type: 'data' })

      setTimeout(function () {
        window.__karma__.complete()
      }, 1000)
    }
  }
})(typeof window !== 'undefined' ? window : global)
