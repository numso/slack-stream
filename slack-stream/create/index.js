const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')

const { wrap, headers } = require('../utils')

// pr test again
wrap(async () => {
  const { actor, workflow, ref, sha, payload } = github.context
  const { html_url: base, name: repo } = payload.repository
  const { html_url: prUrl, number: prNum } = payload.pull_request || {}
  const r = process.env.GITHUB_RUN_ID
  const steps = core.getInput('steps').split('|')
  const info = [
    { label: 'Repo', url: base, value: repo },
    { label: 'By', url: `https://github.com/${actor}`, value: actor },
    prUrl
      ? { label: 'PR', url: prUrl, value: `#${prNum}` }
      : { label: 'Branch', url: payload.compare, value: ref.split('/').pop() },
    { label: 'Workflow', url: `${base}/commit/${sha}/checks`, value: workflow },
    { label: 'Artifacts', url: `${base}/actions/runs/${r}`, value: 'artifacts' }
  ]
  const body = {
    channel: process.env.SLACK_CHANNEL,
    blocks: [
      {
        type: 'context',
        elements: info.map(({ label, url, value }) => ({
          type: 'mrkdwn',
          text: `*${label}*  \n<${url}|${value}>`
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
