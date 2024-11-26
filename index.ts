import { getInput, setOutput, setFailed, info } from '@actions/core';
import {
  CodeCommitClient,
  CodeCommitServiceException,
  GetRepositoryCommand,
  CreateRepositoryCommand,
  RepositoryDoesNotExistException,
} from '@aws-sdk/client-codecommit';

const repoName = getInput('repo-name', { trimWhitespace: true });
const createIfMissing =
  getInput('create-if-missing', { trimWhitespace: true }) === 'true';

checkAndCreateRepo(repoName)
  .then((repoUrl) => {
    setOutput('repo-url', repoUrl);
  })
  .catch((e) =>
    setFailed(
      e instanceof CodeCommitServiceException
        ? `${e.name}: ${e.message}`
        : JSON.stringify(e),
    ),
  );

async function checkAndCreateRepo(repoName: string) {
  const client = new CodeCommitClient();
  const command = new GetRepositoryCommand({ repositoryName: repoName });

  try {
    const result = await client.send(command);

    info(
      `CodeCommit repository exists: ${result.repositoryMetadata!.cloneUrlHttp}`,
    );

    return result.repositoryMetadata!.cloneUrlHttp;
  } catch (err) {
    if (err instanceof RepositoryDoesNotExistException && createIfMissing) {
      info('CodeCommit repository does not exist. Creating...');

      const createCommand = new CreateRepositoryCommand({
        repositoryName: repoName,
      });

      const result = await client.send(createCommand);

      info('CodeCommit repository created');

      return result.repositoryMetadata!.cloneUrlHttp;
    } else {
      throw err;
    }
  }
}
