(function() {
  const dialogSelector = '[role="dialog"]';
  const storageName = "_ext_flwrs";
  const storageExpName = "_ext_flwrsExp";
  const username = window._sharedData.config.viewer.username;
  const errorMessage = '&#9940; (scroll followers)';
  
  const DEBUG = false;

  if (typeof followersSet !== "object") {
    // do not use const/let here
    var followersSet = new Set(
      localStorage[storageName] ? JSON.parse(localStorage[storageName]) : ""
    );
  }

  class Common {
    constructor() {
      this.parsedMarkerName = "_ext-parsed";
      //check expiration date of follower list
      if (localStorage[storageExpName] < this.getTimeStamp()) {
        localStorage.removeItem(storageName);
      }
      //size changed => erase local storage
      if (followersSet.size < this.getFollowersCount()) {
        localStorage.removeItem(storageName);
      }
    }
    waitForDialog() {
      return new Promise((resolve, reject) => {
        const intrv = setInterval(() => {
          if (this.getSelector()) {
            clearInterval(intrv);
            resolve();
          }
        }, 300);
      });
    }
    getTimeStamp(plus = 0) {
      return ((Date.now() / 1000) | 0) + plus;
    }
    getFollowersCount() {
      const total = document.querySelector(
        `[href="/${username}/followers/"] span`
      ).innerHTML;
      return /^\+?(0|[1-9]\d*)$/.test(total) ? Number(total) : undefined;
    }
    getSelector() {
      return document.querySelector(`${dialogSelector} ul`);
    }
    changesHandler(callback) {
      const ro = new ResizeObserver(() => {
        this.parser(callback);
      });
      ro.observe(this.getSelector());
    }
    parser(callback) {
      try {
        this.getSelector()
          .querySelectorAll("li")
          .forEach(item => {
            if (item.getAttribute(this.parsedMarkerName)) {
              return;
            }
            item.setAttribute(this.parsedMarkerName, true);
            callback(item);
          });
      } catch (err) {
        if(DEBUG) console.error(err);
      }
    }
  }

  class Followers extends Common {
    constructor() {
      super();
      this.waitForDialog().then(() => {
        this.changesHandler(this.pushName);
      });
      localStorage[storageExpName] = this.getTimeStamp(10800);
    }

    pushName(item) {
      const name = item.querySelector("[title]").getAttribute("title");

      if (name) {
        followersSet.add(name);
        item.querySelector("[title]").innerHTML += " &#9989;";
        localStorage[storageName] = JSON.stringify(Array.from(followersSet));
      }
    }
  }

  class Following extends Common {
    constructor() {
      super();
      this.waitForDialog()
        .then(() => this.checkAccuracy())
        .then(() => {
          this.changesHandler(this.markUser);
        })
        .catch(err => {
			if(DEBUG) console.error(err);
		});
    }

    checkAccuracy() {
      return new Promise((resolve, reject) => {
        if (followersSet.size < this.getFollowersCount()) {
          document.querySelector(`${dialogSelector} h1 div`).innerHTML +=
            errorMessage;
			console.log(followersSet.size);
			console.log(followersSet);
			console.log(this.getFollowersCount());
          reject();
        } else {
          resolve();
        }
      });
    }

    markUser(item) {
      const name = item.querySelector("[title]").getAttribute("title");

      if (!followersSet.has(name)) {
        item.querySelector("button").innerHTML += " &#9888";
      }
    }
  }

  
  if (!String(window.location).includes(`/${username}`)) {
    return false;
  }

  if (String(window.location).includes("/followers")) {
    new Followers();
  } else {
    new Following();
  }
})();
