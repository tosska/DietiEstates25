const scanner = require('sonarqube-scanner').default;

scanner(
  {
    serverUrl: 'http://localhost:9000',
    options: {
      'sonar.projectKey': 'mio-progetto-immobiliare',
      'sonar.projectName': 'Real Estate Project',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': '.',
      
      'sonar.exclusions': 'node_modules/**, dist/**, coverage/**, **/*.spec.ts, **/Dockerfile, **/.dockerignore, **/docker-compose.yml, **/docker-compose.yaml',
      
      'sonar.sourceEncoding': 'UTF-8',
      'sonar.login': 'sqa_a2e4ee336bfe1e207d9b3be44ca14aa3e50eade8',
    },
  },
  () => {
    console.log('Analisi SonarQube completata!');
    process.exit();
  }
);