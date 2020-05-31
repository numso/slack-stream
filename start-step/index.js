const core = require('@actions/core')
const axios = require('axios')

try {
  const {
    SLACK_TOKEN: token,
    SLACK_CHANNEL: channel,
    SLACK_TS: ts,
    SLACK_STEP_INDEX
  } = process.env
  const index = parseInt(SLACK_STEP_INDEX || '0')
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
        .map((value, i) => {
          if (i !== index) return value
          return value.replace('pending:', 'running:')
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
      core.exportVariable('SLACK_STEP_INDEX', index)
      core.exportVariable('SLACK_TIME', +new Date())
    })
    .catch(error => {
      core.setFailed(error.message)
    })
} catch (error) {
  core.setFailed(error.message)
}
