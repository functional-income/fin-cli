'use strict'

const auth = require('../auth')
const handleError = require('../handle-error')

module.exports = (program, client) => {
  program
    .command('signup')
    .description('Creates a new account')
    .option('-e, --email <email>', 'account email')
    .option('-u, --username <username>', 'account username')
    .option('-p, --password <password>', 'account password')
    .action(async (opts) => {
      try {
        const { user, token } = await module.exports.signup(opts, client)
        auth.signin({ user, token })

        console.log(JSON.stringify(user, null, 2))
      } catch (err) {
        handleError(err)
      }
    })
}

module.exports.signup = async (opts, client) => {
  const { email, username, password } = opts

  // TODO: validate email / username and password
  return client.signup({ email, username, password })
}