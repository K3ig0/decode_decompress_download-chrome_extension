chrome.action.onClicked.addListener(async function(tab){
  await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    files: ["lib/snappyjs.min.js"],
  });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: decodeDecompressAndDownload
  });
});


function decodeDecompressAndDownload(tabId) {
  const binaryStr = atob(document.body.innerText);
  const len = binaryStr.length;
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const uncompresed = window.SnappyJS.uncompress(bytes);
  const str = new TextDecoder("utf-8").decode(uncompresed);
  let hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:image/svg+xml;base64,' + btoa(str);
  hiddenElement.target = '_blank';
  hiddenElement.download = window.location.href.split("/").pop() + '.svg';
  hiddenElement.click();
};
