const axios = require('axios')

module.exports = ({ TOKEN, CHANNEL }) => {
  const { GITHUB_REPOSITORY } = process.env
  const [, REPO] = GITHUB_REPOSITORY.split('/')
  const URL = `https://www.github.com/${GITHUB_REPOSITORY}`

  // TODO::
  const actions = ['Test', 'Build', 'Deploy']
  const pr = '102'

  return axios
    .post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: CHANNEL,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Deploying <${URL}|${REPO}>. Triggered by <${URL}/pull/${pr}|PR #${pr}>`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: actions
                .map(title => `:gh-actions-pending: ${title}`)
                .join(' --> ')
            }
          },
          { type: 'divider' }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${TOKEN}`
        }
      }
    )
    .then(resp => resp.data.ts)
}
