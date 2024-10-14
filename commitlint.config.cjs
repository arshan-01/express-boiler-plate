module.exports = {
    extends: ['@commitlint/cli', '@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',  // feat: Implement user profile page
                'fix',  // fix: Correct typo in user profile page
                'docs', // docs: Add jsdoc to user profile page
                'style', // style: Add css to user profile page
                'refactor', // refactor: Extract user profile page to component
                'perf', // perf: Improve user profile page load time
                'test', // test: Add unit test for user profile page
                'build', // build: Update webpack config
                'ci',   // ci: Add github actions
                'chore',    // chore: Update dependencies
                'revert'    // revert: Revert changes
            ]
        ],
        'subject-case': [2, 'always', 'sentence-case']
    }
}
// for flexible commit messages
// module.exports = {
//     extends: ['@commitlint/cli', '@commitlint/config-conventional'],
//     rules: {
//         // Disable the type-enum rule
//         'type-enum': [0], // 0 disables the rule

//         // Disable the type-empty rule to allow commits without a type
//         'type-empty': [0], // 0 disables the rule

//         // Disable the subject-case rule
//         'subject-case': [0], // 0 disables the rule

//         // Optionally, disable subject-empty to allow empty subjects
//         'subject-empty': [0], // 0 disables the rule

//         // Disable other rules if needed
//     }
// }
