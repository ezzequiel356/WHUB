// Pipeline de CI: instala, testea y buildea backend/frontend en cada push.
pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Install & Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test'
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'Build y tests OK.'
        }
        failure {
            echo 'El pipeline falló. Revisar el log de la etapa correspondiente.'
        }
    }
}
