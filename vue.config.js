module.exports = {
  transpileDependencies: [
    "vuetify"
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
            icon: './public/logo.png',
            target: [
                {
                    target: "nsis",
                    arch: ["x64", "ia32"]
                }
            ]
        },
        nsis: {
          oneClick: false,
          perMachine: true,
          allowToChangeInstallationDirectory: true
        },
        publish: [
          {
            provider: "github",
            private: true,
            owner: "ICS-Vortex",
            repo: "dcs-sender",
            releaseType: "draft",
            channel: "latest"
          }
        ]
      }
    }
  }
};