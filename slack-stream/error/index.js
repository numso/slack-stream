const core = require('@actions/core')
const axios = require('axios')

try {
  const {
    SLACK_TOKEN: token,
    SLACK_CHANNEL: channel,
    SLACK_TS: ts,
    SLACK_STEP_INDEX,
    SLACK_TIME: time
  } = process.env
  const index = parseInt(SLACK_STEP_INDEX || '0')
  const endTime = +new Date()
  const totalSeconds = Math.round((endTime - time) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = `${totalSeconds - minutes * 60}`.padStart(2, '0')
  const duration = minutes > 59 ? ' (> 1 hour)' : ` (${minutes}:${seconds})`
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
        .replace(/pending:/g, 'cancelled:')
        .split(' --&gt; ')
        .map((value, i) => {
          if (index !== i) return value
          if (value.indexOf('running:') === -1) return value
          return value.replace('running:', 'denied:') + duration
        })
        .join(' --> ')

        .replace(/running:/g, 'denied:')
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
    .catch(error => {
      core.setFailed(error.message)
    })
} catch (error) {
  core.setFailed(error.message)
}
