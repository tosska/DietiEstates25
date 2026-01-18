const scanner = require('sonarqube-scanner').default;

scanner(
  {
    serverUrl: 'http://localhost:9000',
    options: {
      'sonar.projectKey': 'mio-progetto-immobiliare', // Un nome unico senza spazi
      'sonar.projectName': 'Real Estate Project',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': '.', // Analizza tutto nella cartella corrente
      'sonar.exclusions': 'node_modules/**, dist/**, coverage/**, **/*.spec.ts', // Ignora librerie e file compilati
      'sonar.sourceEncoding': 'UTF-8',
      'sonar.login': 'sqa_a2e4ee336bfe1e207d9b3be44ca14aa3e50eade8',
    },
  },
  () => {
    console.log('Analisi SonarQube completata!');
    process.exit();
  }
);