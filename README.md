# Check AWS CodeCommit repo #

Simple action to get to check if AWS Codecommit repo exists and can be accessed. Option to create the repo if it does not exist. Outputs the CodeCommit repo url. 

### Usage ###
```yml
- uses: ecperth/check-aws-codecommit-repo@v1.0
    with:
      # codecommit repository name
      repo-name:
      # should the repo be created if it does not exist (optional). Default is false
      create-if-missing:
```

### Output ###
**repo-url**

### Example ###

On merge to main check if the CodeCommit repo exists and sync github branch to it

```yml
on: 
  push:
    branches: '*'

jobs:
  sync-branch-to-codecommit:
    runs-on: ubuntu-latest
    name: sync branch to codecommit
    permissions:
      id-token: write
      contents: read

  steps:
  - name: Configure AWS Credentials
    uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: {IAM_ROLE}
      aws-region: ap-southeast-2

  - name: Get or create aws CodeCommit repo
    id: check-codecommit
    uses: ecperth/check-codecommit-repo@v1.0
    with:
      repo-name: ${{github.event.repository.name}}
      create-if-missing: true

  - uses: actions/checkout@v4
    with:
      fetch-depth: 0

  - name: Push branch to CodeCommit
    run: |
        git config --global credential.helper "!aws codecommit credential-helper $@"
        git config --global credential.UseHttpPath true
        git remote add codecommit ${{steps.check-codecommit.outputs.repo-url}}
        git push codecommit ${branch}
```