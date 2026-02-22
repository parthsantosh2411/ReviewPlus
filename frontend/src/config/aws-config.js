const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    },
  },
};

console.log('[Amplify Config]', {
  userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
});

export default awsConfig;
