# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.9.10-rc.2, 2023/02/21

## Notable Changes
- fix
 - search bar style

### Commits
- [`bc9b2fafe8`](https://github.com/twreporter/keystone/commit/bc9b2fafe8)] - **fix**: remove comments (Aylie Chou)
- [[`6b9226f7bd`](https://github.com/twreporter/keystone/commit/6b9226f7bd)] - **fix**: search bar style (Aylie Chou)

## 0.9.10-rc.1, 2023/02/16

## Notable Changes
- fix
  - add clearable to category set select

### Commits
* \[[`0999aa029f`](https://github.com/twreporter/keystone/commit/0999aa029f)] - Jason/add select clearable (#235) (許守傑 Shou-Chieh Hsu (Jason))

## 0.9.10-rc.0, 2023/01/30

## Notable Changes
- feat
  - support latest page settings

### Commits
* \[[`60feb962b3`](https://github.com/twreporter/keystone/commit/60feb962b3)] - Jason/issue 406 (#231) (許守傑 Shou-Chieh Hsu (Jason))

## 0.9.9, 2022/10/24

## Notable Changes
- feat
  - support category set for new info architecture
- fix
  - add tag filter for old/new info architecture compatibility

### Commits
* \[[`4f07fec7d4`](https://github.com/twreporter/keystone/commit/4f07fec7d4)] - Jason/327 compatibility tag filter (#226) (許守傑 Shou-Chieh Hsu (Jason))
* \[[`db447d9c0e`](https://github.com/twreporter/keystone/commit/db447d9c0e)] - Jason/issue 327 (#220) (許守傑 Shou-Chieh Hsu (Jason))

## 0.9.8, 2022/5/20

## Notable Changes
- refactor
  - change assets public url prefix to utilize CDN cache

### Commits
* [[`849eb5a6c5`](https://github.com/twreporter/keystone/commit/849eb5a6c5)] - **refactor**: change replaceGCSUrlOrigin to a utility function (Tai-Jiun Fang)
* [[`e9fada5de2`](https://github.com/twreporter/keystone/commit/e9fada5de2)] - **refactor**: change public url prefix to utilize CDN cache (Tai-Jiun Fang)

## 0.9.7, 2022/5/16

## Notable Changes
- fix
  - fix page freeze when click on image-related component & missing async query/options in select component of slug dnd component([#217](https://github.com/twreporter/keystone/pull/217))

### Commits
* [f5e10bf075] - Merge pull request #217 from duidae/jason/issue_314_315 (許守傑 Shou-Chieh Hsu (Jason))
* [0ac331459f] - fix: add comment for null filtering (duidae)
* [2f6c91ba2f] - fix: add error handling (duidae)
* [eeb364053c] - fix: delete only 1 issue (duidae)
* [dd8b4e8cb8] - fix: fix missing date (duidae)
* [c1d49103e2] - fix: fix lint (duidae)
* [116fde7ada] - fix: fix missing query (#315) (duidae)
* [7b4cbcc67b] - fix: fix multiple backend issue(#315) (duidae)

## 0.9.6, 2022/4/26

## Notable Changes
- feat
  - add sortable dnd relateds feature([#209](https://github.com/twreporter/keystone/pull/209))

### Commits
* [c94ecb1a02] - Merge pull request #214 from duidae/jason/202_order_issue (許守傑 Shou-Chieh Hsu (Jason))
* [a4489f08a2] - fix: fix initial sorting order (duidae)
* [2457a8bb8e] - Jason/issue 202 (#209) (許守傑 Shou-Chieh Hsu (Jason))

## 0.9.5, 2021/10/12

## Notable Changes

- feat
  - enable signout url([#206](https://github.com/twreporter/keystone/pull/204))
  - add gcsavatar field and type([#202](https://github.com/twreporter/keystone/pull/202))
  - add avatar url to cookie for keystone-plugin([#202](https://github.com/twreporter/keystone/pull/202), [#204](https://github.com/twreporter/keystone/pull/204))
- refactor
  - update default exported column to download([#200](https://github.com/twreporter/keystone/pull/200))
- fix
  - persist the username cookie([#198](https://github.com/twreporter/keystone/pull/198))
  - date filter on choosing 'between'([#197](https://github.com/twreporter/keystone/pull/197))
- style
  - update .eslintrc for code styling([#194](https://github.com/twreporter/keystone/pull/194))
    - add spread operator suppoprt in .eslintrc
    - set comma-dangle to 'only-multiline' in .eslintrc
    - update precommit-hook to include `eslint --fix`([#194](https://github.com/twreporter/keystone/pull/194))

### Commits
* [[`b64ccb6660`](https://github.com/twreporter/keystone/commit/b64ccb6660)] - **feat**: enable signout url (Ching-Yang, Tseng)
* [[`20b7e46a3a`](https://github.com/twreporter/keystone/commit/20b7e46a3a)] - **refactor**: update cache-control for avatar (#204) (Tai-Jiun Fang)
* [[`f18419d822`](https://github.com/twreporter/keystone/commit/f18419d822)] - **refactor**: use user email as filename of avatar (Tai-Jiun Fang)
* [[`6945cd4256`](https://github.com/twreporter/keystone/commit/6945cd4256)] - **fix**: clear cookie when the avatar has been deleted (Tai-Jiun Fang)
* [[`a2a2f8991a`](https://github.com/twreporter/keystone/commit/a2a2f8991a)] - **refactor**: rewrite filename of user avatar (Tai-Jiun Fang)
* [[`adeb560766`](https://github.com/twreporter/keystone/commit/adeb560766)] - **refactor**: remove date prefix from avatar filename (Tai-Jiun Fang)
* [[`59ecfe7254`](https://github.com/twreporter/keystone/commit/59ecfe7254)] - **refactor**: remove set cookie from try ... catch statement (Tai-Jiun Fang)
* [[`59cfbeb781`](https://github.com/twreporter/keystone/commit/59cfbeb781)] - **refactor**: remove invalid doc link (Tai-Jiun Fang)
* [[`4075f945c1`](https://github.com/twreporter/keystone/commit/4075f945c1)] - **refactor**: removing supports to some file types for uploading avatar (Tai-Jiun Fang)
* [[`d19f5cbaf8`](https://github.com/twreporter/keystone/commit/d19f5cbaf8)] - **refactor**: move `storageDefault` constant into function scope (Tai-Jiun Fang)
* [[`a17e75f844`](https://github.com/twreporter/keystone/commit/a17e75f844)] - **refactor**: remove the unused prop in classname of Field (Tai-Jiun Fang)
* [[`8b908ea0c4`](https://github.com/twreporter/keystone/commit/8b908ea0c4)] - **feat**: store avatar to cookie for keystone-plugin (Tai-Jiun Fang)
* [[`bda51880a4`](https://github.com/twreporter/keystone/commit/bda51880a4)] - **feat**: add avatar url to cookie (Tai-Jiun Fang)
* [[`d9a637f41b`](https://github.com/twreporter/keystone/commit/d9a637f41b)] - **feat**: add gcsavatar field and type (Tai-Jiun Fang)
* [[`a510115cdf`](https://github.com/twreporter/keystone/commit/a510115cdf)] - **refactor**: update default exported column to download (#200) (Tai-Jiun Fang)
* [[`b5f8143af9`](https://github.com/twreporter/keystone/commit/b5f8143af9)] - **fix**: persist the username cookie (Ching-Yang, Tseng)
* [[`24c4391afb`](https://github.com/twreporter/keystone/commit/24c4391afb)] - **refactor**: add propType check for `DayPickerIndicator` (Tai-Jiun Fang)
* [[`9e9706a8af`](https://github.com/twreporter/keystone/commit/9e9706a8af)] - **refactor**: check `modifiers` before using in DateFilter (Tai-Jiun Fang)
* [[`f243e6c795`](https://github.com/twreporter/keystone/commit/f243e6c795)] - **fix**: date filter on choosing 'between' (Tai-Jiun Fang)
* [[`cf9e960a4e`](https://github.com/twreporter/keystone/commit/cf9e960a4e)] - **refactor**: update precommit-hook config to include `eslint --fix` (Tai-Jiun Fang)
* [[`7be8d97c09`](https://github.com/twreporter/keystone/commit/7be8d97c09)] - **refactor**: destruct prop as variables (Tai-Jiun Fang)
* [[`112eb7a5bc`](https://github.com/twreporter/keystone/commit/112eb7a5bc)] - **refactor**: remove unused code (Tai-Jiun Fang)
* [[`6e54993818`](https://github.com/twreporter/keystone/commit/6e54993818)] - **fix**: misspelled param `filename` (Tai-Jiun Fang)
* [[`4de499a23b`](https://github.com/twreporter/keystone/commit/4de499a23b)] - **style**: fix indentations in codebase (Tai-Jiun Fang)
* [[`b0399c56e9`](https://github.com/twreporter/keystone/commit/b0399c56e9)] - **style**: set comma-dangle to 'only-multiline' in .eslintrc (Tai-Jiun Fang)
* [[`ad8887b103`](https://github.com/twreporter/keystone/commit/ad8887b103)] - **style**: add spread operator suppoprt in .eslintrc (Tai-Jiun Fang)

## 0.9.4, 2021/7/13

## Notable Changes

- refactor
  - cleanup redundant operations and rename obscure function([#190](https://github.com/twreporter/keystone/pull/190))
  - API migration for draft-js@0.8.1 -> draft-js@0.11.8([#180](https://github.com/twreporter/keystone/pull/180),[#183](https://github.com/twreporter/keystone/pull/183))
  - use mongoose as session storage driver([#171](https://github.com/twreporter/keystone/pull/171))
  - change `cookie signin` option([#169](https://github.com/twreporter/keystone/pull/169))
- fix
	- expire cookie session([#179](https://github.com/twreporter/keystone/pull/179))
	- enable mocha test([#170](https://github.com/twreporter/keystone/pull/170))
- chore
	- replace npm package 'draft-js' by '@twreporter/draft-js'([#180](https://github.com/twreporter/keystone/pull/180))
	- update .eslintrc([#180](https://github.com/twreporter/keystone/pull/180))
- ci
	- add circleci to publish @twreporter/keystone([#172](https://github.com/twreporter/keystone/pull/172), [#173](https://github.com/twreporter/keystone/pull/173), [#175](https://github.com/twreporter/keystone/pull/175), [#177](https://github.com/twreporter/keystone/pull/177))

### Commits
* [[`c4d8b19ec3`](https://github.com/twreporter/keystone/commit/c4d8b19ec3)] - **refactor**: remove redundant initialization (Ching-Yang, Tseng)
* [[`c4a8ccbdf3`](https://github.com/twreporter/keystone/commit/c4a8ccbdf3)] - **refactor**: rename initDatabase to initDatabaseConfig (Ching-Yang, Tseng)
* [[`8524e19da6`](https://github.com/twreporter/keystone/commit/8524e19da6)] - **chore**: upgrade @twreporter/draft-js to v0.11.8-rc.2 (#188) (Tai-Jiun Fang)
* [[`af1a49aefc`](https://github.com/twreporter/keystone/commit/af1a49aefc)] - **chore**: update @twreporter/draft-js to v0.11.8-rc.1 (#186) (Tai-Jiun Fang)
* [[`3c8a51bde5`](https://github.com/twreporter/keystone/commit/3c8a51bde5)] - **refactor**: migrate API `Entity.create` (#183) (Tai-Jiun Fang)
* [[`f9144af627`](https://github.com/twreporter/keystone/commit/f9144af627)] - **refactor**: `let` -\> `const` (Taylor Fang)
* [[`062b27462c`](https://github.com/twreporter/keystone/commit/062b27462c)] - **style**: fix indent (Taylor Fang)
* [[`fe5939e395`](https://github.com/twreporter/keystone/commit/fe5939e395)] - **chore**: update 'space-before-function-paren' rule in .eslintrc (Taylor Fang)
* [[`88bbc41b1c`](https://github.com/twreporter/keystone/commit/88bbc41b1c)] - **chore**: update .eslintrc for indentation (Taylor Fang)
* [[`bebfe02565`](https://github.com/twreporter/keystone/commit/bebfe02565)] - **style**: format changed files (Taylor Fang)
* [[`6066a40e91`](https://github.com/twreporter/keystone/commit/6066a40e91)] - **refactor**: update import modules 'draft-js' -\> '@twreporter/draft-js' (Taylor Fang)
* [[`9c5fccb859`](https://github.com/twreporter/keystone/commit/9c5fccb859)] - **refactor**: migrate API convertFromHTML (Taylor Fang)
* [[`52d9a7f0a0`](https://github.com/twreporter/keystone/commit/52d9a7f0a0)] - **refactor**: migrate API `Entity.replaceData` (Taylor Fang)
* [[`0f3a794268`](https://github.com/twreporter/keystone/commit/0f3a794268)] - **refactor**: migrate API `Entity.mergeData` (Taylor Fang)
* [[`b961a2b76c`](https://github.com/twreporter/keystone/commit/b961a2b76c)] - **refactor**: migrate API `Entity.create` (Taylor Fang)
* [[`bde53ee01c`](https://github.com/twreporter/keystone/commit/bde53ee01c)] - **refactor**: migrate API `Entity.get` (Taylor Fang)
* [[`15e78758c6`](https://github.com/twreporter/keystone/commit/15e78758c6)] - **chore**: update npm pkg draft-js to @twreporter/draft-js (Taylor Fang)
* [[`5c471f27bc`](https://github.com/twreporter/keystone/commit/5c471f27bc)] - **fix**: expire cookie session (Ching-Yang, Tseng)
* [[`e4ae84bf8f`](https://github.com/twreporter/keystone/commit/e4ae84bf8f)] - **ci**: fix the identation of filters field (Ching-Yang, Tseng)
* [[`5de56eaeec`](https://github.com/twreporter/keystone/commit/5de56eaeec)] - **ci**: fix tag trigger build (Ching-Yang, Tseng)
* [[`d9d1f2098f`](https://github.com/twreporter/keystone/commit/d9d1f2098f)] - **ci**: fix .npmrc path and incorrect publish trigger (Ching-Yang, Tseng)
* [[`63ee015aa5`](https://github.com/twreporter/keystone/commit/63ee015aa5)] - **ci**: add circleci to build and publish the package (Ching-Yang, Tseng)
* [[`a981a8116b`](https://github.com/twreporter/keystone/commit/a981a8116b)] - **fix**: utilize mongoose as session driver (Ching-Yang, Tseng)
* [[`4b1739ad9b`](https://github.com/twreporter/keystone/commit/4b1739ad9b)] - **fix**: enable mocha test (Ching-Yang, Tseng)
* [[`18aa6ed4c0`](https://github.com/twreporter/keystone/commit/18aa6ed4c0)] - **refactor**: change the `cookie signin` option (Ching-Yang, Tseng)

## 0.9.3, 2020/12/09

### Notable Changes

- fix: set file to public if needed when the upload is complete

### Commits
* [[`6a5c6aa9f7`](https://github.com/twreporter/keystone/commit/6a5c6aa9f7)] - Merge pull request #166 from taylrj/publicRead (Tai-Jiun Fang)
* [[`3cf2985696`](https://github.com/twreporter/keystone/commit/3cf2985696)] - **fix**: set file to public if needed when the upload is complete (Taylor Fang)
* [[`7760ab3c22`](https://github.com/twreporter/keystone/commit/7760ab3c22)] - **fix**: update attribute typo (Taylor Fang)
* [[`f42597240c`](https://github.com/twreporter/keystone/commit/f42597240c)] - Merge pull request #165 from nickhsine/master (nick)

## 0.9.2, 2020/11/27

### Notable Changes

- docs: add keystone@0.3 documentation
- [refactor: yarn remove @twreporter/core](https://github.com/twreporter/keystone/pull/164)

### Commits
* [[`cf64aaca72`](https://github.com/twreporter/keystone/commit/cf64aaca72)] - Merge pull request #164 from nickhsine/remove-core (nick)
* [[`8f05f41535`](https://github.com/twreporter/keystone/commit/8f05f41535)] - **refactor**: yarn remove @twreporter/core (nickhsine)
* [[`fe4e7d0fbe`](https://github.com/twreporter/keystone/commit/fe4e7d0fbe)] - Merge pull request #163 from nickhsine/docs (nick)
* [[`540eb015a5`](https://github.com/twreporter/keystone/commit/540eb015a5)] - **docs**: remove unused files (nickhsine)
* [[`caa800f160`](https://github.com/twreporter/keystone/commit/caa800f160)] - **docs**: fix url path (nickhsine)
* [[`05a0b2639d`](https://github.com/twreporter/keystone/commit/05a0b2639d)] - Merge pull request #162 from nickhsine/docs (nick)
* [[`3eccf0e1db`](https://github.com/twreporter/keystone/commit/3eccf0e1db)] - **docs**: add \<base\> to fix documentation link error (nickhsine)
* [[`85487b0ba0`](https://github.com/twreporter/keystone/commit/85487b0ba0)] - **docs**: delete unused docs (nickhsine)
* [[`ff06ace593`](https://github.com/twreporter/keystone/commit/ff06ace593)] - Merge pull request #161 from nickhsine/docs (nick)
* [[`d4c8aabc1f`](https://github.com/twreporter/keystone/commit/d4c8aabc1f)] - **chore**: mv website to docs (nickhsine)
* [[`53c818d1d8`](https://github.com/twreporter/keystone/commit/53c818d1d8)] - Merge pull request #160 from nickhsine/docs (nick)
* [[`a976cdf19b`](https://github.com/twreporter/keystone/commit/a976cdf19b)] - **docs**: keystone documentation (nickhsine)
* [[`3ad703e7bd`](https://github.com/twreporter/keystone/commit/3ad703e7bd)] - Merge pull request #159 from nickhsine/master (nick)

## 0.9.1, 2020/11/25

### Commits

* [[`43e77621b4`](https://github.com/twreporter/keystone/commit/43e77621b4)] - Merge pull request #158 from nickhsine/0.9.1 (nick)
* [[`e0c84d5139`](https://github.com/twreporter/keystone/commit/e0c84d5139)] - Merge pull request #157 from nickhsine/master (nick)
* [[`8ce7b127de`](https://github.com/twreporter/keystone/commit/8ce7b127de)] - **refactor**: update GcsImageField.js (nickhsine)

## 0.9.0, 2020/11/25

### Notable Changes

- [refactor: update gcsimage](https://github.com/twreporter/keystone/pull/156)
- [refactor: update GcsImageField.js. render resized public image URLs](https://github.com/twreporter/keystone/pull/155)
- [feat: update gcsimage](https://github.com/twreporter/keystone/pull/154)

### Commits
* [[`d5d4d2820e`](https://github.com/twreporter/keystone/commit/d5d4d2820e)] - Merge pull request #156 from nickhsine/update-gcsimage (nick)
* [[`5f1f494bfa`](https://github.com/twreporter/keystone/commit/5f1f494bfa)] - **refactor**: update GcsImageColumn.js (nickhsine)
* [[`9c27e72633`](https://github.com/twreporter/keystone/commit/9c27e72633)] - **feat**: search gcsimage by iptc metadata (nickhsine)
* [[`4f0bcff618`](https://github.com/twreporter/keystone/commit/4f0bcff618)] - **refactor**: update GcsImageColumn.js. render iptc metadata (nickhsine)
* [[`9ff43a1cd1`](https://github.com/twreporter/keystone/commit/9ff43a1cd1)] - **refactor**: update GcsImageField.js. add default note (nickhsine)
* [[`87576817df`](https://github.com/twreporter/keystone/commit/87576817df)] - **refactor**: update GcsImageField.js. add slack channel notice (nickhsine)
* [[`97f42241ed`](https://github.com/twreporter/keystone/commit/97f42241ed)] - **refactor**: update GcsImageField.js. update unsupport file type alert (nickhsine)
* [[`60dcdae55f`](https://github.com/twreporter/keystone/commit/60dcdae55f)] - **fix**: update GcsImageField.js. resolve undefined function (nickhsine)
* [[`9eab59dab5`](https://github.com/twreporter/keystone/commit/9eab59dab5)] - **refactor**: update GcsImageField.js. support `image/bmp` (nickhsine)
* [[`2ec86eb691`](https://github.com/twreporter/keystone/commit/2ec86eb691)] - Merge pull request #155 from nickhsine/master (nick)
* [[`b5f2862fe3`](https://github.com/twreporter/keystone/commit/b5f2862fe3)] - **refactor**: update lib/parseAPIResponse.js (nickhsine)
* [[`b0b7149c47`](https://github.com/twreporter/keystone/commit/b0b7149c47)] - **chore**: add @twreporter/core (nickhsine)
* [[`f75726e123`](https://github.com/twreporter/keystone/commit/f75726e123)] - **refactor**: update GcsImageField.js. render resized public image URLs (nickhsine)
* [[`0d0c706145`](https://github.com/twreporter/keystone/commit/0d0c706145)] - Merge pull request #154 from nickhsine/drop-resize (nick)
* [[`3070cded12`](https://github.com/twreporter/keystone/commit/3070cded12)] - **refactor**: handle gs location properly (nickhsine)
* [[`513bc06ad0`](https://github.com/twreporter/keystone/commit/513bc06ad0)] - **refactor**: update GcsImageType.js (nickhsine)
* [[`d0d8803bfa`](https://github.com/twreporter/keystone/commit/d0d8803bfa)] - **style**: update GcsImageColumn.js (nickhsine)
* [[`b51d57e1e5`](https://github.com/twreporter/keystone/commit/b51d57e1e5)] - **refactor**: update GcsImageFilter.js (nickhsine)
* [[`743fc3ba1e`](https://github.com/twreporter/keystone/commit/743fc3ba1e)] - **refactor**: update GcsImageColumn.js. fix indent (nickhsine)
* [[`9bdcc96417`](https://github.com/twreporter/keystone/commit/9bdcc96417)] - **refactor**: update GcsImageColumn.js (nickhsine)
* [[`4556af2c15`](https://github.com/twreporter/keystone/commit/4556af2c15)] - **refactor**: update lib/gcsHelper.js (nickhsine)
* [[`03110e9fd9`](https://github.com/twreporter/keystone/commit/03110e9fd9)] - **refactor**: update less: cloudinaryimage -\> gcsimage (nickhsine)
* [[`d280cfa5d0`](https://github.com/twreporter/keystone/commit/d280cfa5d0)] - **fix**: remove `makePublic` after uploading files onto GCS (nickhsine)
* [[`d3a7d8f092`](https://github.com/twreporter/keystone/commit/d3a7d8f092)] - **feat**: update GcsImageType and GcsImageField (nickhsine)
* [[`2fa2119515`](https://github.com/twreporter/keystone/commit/2fa2119515)] - **feat**: remove gcsimages field type (nickhsine)
* [[`1ceaa8255c`](https://github.com/twreporter/keystone/commit/1ceaa8255c)] - **refactor**: update lib/gcsHelper.js. exports `getAuthenticatedUrl` (nickhsine)
* [[`0ff7d32e38`](https://github.com/twreporter/keystone/commit/0ff7d32e38)] - **refactor**: indent lib/gcsHelper.js properly (nickhsine)
* [[`efff7319a1`](https://github.com/twreporter/keystone/commit/efff7319a1)] - **refactor**: indent GcsImageType.js properly (nickhsine)
* [[`57c54cbe2b`](https://github.com/twreporter/keystone/commit/57c54cbe2b)] - **chore**: yarn remove http-proxy dependency (nickhsine)
* [[`c829411dc3`](https://github.com/twreporter/keystone/commit/c829411dc3)] - Merge pull request #153 from nickhsine/preview-origin (nick)

## 0.8.0, 2020/09/09

### Notable Changes

- bug fix:
	- [fatal error makes server crash while updating post](https://github.com/twreporter/keystone/pull/148)
	- [parse date string at the right utc offset](https://github.com/twreporter/keystone/pull/148)
  - [empty script object when encountering close tag](https://github.com/twreporter/keystone/pull/150)

- refactor:
	- [change preview origin on demand](https://github.com/twreporter/keystone/pull/153)

- feature:
	- [disable autoIndex in production](https://github.com/twreporter/keystone/pull/152)

### Commits
* [[`d039cb6d24`](https://github.com/twreporter/keystone/commit/d039cb6d24)] - **refactor**: fix indentation (nickhsine)
* [[`39d5a7ed76`](https://github.com/twreporter/keystone/commit/39d5a7ed76)] - **refactor**: load preview origin from config (nickhsine)
* [[`9e8c6bc4e3`](https://github.com/twreporter/keystone/commit/9e8c6bc4e3)] - **refactor**: delete preview route (unused) (nickhsine)
* [[`84fa6fc85d`](https://github.com/twreporter/keystone/commit/84fa6fc85d)] - Merge pull request #152 from babygoat/master (babygoat)
* [[`7c90a5036e`](https://github.com/twreporter/keystone/commit/7c90a5036e)] - **feat**: disable autoIndex in production (Ching-Yang, Tseng)
* [[`c062ee4de2`](https://github.com/twreporter/keystone/commit/c062ee4de2)] - Merge pull request #151 from YuCJ/master (yucj)
* [[`76d5412605`](https://github.com/twreporter/keystone/commit/76d5412605)] - chore(release): bump version to v0.8.0-rc.5 (yucj)
* [[`a08f5b60a8`](https://github.com/twreporter/keystone/commit/a08f5b60a8)] - **fix**: wrong script parsing of embedded code (yucj)
* [[`b49f68cc5a`](https://github.com/twreporter/keystone/commit/b49f68cc5a)] - Merge pull request #150 from taylrj/fix-multi-scripts (Tai-Jiun Fang)
* [[`83728336a6`](https://github.com/twreporter/keystone/commit/83728336a6)] - chore(release): bump version to v0.8.0-rc.4 (Taylor Fang)
* [[`d657d505f4`](https://github.com/twreporter/keystone/commit/d657d505f4)] - **fix**: fix indentation (Taylor Fang)
* [[`f9c7b7e3cd`](https://github.com/twreporter/keystone/commit/f9c7b7e3cd)] - **fix**: address review comment (Taylor Fang)
* [[`71d705b4a4`](https://github.com/twreporter/keystone/commit/71d705b4a4)] - **fix**: create a new object for each script tag (Taylor Fang)
* [[`6d9d17e094`](https://github.com/twreporter/keystone/commit/6d9d17e094)] - Merge pull request #149 from nickhsine/master (Tai-Jiun Fang)
* [[`74db4e6bce`](https://github.com/twreporter/keystone/commit/74db4e6bce)] - chore(release): 0.8.0-rc.3 (nickhsine)
* [[`385991a92d`](https://github.com/twreporter/keystone/commit/385991a92d)] - **fix**: downgrade multer to 0.1.8 (nickhsine)
* [[`9b680e2a88`](https://github.com/twreporter/keystone/commit/9b680e2a88)] - **chore**: update to 0.8.0-rc.2 (nickhsine)
* [[`c101d61e7e`](https://github.com/twreporter/keystone/commit/c101d61e7e)] - **fix**: catch fatal error while updating HtmlType value (nickhsine)
* [[`56c4123b32`](https://github.com/twreporter/keystone/commit/56c4123b32)] - **fix**: increase form-data field size from 1MB to 8 MB (nickhsine)
* [[`bcb2514101`](https://github.com/twreporter/keystone/commit/bcb2514101)] - Merge pull request #148 from nickhsine/master (nick)
* [[`8c62c2c27c`](https://github.com/twreporter/keystone/commit/8c62c2c27c)] - **docs**: update CHANGELOG.md (nickhsine)
* [[`6d4200eeb2`](https://github.com/twreporter/keystone/commit/6d4200eeb2)] - chore(release): 0.8.0-rc.1 (nickhsine)
* [[`2320784a56`](https://github.com/twreporter/keystone/commit/2320784a56)] - **refactor**: change date output format for DateColumn.js (nickhsine)
* [[`b67266ecbb`](https://github.com/twreporter/keystone/commit/b67266ecbb)] - **fix**: parse date string at the right utc offset (nickhsine)
* [[`672d22aebc`](https://github.com/twreporter/keystone/commit/672d22aebc)] - Update CHANGELOG.md (Yu Chung-Jen)

## 0.7.2, 2019/10/30
### Notable Changes
- bug fix:
  - update draft-converter.js: `_.forEach` is not a function when converting draft blocks to html

### Commits
- [[b32e23a](https://github.com/twreporter/keystone/commit/b32e23ad0a7d6487cc1829bb120d342447a60b20)] - bug fix: `_.forEach` is not a function when converting draft blocks to html(nickhsine)

## 0.7.1, 2019/10/18
### Notable Changes
- build:
  - remove gulp release task
  - update yarn.lock
  - upgrade dependencies

- bug fix:
  - can not create Keystone global object on client side

- miscellaneous:
  - import only needed lodash functions without importing all

### Commits
- [[8e91581](https://github.com/twreporter/keystone/commit/8e91581c2066fe4bbb3b36b1ab200e09a44af8fa)] - add package.json#files and rm .npmignore(nickhsine)
- [[d2d8ebf](https://github.com/twreporter/keystone/commit/d2d8ebff19b36c49d1b5fa7a0a0267c084e0bbf2)] - remove gulp release task(nickhsine)
- [[7998b87](https://github.com/twreporter/keystone/commit/7998b87ca1175b07523b1cecfcd6608f3575f407)] - bug fix: can not create Keystone global object on client side(nickhsine)
- [[4aee2e5](https://github.com/twreporter/keystone/commit/4aee2e51eddad2eb2d3790f2e646629947380445)] - import lodash functions separately without importing all(nickhsine)
- [[63ed57a](https://github.com/twreporter/keystone/commit/63ed57a756e3b0313b4eed0aa62c5d304fce5f13)] - update yarn.lock(nickhsine)
- [[c53651e](https://github.com/twreporter/keystone/commit/c53651e84193f2f23d01e220e0a108673b97ca19)] - update dep @twreporter/react-article-components(nickhsine)
- [[5611b66](https://github.com/twreporter/keystone/commit/5611b667c930c5e9788c3d04f94831ac0deeb727)] - upgrade dep watchify(nickhsine)
- [[846c74a](https://github.com/twreporter/keystone/commit/846c74a792319a02eae0bd5aab7d9372cc2b3b47)] - update yarn.lock(nickhsine)
- [[985e53d](https://github.com/twreporter/keystone/commit/985e53d4db046e73e67e2602acfe9567e1f55db2)] - update package.json#version to 0.7.1(nickhsine)
-

## 0.7.0 2018/11/20
- Update dependencies
  - Repalce gcloud by @google-cloud/storage
  - Add dependency har-validator@5.1.0, whose node dependency is >=4

## 0.6.4 2018/05/28
- Replace `image-size` by `probe-image-size` because of [this issue](https://github.com/image-size/image-size/issues/96)

## 0.6.3 2017/12/30
- Show all the user avators when they are editing the same page

## 0.6.2 2017/12/13
- Update .gitignore
- Add two-step verification to signin

## 0.6.1 2017/10/23
- Replace twreporter-react-components by @twreporter/react-article-components

## 0.6.0 2017/10/11
- Use npm-scope. Rename twreporter-keystone to @twreporter/keystone

## 0.5.37 2017/10/02
- Add two more position between title and leading image

## 0.5.36 2017/09/21
- Pass filetype and filename to resize function while resizing gcsimage and gcsimages

## 0.5.35 2017/08/25
- Rebuild the package

## 0.5.34 2017/08/24
- Bug fix. Date will turn back to the first value after modifying other fields

## 0.5.33 2017/08/24
- Multiline for input of image description

## 0.5.32 2017/03/20
- [Update] Add relatedsForamt and titlePosition types for multiple styles of topics

## 0.5.29 2016/11/24
- [Update] Use http://keystone-preview.twreporter.org to render preview article page

## 0.5.27 2016/11/24
- [Update] Use keystone-preview.twreporter.org to render preview article page

## 0.5.26 2016/10/28
- [Update] Set max-age of cache-control header to one year for uploading images and files onto google cloud storage

## 0.5.25 2016/10/11
- [Add] Preview button and preview column for linking to preview page

## 0.5.24 2016/10/7
- [Add] use http-proxy to proxy preview article page request to other server

## 0.5.23 2016/09/13
- Add Cache-Control for uploading images and audios onto GCS(a week)

## 0.5.22 2016/09/01
- Bug fix. Store ordered-list and unordered-list in the right way

## 0.5.21 2016/08/30
- Workaround for using twreporter-react pkg without error

## 0.5.20 2016/08/29
- Increase slide limitation of Slideshow

## 0.5.19 2016/08/24
- Enable to copy & paste HTML on the editor of entity editing block.
- Enable to insert soft newline on the editor of entity editing block.

## 0.5.18 2016/08/24
- Insert soft new line by typing `ctrl` or `shift` and `enter` keys

## 0.5.17 2016/08/23
- Fix Datetime and Date issue.

## 0.5.16 2016/08/23
- Render Embedded Component well while embedded code is iframe
- Get height and width of iframe if provided for Embedded component

## 0.5.15 2016/08/19
- Use wordaround to delete the last item of relationship field
- Make Embedded and ImageLink component alignable
- Put Link button back to the editor of InfoBox and Annotation

## 0.5.14 2016/08/18
- Fix bug. Annotation works abnormally

## 0.5.13 2016/08/17
- Bug fix. Render ImageLink by Embedded Component.
- Add target="_blank" attribute when converting LINK entity into a tag

## 0.5.11 2016/08/17
- Bug fix. Import lodash.

## 0.5.10 2016/08/16
- Bug fix. Import twreporter-react pkg in the right path.

## 0.5.9 2016/08/16
- Add default blockquote block type of draftjs back

## 0.5.7 2016/08/16
- Fix Infogram embedded script bug, also handle embedded code with script tags.

## 0.5.6 2016/08/15
- Add ImageLink component, which makes editor input image url and get image html tag output

## 0.5.5 2016/08/14
- Back compatible with old data whose entity type might be lower case

## 0.5.4 2016/08/14
- Handle pasted text
- take off h3 to h6 of the Draft Editor

## 0.5.3 2016/08/13
- Fix image uploading bug.

## 0.5.2 2016/0813
- Delete local temporary files synchronously
- render image-collection listing page efficiently

## 0.5.1 2016/08/12
- Delete local temporary files after uploding images

## 0.5.0 2016/08/03
- Replace pkg react-article-components by twreporter-react
- Upgrade React to 15

## 0.4.16 2016/07/20
- Fix bug. Fix the problem we cannot change the images in the Slideshow component.
- Make ImageDiff component editable.

## 0.4.15
- Integrate Youtube and BlockQuote component of react-article-components
- Draft editor style tunning

## 0.4.14
- Integrate slideshow component of react-article-components

## 0.4.13
- Bug fix; search images by keyword
- Style change; add select icon and remove icon
