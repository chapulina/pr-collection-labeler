const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');

async function run() {
  try {
    if (github.context.payload.pull_request === undefined) {
      core.debug('Labeler action must be run for pull requests.');
      return;
    }

    const library = github.context.payload.repository.name;
    const target = github.context.payload.pull_request.base.ref;

    const token = core.getInput('github-token', { required: true });
    if (!token) {
      core.debug('Failed to get token');
      return;
    }
    const gh = new github.GitHub(token);

    const owner = 'ignition-tooling';
    const repo = 'gazebodistro';
    const eolLabel = '🏁 EOL';

    let labels = [];

    const collections = [
      {name: 'acropolis', label: eolLabel},
      {name: 'blueprint', label: eolLabel},
      {name: 'citadel', label: '🏰 citadel'},
      {name: 'dome', label: eolLabel},
      {name: 'edifice', label: '🏢 edifice'},
      {name: 'fortress', label: '🏯 fortress'},
      {name: 'garden', label: '🌱 garden'}
    ];

    for (const collection of collections) {

      const path = 'collection-' + collection.name + '.yaml';

      const collectionRes = await gh.repos.getContents({owner, repo, path});
      const collectionContent = Buffer.from(collectionRes.data.content, 'base64').toString();
      const collectionYaml = yaml.safeLoad(collectionContent);

      let lib = collectionYaml.repositories[library];

      if (lib == undefined)
      {
        continue;
      }

      if (lib.version == target) {
        labels.push(collection.label);
        core.debug(`Push label [${collection.label}] for [${target}]. Labels: [${labels}]`);
      }
    }

    const classicVersions = [
      {name: 'gazebo9', label: 'Gazebo 9️'},
      {name: 'gazebo11', label: 'Gazebo 1️1️'},
    ];

    for (const version of classicVersions) {

      const path = version.name + '.yaml';

      const versionRes = await gh.repos.getContents({owner, repo, path});
      const versionContent = Buffer.from(versionRes.data.content, 'base64').toString();
      const versionYaml = yaml.safeLoad(versionContent);

      let lib = versionYaml.repositories[library];

      if (lib == undefined)
      {
        continue;
      }

      if (lib.version == target) {
        labels.push(version.label);
      }
    }

    if (labels.length > 1) {
      for(let i = 0; i < labels.length; i++){
        core.debug(`LABEL : [${labels[i]}]. [${labels}]`);
        if (labels[i] === eolLabel) {
          core.debug(`Remove label [${labels[i]}]. [${labels}]`);
          labels.splice(i, 1);
        }
      }
    }

    if (labels.length > 0) {
      const prNumber = github.context.payload.pull_request.number;
      core.debug(`Adding labels: [${labels}] to PR [${prNumber}]`);
      gh.issues.addLabels(
        Object.assign({issue_number: prNumber, labels: labels },
        github.context.repo));
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
