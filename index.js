var ever = require('ever')
  , vkey = require('vkey')
  , max = Math.max

module.exports = function(el, bindings) {
  if(bindings === undefined) {
    bindings = el
    el = this.document.body
  }

  var ee = ever(el)
    , state = {}
    , measured = {}
    , enabled = true

  // always initialize the state.
  for(var key in bindings) {
    if(bindings[key] === 'enabled' || bindings[key] === 'enable' || bindings[key] === 'disable') {
      throw new Error(bindings[key]+' is reserved')
    }
    state[bindings[key]] = 0
    measured[key] = 1
  }

  ee.on('keyup', wrapped(onoff(kb, false)))
  ee.on('keydown', wrapped(onoff(kb, true)))
  ee.on('mouseup', wrapped(onoff(mouse, false)))
  ee.on('mousedown', wrapped(onoff(mouse, true)))

  state.enabled = function() {
    return enabled
  }

  state.enable = enable_disable(true)
  state.disable = enable_disable(false)

  return state

  function enable_disable(on_or_off) {
    return function() {
      enabled = on_or_off
      return this
    }
  }

  function wrapped(fn) {
    return function(ev) {
      if(enabled) {
        ev.preventDefault()
        fn(ev)
      } else {
        return
      }
    }
  }

  function onoff(find, on_or_off) {
    return function(ev) {
      var key = find(ev)
        , binding = bindings[key]

      if(binding) {
        state[binding] += on_or_off ? max(measured[key]--, 0) : -(measured[key] = 1)
      }
    }
  }

  function mouse(ev) {
    return '<mouse '+ev.which+'>'
  }

  function kb(ev) {
    return vkey[ev.keyCode] || ev.char
  }
}
