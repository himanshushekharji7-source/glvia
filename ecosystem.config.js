#!/bin/bash
# ecosystem.config.js - PM2 configuration for Hostinger Node.js

module.exports = {
  apps: [
    {
      name: 'glvia',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
