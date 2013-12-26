var ever = require('ever')
  , vkey = require('vkey')
  , max = Math.max

module.exports = function(el, bindings, state) {
  var root = null
  if(bindings === undefined || !el.ownerDocument) {
    state = bindings
    bindings = el
    el = this.document.body
    try {
      root = window.top.document.body
    } catch(e){}
  }

  var ee = ever(el)
    , re = root ? ever(root) : ee
    , measured = {}
    , enabled = true

  state = state || {}

  state.bindings = bindings

  // always initialize the state.
  for(var key in bindings) {
    if(bindings[key] === 'enabled' ||
       bindings[key] === 'enable' ||
       bindings[key] === 'disable' ||
       bindings[key] === 'destroy' ||
       bindings[key] === 'bindings') {
      throw new Error(bindings[key]+' is reserved')
    }
    state[bindings[key]] = 0
    measured[key] = 1
  }

  re.on('keyup', wrapped(onoff(kb, false)))
  re.on('keydown', wrapped(onoff(kb, true)))
  ee.on('mouseup', wrapped(onoff(mouse, false)))
  ee.on('mousedown', wrapped(onoff(mouse, true)))

  state.enabled = function() {
    return enabled
  }

  state.enable = enable_disable(true)
  state.disable = enable_disable(false)
  state.destroy = function() {
    re.removeAllListeners()
    ee.removeAllListeners()
  }
  return state

  function clear() {
    // always initialize the state.
    for(var key in bindings) {
      state[bindings[key]] = 0
      measured[key] = 1
    }
  }

  function enable_disable(on_or_off) {
    return function() {
      clear()
      enabled = on_or_off
      return this
    }
  }

  function wrapped(fn) {
    return function(ev) {
      if(enabled) {
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

        if(!on_or_off && state[binding] < 0) {
          state[binding] = 0
        }
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
