pipeline {
    agent any

    tools {
        nodejs 'Node-20'
    }

    environment {
        CI = 'true'
        NODE_ENV = 'test'
        STACKSENTINEL_API_URL = credentials('STACKSENTINEL_API_URL') ?: 'https://stack-sentinel-blush.vercel.app/api'
        STACKSENTINEL_WEBHOOK_SECRET = credentials('STACKSENTINEL_WEBHOOK_SECRET') ?: 'stacksentinel_jenkins_secret_2026'
    }

    stages {
        stage('1. Checkout SCM') {
            steps {
                echo '=================================================='
                echo ' 1. Checking out source code from GitHub Repository'
                echo '=================================================='
                checkout scm
            }
        }

        stage('2. Install Dependencies') {
            parallel {
                stage('Server Dependencies') {
                    steps {
                        dir('server') {
                            echo 'Installing Backend Server dependencies...'
                            script {
                                if (isUnix()) {
                                    sh 'npm ci || npm install'
                                } else {
                                    bat 'npm ci || npm install'
                                }
                            }
                        }
                    }
                }
                stage('Client Dependencies') {
                    steps {
                        dir('client') {
                            echo 'Installing Frontend Client dependencies...'
                            script {
                                if (isUnix()) {
                                    sh 'npm ci || npm install'
                                } else {
                                    bat 'npm ci || npm install'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('3. Run Backend Integration Tests') {
            steps {
                dir('server') {
                    echo 'Running Jest + Supertest automated test suites...'
                    script {
                        if (isUnix()) {
                            sh 'npm test'
                        } else {
                            bat 'npm test'
                        }
                    }
                }
            }
        }

        stage('4. Build Frontend Production Artifacts') {
            steps {
                dir('client') {
                    echo 'Building Vite production bundle...'
                    script {
                        if (isUnix()) {
                            sh 'npm run build'
                        } else {
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('5. Record Deployment to StackSentinel') {
            steps {
                echo 'Recording CI/CD build deployment telemetry to StackSentinel...'
                script {
                    def apiUrl = env.STACKSENTINEL_API_URL ?: 'https://stack-sentinel-blush.vercel.app/api'
                    def webhookToken = env.STACKSENTINEL_WEBHOOK_SECRET ?: 'stacksentinel_jenkins_secret_2026'
                    def buildNum = env.BUILD_NUMBER ?: '1'
                    def gitCommit = env.GIT_COMMIT ?: 'local-build'
                    def gitBranch = env.BRANCH_NAME ?: 'main'

                    echo "Dispatching deployment telemetry to: ${apiUrl}/deployments/jenkins"

                    if (isUnix()) {
                        sh """
                            curl -s -X POST "${apiUrl}/deployments/jenkins" \
                              -H "Content-Type: application/json" \
                              -H "x-jenkins-token: ${webhookToken}" \
                              -d '{"buildNumber":"${buildNum}","version":"v1.${buildNum}.0","branch":"${gitBranch}","commitHash":"${gitCommit}","status":"SUCCESS","environment":"Production","message":"Automated build #${buildNum} via Jenkins Pipeline completed successfully."}' || true
                        """
                    } else {
                        bat """
                            curl -s -X POST "${apiUrl}/deployments/jenkins" ^
                              -H "Content-Type: application/json" ^
                              -H "x-jenkins-token: ${webhookToken}" ^
                              -d "{\\"buildNumber\\":\\"${buildNum}\\",\\"version\\":\\"v1.${buildNum}.0\\",\\"branch\\":\\"${gitBranch}\\",\\"commitHash\\":\\"${gitCommit}\\",\\"status\\":\\"SUCCESS\\",\\"environment\\":\\"Production\\",\\"message\\":\\"Automated build #${buildNum} via Jenkins Pipeline completed successfully.\\"}" || exit 0
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Archiving build artifacts and cleaning workspace...'
        }
        success {
            echo '=================================================='
            echo ' StackSentinel CI/CD Pipeline SUCCEEDED'
            echo ' All test suites passed and production bundle is verified'
            echo '=================================================='
        }
        failure {
            echo '=================================================='
            echo ' StackSentinel CI/CD Pipeline FAILED'
            echo ' Notifying StackSentinel telemetry console...'
            echo '=================================================='
            script {
                def apiUrl = env.STACKSENTINEL_API_URL ?: 'https://stack-sentinel-blush.vercel.app/api'
                def webhookToken = env.STACKSENTINEL_WEBHOOK_SECRET ?: 'stacksentinel_jenkins_secret_2026'
                def buildNum = env.BUILD_NUMBER ?: '1'
                def gitCommit = env.GIT_COMMIT ?: 'failed-build'
                def gitBranch = env.BRANCH_NAME ?: 'main'

                if (isUnix()) {
                    sh """
                        curl -s -X POST "${apiUrl}/deployments/jenkins" \
                          -H "Content-Type: application/json" \
                          -H "x-jenkins-token: ${webhookToken}" \
                          -d '{"buildNumber":"${buildNum}","version":"v1.${buildNum}.0","branch":"${gitBranch}","commitHash":"${gitCommit}","status":"FAILED","environment":"Production","message":"Build #${buildNum} failed during CI verification."}' || true
                    """
                } else {
                    bat """
                        curl -s -X POST "${apiUrl}/deployments/jenkins" ^
                          -H "Content-Type: application/json" ^
                          -H "x-jenkins-token: ${webhookToken}" ^
                          -d "{\\"buildNumber\\":\\"${buildNum}\\",\\"version\\":\\"v1.${buildNum}.0\\",\\"branch\\":\\"${gitBranch}\\",\\"commitHash\\":\\"${gitCommit}\\",\\"status\\":\\"FAILED\\",\\"environment\\":\\"Production\\",\\"message\\":\\"Build #${buildNum} failed during CI verification.\\"}" || exit 0
                    """
                }
            }
        }
    }
}
