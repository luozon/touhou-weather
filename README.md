# 幻想乡天象台（Touhou Weather）

一个融合东方 Project 角色插画的响应式天气预报网页。支持当前位置、全国城市搜索、实时天气和未来 7 日预报，可直接部署到 GitHub Pages。

## 功能

- 根据浏览器定位查询当前位置天气
- 搜索全国城市与地区，支持搜索结果选择
- 按省份、城市、区县三级选择行政区，并使用区县中心坐标预测
- 北京、上海、广州、成都、武汉、西安快捷查询
- 实时温度、体感温度、湿度、风向风速、降水、云量、日出日落
- 未来 7 日天气、最高/最低温和降水概率
- 根据天气类型与日期稳定切换东方角色插画
- 自动保存上次查询地点，网络异常时展示缓存数据
- 桌面、平板与手机响应式布局
- 键盘焦点、状态播报和减少动画等可访问性支持

## 数据来源

天气与地理搜索数据来自 [Open-Meteo](https://open-meteo.com/)。中国行政区划中心数据源自 [阿里云 DataV](https://datav.aliyun.com/)，经过精简后随项目静态发布，使用区县选择时不再请求第三方区划接口。该项目不需要 API Key，因此适合部署在 GitHub Pages 等纯静态托管服务上。

“使用当前位置”会按设备提供的经纬度查询；“按区县选择”会使用所选区县的中心坐标。天气结果来自数值模型网格，并不代表区县内每个地点的实况完全相同。

## 本地运行

直接打开 `index.html` 可以浏览页面，但定位功能在部分浏览器中需要安全环境。推荐启动本地静态服务器：

```bash
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 部署到 GitHub Pages

1. 将项目提交并推送到 GitHub 仓库的 `main` 分支。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**。
4. 分支选择 `main`，目录选择 `/ (root)`，保存即可。

页面通常会发布到：

```text
https://<GitHub 用户名>.github.io/<仓库名>/
```

## 日常更新 GitHub

修改完成后，在真正包含 `.git` 文件夹的仓库目录中执行：

```bash
git status
git add .
git commit -m "feat: add nationwide city search and 7-day forecast"
git push origin main
```

推荐使用清晰的提交前缀：

- `feat:` 新功能
- `fix:` 修复问题
- `style:` 仅调整界面样式
- `docs:` 修改文档
- `refactor:` 重构代码但不改变功能
- `chore:` 项目维护与配置

## 项目结构

```text
touhou-weather/
├─ data/         # 随站点发布的精简行政区坐标数据
├─ images/       # 东方角色插画
├─ index.html    # 页面结构
├─ style.css     # 视觉与响应式样式
├─ script.js     # 天气、搜索、定位与缓存逻辑
├─ README.md     # 项目说明
├─ CHANGELOG.md  # 版本变更记录
└─ NOTICE.md     # 图片素材与授权提醒
```

## 素材与许可

源代码采用 [MIT License](LICENSE)。`images/` 中的角色插画不自动包含在 MIT 授权范围内。

公开推广项目前，请在 [NOTICE.md](NOTICE.md) 中补齐每张图片的作者、原始链接与使用授权。东方 Project 及相关角色版权归上海爱丽丝幻乐团所有，本项目为非官方同人作品。

## 隐私说明

定位仅在用户浏览器中用于向天气服务请求经纬度对应的预报。本项目没有自建服务器，也不会主动保存或上传用户身份信息。
