let tabUrl = null;

chrome.tabs.onUpdated.addListener(function (tabId, change, tab){

	if(tab.url === tabUrl){return}
	
	if(tab.url.match(/.+:\/\/.+instagram\.com\/(.+)\/following(|.+)/)){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {following: true}, function(response) {
			 });
		});
	}else if(tab.url.match(/.+:\/\/.+instagram\.com\/(.+)\/followers(|.+)/)){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			 chrome.tabs.sendMessage(tabs[0].id, {followers: true}, function(response) {
			 });
		});
	}
	
	tabUrl = tab.url;
});
