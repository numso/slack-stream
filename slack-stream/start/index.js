const core = require('@actions/core')
const axios = require('axios')

const { wrap, update, mapMessage } = require('../utils')

wrap(async () => {
  await update(mapMessage(text => text.replace('pending:', 'running:')))
  core.exportVariable('SLACK_TIME', +new Date())
})
