const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')

const { wrap, headers } = require('../utils')

wrap(async () => {
  const steps = core.getInput('steps').split('|')
  const [org, repo] = process.env.GITHUB_REPOSITORY.split('/')
  const base = `https://www.github.com/${org}/${repo}`
  const { compare, pusher } = github.context.payload
  console.log(github.context)
  console.log(process.env)
  const info = [
    { label: 'Repo', url: base, value: repo },
    { label: 'By', url: 'https://github.com/numso', value: pusher.name },
    { label: 'Branch', url: compare, value: 'master' },
    {
      label: 'Workflow',
      url: `${base}/commit/3c43dd64668b9fc6324c7d9ddfd51e1af26d8b73/checks`,
      value: 'workflow'
    },
    {
      label: 'Artifacts',
      url: `${base}/actions/runs/${process.env.GITHUB_RUN_ID}`,
      value: 'artifacts'
    }
    // { label: 'PR', url: '', value: '#123' },
  ]
  const body = {
    channel: process.env.SLACK_CHANNEL,
    blocks: [
      {
        type: 'context',
        elements: info.map(({ label, url, value }) => ({
          type: 'mrkdwn',
          text: `*${label}*<${url}|${value}>`
        }))
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: steps
            .map(title => `:gh-actions-pending: ${title}`)
            .join(' --> ')
        }
      },
      { type: 'divider' }
    ]
  }
  const resp = await axios.post(
    'https://slack.com/api/chat.postMessage',
    body,
    { headers: headers() }
  )
  core.exportVariable('SLACK_TS', resp.data.ts)
})
