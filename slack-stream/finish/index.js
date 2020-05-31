const core = require('@actions/core')
const axios = require('axios')

const utils = require('../utils')

utils.wrap(async () => {
  const duration = utils.getDuration()
  core.exportVariable('SLACK_STEP_INDEX', utils.getIndex() + 1)
  return utils.update(
    utils.mapMessage(text => text.replace('running:', 'approved:') + duration)
  )
})
