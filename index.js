/*******************************************************************************
* Probot to validate bug ids in Pull Request
*
* @AdmiralAwkbar
*******************************************************************************/

/*************
* GLOBAL VARS
*************/
const STATUS_CONTEXT = 'Probot-BugTracker'

/******
* MAIN
*******
/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  app.on('pull_request', async context => {
    const action = context.payload.action
    // Validate the pull request is opened or edited
    if (action === 'opened' || action === 'edited') {
      // Load the body and sha vars
      const body = context.payload.pull_request.body
      const sha = context.payload.pull_request.head.sha
      // Regex to look for bugid
      const reg = /^bugid:\s?\d+$/mi

      // Run the regex agaisnt the PR body
      const hasBugId = reg.test(body)
      // See if we have a BugID in the PR
      if (hasBugId) {
        /// /////////////////////////////////
        // BugID was found in the PR body //
        /// /////////////////////////////////
        const params = context.issue({ body: '**Success**! \n`BugID:` found in *Pull Request* body' })
        // Comment on the PR that BugID was found
        await context.github.issues.createComment(params)

        // Create Status endpoint of success
        const statusParams = context.repo({
          sha: sha,
          state: 'success',
          context: STATUS_CONTEXT,
          description: 'BugID Found in PR'
        })

        // Send the status message to GitHub
        return context.github.repos.createStatus(statusParams)
      } else {
        /// ////////////////////////////////////
        // No BugID was found in the PR body //
        /// ////////////////////////////////////
        // Create message of failure
        const params = context.issue({ body: '**ERROR!** No `BugID: XXXX` detected\n Please edit the *Pull Request* body to have reference to a `BugId: XXXX` to meet complience\n *note:* `XXXX` can be any valid digit...' })
        // Comment on the PR that BugID was NOT found
        await context.github.issues.createComment(params)

        // Create Status endpoint of failure
        const statusParams = context.repo({
          sha: sha,
          state: 'failure',
          context: STATUS_CONTEXT,
          description: 'ERROR! No BugID detected'
        })

        // Send the status message to GitHub
        return context.github.repos.createStatus(statusParams)
      }
    }
  })
}
