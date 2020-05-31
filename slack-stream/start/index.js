const core = require('@actions/core')
const axios = require('axios')

const utils = require('../utils')

utils.wrap(async () => {
  return utils
    .update(utils.mapMessage(text => text.replace('pending:', 'running:')))
    .then(() => core.exportVariable('SLACK_TIME', +new Date()))
})
