const fs = require('fs'),
  path = require('path');
const root = path.resolve(__dirname, '../cloudfunctions');
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === 'common' || entry.name.startsWith('desktop-'))
    continue;
  const dir = path.join(root, entry.name);
  fs.copyFileSync(path.join(root, 'common/runtime.js'), path.join(dir, 'runtime.js'));
  fs.copyFileSync(path.join(root, 'common/image-process.js'), path.join(dir, 'image-process.js'));
  if (['photo-preview-upload', 'delivery-create', 'print-source-upload'].includes(entry.name))
    fs.copyFileSync(path.join(root, 'common/upload.js'), path.join(dir, 'upload.js'));
  fs.writeFileSync(path.join(dir, 'index.js'), "exports.main=require('./handler').main;\n");
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify(
      {
        name: entry.name,
        version: '0.1.0',
        main: 'index.js',
        dependencies: {
          'wx-server-sdk': '^3.0.1',
          '@cloudbase/node-sdk': '3.18.3',
          ...(['photo-preview-upload', 'delivery-create', 'print-source-upload'].includes(
            entry.name,
          )
            ? { sharp: '^0.35.4' }
            : {}),
        },
      },
      null,
      2,
    ),
  );
}
console.log('云函数部署目录已生成');

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === 'common' || entry.name.startsWith('desktop-'))
    continue;
  const source = path.join(root, entry.name),
    destination = path.join(root, 'desktop-' + entry.name);
  fs.mkdirSync(destination, { recursive: true });
  for (const file of fs.readdirSync(source)) {
    if (file.endsWith('.js') || file === 'package.json')
      fs.copyFileSync(path.join(source, file), path.join(destination, file));
  }
  const runtime = fs
    .readFileSync(path.join(destination, 'runtime.js'), 'utf8')
    .replace("const platform='wechat'", "const platform='desktop'");
  fs.writeFileSync(path.join(destination, 'runtime.js'), runtime);
  const pkg = JSON.parse(fs.readFileSync(path.join(destination, 'package.json')));
  pkg.name = 'desktop-' + entry.name;
  fs.writeFileSync(path.join(destination, 'package.json'), JSON.stringify(pkg, null, 2));
}
