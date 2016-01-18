//need to write string to be the data 'file' to put in pouchDB

function deleteFzrFile(fzr, fileId) {
  'use strict';
  try { delete av.fzr.file[fileId];}
  catch(e) {av.fzr.file[fileId] = undefined; }
}

function makeEmDxFile(fio, path, contents) {
  'use strict';
  fio.dxdb.FILE_DATA.add( {
      timestamp: Date.now(),  //We may need to do more work with this property
      contents: utf8bytesEncode(contents),
      mode: 33206
    },
    path
  ).then(function () {
      console.log('Able to add file ', path);
    }).catch(function (err) {
      console.log('Unable to add file, path',path, '; error', err);
    });
}

function makeFzrFile(fzr, fileId, text) {
  'use strict';
  fzr.file[fileId] = text;
}

// copy instruction set from default config.
function makeFzrInstsetCfg(fzr, idStr) {
  'use strict';
  fzr.file[idStr + '/instset.cfg'] = fzr.file['c0/instset.cfg'];
}

function makeFzrWorldEventsCfg(fzr, idStr, em) {
  'use strict';
  var txt = 'u begin LoadPopulation detail.spop' + '\n';
  txt += 'u begin LoadStructuredSystematicsGroup role=clade:filename=clade.ssg';
  if (em) {makeEmDxFile(fzr, idStr+'/events.cfg', txt);}
  else {makeFzrFile(fzr, idStr+'/events.cfg', txt);}
}

function makeFzrAvidaCfg(fzr, idStr, em) {
  'use strict';
  var txt = 'WORLD_X ' + dijit.byId("sizeCols").get('value') + '\n';
  txt += 'WORLD_Y ' + dijit.byId("sizeRows").get('value') + '\n';
  txt += 'WORLD_GEOMETRY 1 \n';
  txt += 'COPY_MUT_PROB ' + document.getElementById("muteInput").value/100 + '\n';
  txt += 'DIVIDE_INS_PROB 0.0 \n';
  txt += 'DIVIDE_DEL_PROB 0.0 \n';
  txt += 'OFFSPRING_SIZE_RANGE 1.0 \n';
  // parents (ancestors) are injected into avida separately.
  if (dijit.byId("childParentRadio").get('checked')) txt += 'BIRTH_METHOD 0 \n';  //near parent
  else txt += 'BIRTH_METHOD 4 \n';   //anywhere randomly
  if (dijit.byId("experimentRadio").get('checked')) txt += 'RANDOM_SEED -1 \n';
  else txt += 'RANDOM_SEED 100\n';
  txt += '#include instset.cfg\n';
  txt += 'I\n';
  if (em) {makeEmDxFile(fzr, idStr+'/avida.cfg', txt);}
  else {makeFzrFile(fzr, idStr+'/avida.cfg', txt);}
}

function makeFzrEnvironmentCfg(fzr, idStr, em) {
  'use strict';
  var txt = '';
  if (dijit.byId("notose").get('checked')) txt += 'REACTION  NOT  not   process:value=1:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  NOT  not   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("nanose").get('checked')) txt += 'REACTION  NAND nand  process:value=1:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  NAND nand  process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("andose").get('checked')) txt += 'REACTION  AND  and   process:value=2:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  AND  and   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("ornose").get('checked')) txt += 'REACTION  ORN  orn   process:value=2:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  ORN  orn   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("orose").get('checked'))  txt += 'REACTION  OR   or    process:value=3:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  OR   or    process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("andnose").get('checked')) txt += 'REACTION  ANDN andn  process:value=3:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  ANDN andn  process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("norose").get('checked')) txt += 'REACTION  NOR  nor   process:value=4:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  NOR  nor   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("xorose").get('checked')) txt += 'REACTION  XOR  xor   process:value=4:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  XOR  xor   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("equose").get('checked')) txt += 'REACTION  EQU  equ   process:value=5:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  EQU  equ   process:value=0:type=pow  requisite:max_count=1\n';
  if (em) {makeEmDxFile(fzr, idStr+'/environment.cfg', txt);}
  else  { makeFzrFile(fzr, idStr+'/environment.cfg', txt);}
}

function makeFzrAncestor(fzr, idStr) {
  'use strict';
}

av.fio.sendConfig = function(av) {
  'use strict';
  av.fio.dxdb.open();
  var idStr = 'ws/cwd';
  var em = true;
  makeFzrAvidaCfg(av.fio, idStr, em);
  makeFzrEnvironmentCfg(av.fio, idStr, em);
  makeEmDxFile(av.fio, idStr+'/events.cfg', '');
  //makeFzrInstsetCfg(av.fio, idStr, em);
  av.fio.dxdb.close();
}

function makeFzrConfig(fzr, num, parents) {
  'use strict';
  var em = false;
  makeFzrAvidaCfg(fzr, 'c'+num, em);
  makeFzrEnvironmentCfg(fzr, 'c'+num, em);
  makeFzrFile(fzr, 'c'+num+'/events.cfg', '');
  makeFzrFile(fzr, 'c'+num+'/entryname.txt', fzr.config[ndx].name);
  makeFzrInstsetCfg(fzr, 'c'+num);
  //need ancestor files still tiba
}

function makeFzrWorld(fzr, fio, grd, parents) {
  'use strict';
  var ndx = fzr.config.length-1;  //write the last one created
  makeFzrAvidaCfg(fzr, fzr.world[ndx]._id);
  makeFzrEnvironmentCfg(fzr, fzr.world[ndx]._id);
  makeFzrWorldEventsCfg(fzr, fzr.world[ndx]._id);
  makeFzrFile(fzr, fzr.world[ndx]._id+'/entryname.txt', fzr.world[ndx].name);
  makeFzrInstsetCfg(fzr, fzr.world[ndx]._id);

  makeFzrFile(fzr, fzr.world[ndx]._id+'/update', grd.updateNum);
  //there are more files need to talk to Matt, tiba
}

function makeFzrOrgan(fzr) {
  'use strict';
  var ndx = fzr.genome.length-1;  //write the last one created
  makeEmDxFile(fzr, fzr.genome[ndx]._id+'/entryname.txt', fzr.genome[ndx].name);
  makeEmDxFile(fzr, fzr.genome[ndx]._id+'/genome.seq', fzr.genome[ndx].genome);
}

function removeFzrConfig(fzr, dir) {
  'use strict';
  deleteFzrFile(fzr, dir+'/ancestors');
  deleteFzrFile(fzr, dir+'/ancestors_manual');
  deleteFzrFile(fzr, dir+'/avida.cfg');
  deleteFzrFile(fzr, dir+'/environment.cfg');
  deleteFzrFile(fzr, dir+'/events.cfg');
  deleteFzrFile(fzr, dir+'/entryname.txt');
  deleteFzrFile(fzr, dir+'/instset.cfg');
  var domid = fzr.domid[dir];
  delete fzr.domid[dir];
  delete fzr.dir[domid];
}

function removeFzrGenome(fzr, dir) {
  'use strict';
  deleteFzrFile(fzr, dir+'/entryname.txt');
  deleteFzrFile(fzr, dir+'/genome.seq');
  var domid = fzr.domid[dir];
  delete av.fzr.domid[dir];
  delete av.fzr.dir[domid];
  console.log('after remove genome: dir', dir, '; av.fzr', av.fzr);
}

function removeFzrWorld(fzr, dir) {
  'use strict';
  deleteFzrFile(fzr, dir+'/ancestors');
  deleteFzrFile(fzr, dir+'/ancestors_manual');
  deleteFzrFile(fzr, dir+'/avida.cfg');
  deleteFzrFile(fzr, dir+'/environment.cfg');
  deleteFzrFile(fzr, dir+'/events.cfg');
  deleteFzrFile(fzr, dir+'/entryname.txt');
  deleteFzrFile(fzr, dir+'/instset.cfg');
  deleteFzrFile(fzr, dir+'/update');
  var domid = fzr.domid[dir];
  delete fzr.domid[dir];
  delete fzr.dir[domid];
  //deleteFzrFile(fzr, dir+'/');
  //deleteFzrFile(fzr, dir+'/');
}

av.fzr.removeFzrItem = function(fzr, dir, type){
  'use strict';
  console.log('dir', dir);
  switch (type){
    case 'c':
      removeFzrConfig(fzr, dir);
      break;
    case 'g':
      removeFzrGenome(fzr, dir);
      break;
    case 'w':
      removeFzrWorld(fzr, dir);
      break;
  }
}
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
 */

/* Reading files
 API = https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 */

/* Name Spaces and single page apps
 http://singlepageappbook.com/index.html
 http://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript
 http://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript#answer-3588712
 https://www.kenneth-truyers.net/2013/04/27/javascript-namespaces-and-modules/
 https://addyosmani.com/blog/essential-js-namespacing/
 */