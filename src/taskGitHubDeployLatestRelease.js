export class TaskGitHubDeployLatestRelease {
  static async run(context, config) {
    let ctxExec;

    try {
      ctxExec = context.createExec();

      await ctxExec.open();

      let latestVersionInfo = JSON.parse(await ctxExec.exec(`curl https://api.github.com/repos/${config.repo}/releases/latest`));
      let tagName = latestVersionInfo.tag_name;

      if((await ctxExec.exec(`cat ${config.path}/.tag_name`)).trim() === tagName) {
        return 'ok';
      }

      await ctxExec.exec(`curl -L ${latestVersionInfo.assets[0].browser_download_url} > /tmp/${latestVersionInfo.assets[0].name}`);
      await ctxExec.exec(`rm -r ${config.path}`);
      await ctxExec.exec(`mkdir -p -m 0755 ${config.path}`);
      await ctxExec.exec(`unzip /tmp/${latestVersionInfo.assets[0].name} -d ${config.path}`);
      await ctxExec.exec(`rm /tmp/${latestVersionInfo.assets[0].name}`);
      await ctxExec.exec(`echo '${latestVersionInfo.tag_name}' > ${config.path}/.tag_name`);
    } finally {
      if (typeof ctxExec !== 'undefined') {
        await ctxExec.close();
      }
    }

    return 'executed';
  }
}
