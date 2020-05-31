const core = require('@actions/core')
const axios = require('axios')

try {
  const {
    SLACK_TOKEN: token,
    SLACK_CHANNEL: channel,
    SLACK_TS: ts
  } = process.env
  const name = core.getInput('name')
  axios
    .get('https://slack.com/api/conversations.history', {
      params: { channel, latest: ts, limit: 1, inclusive: true },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`
      }
    })
    .then(resp => {
      const blocks = resp.data.messages[0].blocks
      blocks[1].text.text = blocks[1].text.text
        .split(' --&gt; ')
        .map(value => {
          if (value !== `:gh-actions-pending: ${name}`) return value
          // LINK THE STEP
          return `:gh-actions-running: ${name}`
        })
        .join(' --> ')
      return blocks
    })
    .then(blocks =>
      axios.post(
        'https://slack.com/api/chat.update',
        { channel, ts, blocks },
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`
          }
        }
      )
    )
    .then(() => {
      core.exportVariable('SLACK_STEP', name)
      core.exportVariable('SLACK_TIME', +new Date())
    })
    .catch(error => {
      core.setFailed(error.message)
    })
} catch (error) {
  core.setFailed(error.message)
}
