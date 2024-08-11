chrome.action.onClicked.addListener(async function(tab){
  chrome.extension.isAllowedFileSchemeAccess(async function(isAllowedAccess) {
      if (!isAllowedAccess) {
        console.warn("You must allow access to file URLS");
        chrome.notifications.create("You must allow access to file URLS", {
          title: "No access to the content file",
          message: "You must allow access to file URLS",
          iconUrl: "/logo/logo.png",
          imageUrl: "/thumbnail/allow_access_to_file_urls.jpg",
          type: "image",
          requireInteraction: true
        });
        return;
      }
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: ["lib/snappyjs.min.js", "lib/pako.min.js"],
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: decodeDecompressAndDownload
      });

  });
});

function decodeDecompressAndDownload(tabId) {
  console.log("test");
  const binaryStr = atob(document.body.innerText);
  const len = binaryStr.length;
  let bytes = new Uint8Array(len);
  let str;
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  try { // snappy
    str = btoa(unescape(encodeURIComponent(new TextDecoder("utf-8").decode(window.SnappyJS.uncompress(bytes)))));
  } catch (e) { // zlib
    str = btoa(unescape(encodeURIComponent(window.pako.inflateRaw(Uint8Array.from(binaryStr, c => c.charCodeAt(0)), {to: 'string'}))));
  }
  let hiddenElement = document.createElement("a");
  hiddenElement.href = "data:image/svg+xml;base64," + str;
  hiddenElement.target = "_blank";
  hiddenElement.download = window.location.href.split("/").pop() + ".svg";
  hiddenElement.click();
};
