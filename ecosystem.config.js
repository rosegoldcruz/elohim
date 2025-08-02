module.exports = {
  apps: [
    {
      name: 'aeon-video-api',
      script: 'backend/main.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        HOST: '0.0.0.0',
        ENVIRONMENT: 'production'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8000,
        HOST: '0.0.0.0',
        ENVIRONMENT: 'production'
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Environment variables will be loaded from .env file
      env_file: './backend/.env'
    }
  ],
  
  deploy: {
    production: {
      user: 'root',
      host: '159.223.198.119',
      ref: 'origin/main',
      repo: 'https://github.com/rosegoldcruz/elohim.git',
      path: '/opt/aeon-video',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 