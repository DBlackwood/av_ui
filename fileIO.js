// folders will be:
// cwd = current working directory
// saved = where files are put to save to user workspace

// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
//https://thiscouldbebetter.wordpress.com/2013/08/06/reading-zip-files-in-javascript-using-jszip/
av.fio.readZipWS = function(zipFileName,loadConfigFlag) {
  'use strict';
  if (loadConfigFlag) av.fzr.clearFzrFn();
  else av.fzr.clearMainFzrFn();  // clear freezer (globals.js)
  //Clear each section of the freezer and active organism and ancestorBox
  av.dnd.fzConfig.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.fzConfig.sync();   //should be done after insertion or deletion
  av.dnd.fzOrgan.selectAll().deleteSelectedNodes();
  av.dnd.fzOrgan.sync();
  av.dnd.fzWorld.selectAll().deleteSelectedNodes();
  av.dnd.fzWorld.sync();
  //Change loading a workspace will change the freezer, but not parents or configuration
/*  av.parents.clearParentsFn();  //globals.js
  av.dnd.ancestorBox.selectAll().deleteSelectedNodes();
  av.dnd.ancestorBox.sync();
  av.dnd.activeOrgan.selectAll().deleteSelectedNodes();
  av.dnd.activeOrgan.sync();
*/
  var oReq = new XMLHttpRequest();
  oReq.open("GET", zipFileName, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = function (oEvent) {
    var arybuf = oReq.response;
    console.log("have ziptest.zip", arybuf);
    // do something to extract it
    av.fio.zipfile = new av.fio.JSZip();
    console.log("loading arybuf");
    av.fio.zipfile.load(arybuf, {base64: false});
    //console.log("arybuf loaded");
    console.log('before call procesfiles');
    av.fio.zipPathRoot = null;
    for (var zFileName in av.fio.zipfile.files) {
      //target will be assigned the beginning of the path name within the zip file.
      if (null == av.fio.zipPathRoot) {
        var leading = wsb('/', zFileName);
        if ('__MACOSX' != leading) av.fio.zipPathRoot = leading; //this gets the root name which we remove from path in the fzr file
      }
      av.fio.thisfile = av.fio.zipfile.files[zFileName];
      av.fio.fName = zFileName;
      av.fio.anID = wsa(av.fio.zipPathRoot+'/', av.fio.fName);
      if (3 < av.fio.fName.length) processFiles(loadConfigFlag);
    };
    //note setup form is updated when the files are read.
    console.log('after read loop: fzr', av.fzr);
    av.fio.fileReadingDone = true;
    //console.log('before DrawGridSetup')
    av.grd.drawGridSetupFn();
    av.fzr.cNum++;  //now the Num value refer to the next (new) item to be put in the freezer.
    av.fzr.gNum++;
    av.fzr.wNum++;
  };
  oReq.send();
}

av.fio.readWS = function(zipFileName,loadConfigFlag) {
  'use strict';
  av.fzr.clearMainFzrFn();  // clear freezer (globals.js)
  //Clear each section of the freezer and active organism and ancestorBox
  av.dnd.fzConfig.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.fzConfig.sync();   //should be done after insertion or deletion
  av.dnd.fzOrgan.selectAll().deleteSelectedNodes();
  av.dnd.fzOrgan.sync();
  av.dnd.fzWorld.selectAll().deleteSelectedNodes();
  av.dnd.fzWorld.sync();

  var oReq = new XMLHttpRequest();
  oReq.open("GET", zipFileName, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = function (oEvent) {
    var arybuf = oReq.response;
    console.log("have ziptest.zip", arybuf);
    // do something to extract it
    av.fio.zipfile = new av.fio.JSZip();
    console.log("loading arybuf");
    av.fio.zipfile.load(arybuf, {base64: false});
    //console.log("arybuf loaded");
    console.log('before call procesfiles');
    av.fio.zipPathRoot = null;
    for (var zFileName in av.fio.zipfile.files) {
      //av.fio.zipPathRoot will be assigned the beginning of the path name within the zip file.
      if (null == av.fio.zipPathRoot) {
        var leading = wsb('/', zFileName);
        if ('__MACOSX' != leading) av.fio.zipPathRoot = leading; //this gets the root name which we remove from path in the fzr file
      }
      av.fio.thisfile = av.fio.zipfile.files[zFileName];
      av.fio.fName = zFileName;
      processFiles(loadConfigFlag);
    };
    //note setup form is updated when the files are read.
    console.log('after read loop: fzr', av.fzr);
    av.fio.fileReadingDone = true;
    //console.log('before DrawGridSetup')
    av.grd.drawGridSetupFn();
    av.fzr.cNum++;  //now the Num value refer to the next (new) item to be put in the freezer.
    av.fzr.gNum++;
    av.fzr.wNum++;
  };
  oReq.send();
}

av.fio.fzSaveCurrentWorkspaceFn = function () {
  if (0 === av.fio.userFname.length) av.fio.userFname = prompt('Choose a name for your Workspace', av.fio.defaultUserFname);
  if (0 === av.fio.userFname.length) av.fio.userFname = av.fio.defaultUserFname;
  var end = av.fio.userFname.substring(av.fio.userFname.length-4);
  if ('.zip' != end) av.fio.userFname = av.fio.userFname + '.zip';
  console.log('end', end, '; userFname', av.fio.userFname);
  var WSzip = new av.fio.JSZip();
  for (var fname in av.fzr.file) {
    WSzip.file('av.avidaedworkspace/'+fname, av.fzr.file[fname]);
  }
  var content = WSzip.generate({type:"blob"});
  console.log('before saveAs');
  saveAs(content, av.fio.userFname);
  console.log('afer saveAs');
  // Test works; zip is saved to user's Downloads directory
};


/* PouchDB websites
 http://pouchdb.com/api.html#database_information
 https://github.com/webinista/PouchNotes
 http://pouchdb.com/guides/databases.html
 */

/* web sites on Promises
 first one does a good job of explaining.
 http://www.html5rocks.com/en/tutorials/es6/promises/
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 http://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html
 */

/* JSzip Websites
 http://stuk.github.io/jszip/documentation/api_jszip/load.html
 http://stuk.github.io/jszip/documentation/limitations.html
 https://thiscouldbebetter.wordpress.com/2013/08/06/reading-zip-files-in-javascript-using-jszip/

 binary data
 https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
 */

/* Writing files
 http://jsfiddle.net/uselesscode/qm5ag/
 http://jsfiddle.net/cowboy/hHZa9/
 http://jsfiddle.net/uselesscode/qm5ag/          // Pure JS
 */

/* Reading files
 API = https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 http://www.html5rocks.com/en/tutorials/file/dndfiles/
 http://jsfiddle.net/ebSS2/235/
 http://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
 http://stackoverflow.com/questions/6463439/how-to-open-a-file-browse-dialog-using-javascript
 http://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript
 */

/* Name Spaces and single page apps
 http://singlepageappbook.com/index.html
 http://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript
 http://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript#answer-3588712
 https://www.kenneth-truyers.net/2013/04/27/javascript-namespaces-and-modules/
 https://addyosmani.com/blog/essential-js-namespacing/
 */

//console.log("tests for different browsers for download"); //wish I knew where the stuff below came from
//window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
//window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

// Dojo file uploads and downloads
// https://infrequently.org/2005/12/file-uploading-with-dojo/
// http://www.mikejuniper.com/fun-with-dojoioiframesend/

// Iframe file download
// http://encosia.com/ajax-file-downloads-and-iframes/

// JQuery
// http://jsfiddle.net/a856P/51/
// http://jsfiddle.net/cowboy/hHZa9/

// usefule Dexie.db websites
//https://github.com/dfahlander/Dexie.js/wiki/Best%20Practices

