import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function main() {
  try {
    console.log('Conectando ao GitHub...');
    const octokit = await getUncachableGitHubClient();
    
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`Autenticado como: ${user.login}`);
    
    const repoName = 'thypestore';
    
    console.log(`Criando repositório: ${repoName}...`);
    
    try {
      const { data: repo } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'ThypeStore - E-commerce de moda feminina elegante',
        private: false,
        auto_init: false
      });
      
      console.log(`Repositório criado: ${repo.html_url}`);
      console.log(`\nPara subir o código, execute:`);
      console.log(`git remote add origin ${repo.clone_url}`);
      console.log(`git push -u origin main`);
      
    } catch (error: any) {
      if (error.status === 422) {
        console.log('Repositório já existe. Buscando informações...');
        const { data: repo } = await octokit.repos.get({
          owner: user.login,
          repo: repoName
        });
        console.log(`Repositório encontrado: ${repo.html_url}`);
        console.log(`\nPara subir o código, execute:`);
        console.log(`git remote add origin ${repo.clone_url}`);
        console.log(`git push -u origin main`);
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

main();
