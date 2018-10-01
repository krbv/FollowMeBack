const scriptCreater = (name) =>{
		const s = document.createElement('script');
		s.src = chrome.extension.getURL(name);
		(document.head||document.documentElement).appendChild(s);
		s.onload = function() {
			s.parentNode.removeChild(s);
		}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  
	scriptCreater('script.js');
 
});