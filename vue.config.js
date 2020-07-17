module.exports = {
  transpileDependencies: [
    "vuetify"
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: './src/assets/logo.png',
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