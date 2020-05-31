const core = require('@actions/core')
const axios = require('axios')

const utils = require('../utils')

utils.wrap(async () => {
  const duration = utils.getDuration()
  return utils.update(fullText =>
    utils
      .mapMessage(text => {
        if (text.indexOf('running:') === -1) return text
        return text.replace('running:', 'denied:') + duration
      })(fullText)
      .replace(/pending:/g, 'cancelled:')
      .replace(/running:/g, 'denied:')
  )
})
