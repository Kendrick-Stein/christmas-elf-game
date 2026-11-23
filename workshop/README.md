# 造树工坊 / Tree Workshop

Independent prototype. Open `index.html` in a modern browser or serve this folder with any static server. All resources are local. No server, timer, gameplay, analytics, or uploads. The canvas reuses the existing original Pine & Snow pixel branches; imported pixel graphics and undo state stay in memory and disappear when reloading. Only the language choice is remembered in browser storage.

- **松枝 / Branches:** Tap a branch or use its layer number, then set the width. Add tops or remove a selected row; undo changes.
- **挂饰 / Ornaments:** Select a light strand, bulb, bell, bow, candy cane or star, then tap its branch. The selected-layer button is a keyboard alternative. Remove the last item on a selected row.
- **照片 / Photos:** PNG, JPG, WebP, up to 12 MB and 24 megapixels. White backgrounds are removed only where near-white pixels connect to the edge. Uncheck that setting to keep the background. Hang the locally converted 26-pixel image by tapping a branch or pressing the selected-layer button, and remove its most recent photo separately from other decorations. `fixtures/white-background-sample.png` is an original QA image.
- **保存 PNG / Save PNG:** Downloads a 960×1020 PNG without editor selection marks. The preview and export use the same actual branches and ornaments.

Run `node --test tests/*.test.js` for model checks.
