const core = require('@actions/core')
const axios = require('axios')

try {
  const token = core.getInput('token')
  const channel = core.getInput('channel')
  const ts = core.getInput('ts')
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
        .replace(/:gh-actions-running:/g, ':gh-actions-denied:')
        .replace(/:gh-actions-pending:/g, ':gh-actions-cancelled:')
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
} catch (error) {
  core.setFailed(error.message)
}
