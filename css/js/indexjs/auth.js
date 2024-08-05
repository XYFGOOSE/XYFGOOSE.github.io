document.addEventListener('DOMContentLoaded', function () {
    const clientId = 'YOUR_GITHUB_CLIENT_ID';
    const redirectUri = 'https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/callback.html';
    let accessToken = '';
  
    document.getElementById('github-login').addEventListener('click', () => {
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
      window.location.href = authUrl;
    });
  
    function getAccessToken(code) {
      return axios.post('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        client_secret: 'YOUR_GITHUB_CLIENT_SECRET',
        code: code,
        redirect_uri: redirectUri
      }, {
        headers: { 'Accept': 'application/json' }
      }).then(response => response.data.access_token);
    }
  
    function createIssue(title, body) {
      return axios.post(`https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/issues`, {
        title: title,
        body: body
      }, {
        headers: { 'Authorization': `token ${accessToken}` }
      });
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      getAccessToken(code).then(token => {
        accessToken = token;
        document.getElementById('record-form').style.display = 'block';
      });
    }
  
    document.getElementById('submit-record').addEventListener('click', () => {
      const record = document.getElementById('record-input').value;
      createIssue('New Record', record).then(() => {
        console.log('Record saved');
      }).catch(error => {
        console.error(error);
      });
    });
  });
  