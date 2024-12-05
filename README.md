
<p align="center">
  <a href="https://github.com/gazebo-tooling/pr-collection-labeler/actions"><img alt="javscript-action status" src="https://github.com/gazebo-tooling/pr-collection-labeler/workflows/units-test/badge.svg"></a>
</p>

# PR collection labeler

Adds labels to pull requests according to the target Gazebo distribution.

It uses [gazebodistro](https://github.com/gazebo-tooling/gazebodistro) to
find the mapping between branches and collections.

## Usage

Add the following file to an Gazebo repository:
`.github/workflows/pr-collection-labeler.yml`

```
name: PR Collection Labeler

on: pull_request

jobs:
  pr_collection_labeler:
    runs-on: ubuntu-latest
    steps:
    - name: Add collection labels
      if: github.event.action == 'opened'
      uses: gazebo-tooling/pr-collection-labeler@v1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
```

That's it, no other configurations needed.

## Development

Install dependencies:

    npm install

Run tests:

    npm test

Package files into the `dist` folder:

    npm run package
