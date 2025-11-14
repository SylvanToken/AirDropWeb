module.exports = {
  apps: [
    {
      name: 'sylvan-app-production',
      script: 'npm',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      watch: false
    },
    {
      name: 'sylvan-app-test',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3334
      },
      error_file: './logs/pm2-test-error.log',
      out_file: './logs/pm2-test-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      watch: false
    }
  ]
};
