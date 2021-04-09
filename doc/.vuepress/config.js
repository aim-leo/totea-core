module.exports = {
  title: "totea",
  base: "/totea-core/",
  themeConfig: {
    sidebar: 'auto',
    nav: [
      {
        text: 'Languages',
        ariaLabel: 'Language Menu',
        items: [
          { text: '简体中文', link: '/README.zh-CN.md' },
          { text: 'English', link: '/' }
        ]
      },
      { text: 'Examples', link: 'https://github.com/aim-leo/totea-core/tree/master/example' },
      { text: 'Github', link: 'https://github.com/aim-leo/totea-core' },
    ]
  }
}