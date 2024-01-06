// Checkboxes
const inputs = document.getElementsByTagName('input');
for (let input of inputs) {
    var key = input.id;
    input.checked = (await chrome.storage.sync.get(key))[key];
    input.addEventListener('change', (event) => {
        chrome.storage.sync.set({ [event.target.id]: event.target.checked });
        chrome.runtime.sendMessage(null);
    });
}
// Links
const links = document.getElementsByTagName('a');
for (let link of links) {
    link.onclick = () => {
        chrome.tabs.create({ url: link.href });
    };
}
