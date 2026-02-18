module.exports = {
    apps: [
        {
            name: "prompt-template",
            script: "server/src/index.js",
            instances: 1,
            exec_mode: "fork",
            watch: false,
            autorestart: true,
            max_memory_restart: "500M",

            env_staging: {
                NODE_ENV: "staging",
                PORT: 9000
            }
        }
    ]
};
