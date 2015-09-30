function backgroundSquares(grd) {
    var boxColor = '#111';
    for (ii=0; ii<grd.cols; ii++) {
        xx = grd.marginX + grd.xOffset + ii*grd.cellWd;
        for (jj=0; jj<grd.rows; jj++) {
            yy = grd.marginY + grd.yOffset + jj*grd.cellHt;
            //boxColor = get_color0(Viridis_cmap, Math.random(), 0, 1);
            //boxColor = get_color0(Viridis_cmap, 0.5, 0, 1);
            //console.log('color=', boxColor);
            grd.cntx.fillStyle = '#222';
            grd.cntx.fillRect(xx, yy, grd.cellWd-1, grd.cellHt-1);
        }
    }
}

//Draw Cell outline or including special case for Selected
function DrawSelected(grd) {
    grd.selectX = grd.marginX + grd.xOffset + grd.ColSelected * grd.cellWd;
    grd.selectY = grd.marginY + grd.yOffset + grd.RowSelected * grd.cellHt;
    DrawCellOutline(2, '#00ff00', grd.selectX, grd.selectY, grd.cellWd, grd.cellHt)
}

function DrawCellOutline(lineThickness, color, xx, yy, wide, tall) {
    grd.cntx.rect(xx, yy, wide, tall);
    grd.cntx.strokeStyle = color;
    grd.cntx.lineWidth = lineThickness;
    grd.cntx.stroke();
}

function DrawParent(grd, parents) {
    //console.log('parents.col.length, marginX, xOffset', parents.col.length, grd.marginX, grd.xOffset);
    for (ii = 0; ii < parents.col.length; ii++) {
        xx = grd.marginX + grd.xOffset + parents.col[ii]*grd.cellWd;
        yy = grd.marginY + grd.yOffset + parents.row[ii]*grd.cellHt;
        if ("Ancestor Organism" == dijit.byId("colorMode").value) { grd.cntx.fillStyle = parents.color[ii];}
        else { grd.cntx.fillStyle = '#eee'}
        grd.cntx.fillRect(xx, yy, grd.cellWd-1, grd.cellHt-1);
        //console.log('x, y, wd, Ht', xx, yy, grd.cellWd, grd.cellHt);
    }
}

function DrawChildren(grd) {  //Draw the children of parents
    var cc, rr, xx, yy;
    for (ii=0; ii< grd.fill.length; ii++) {
        cc = ii % grd.cols;
        rr = Math.trunc(ii/grd.cols);
        xx = grd.marginX + grd.xOffset + cc*grd.cellWd;
        yy = grd.marginY + grd.yOffset + rr*grd.cellHt;
        if (nan == grd.fill[ii]) {grd.cntx.fillStyle='#000'}
        else {grd.cntx.fillStyle = parents.color[grd.fill[ii]]}
        grd.cntx.fillRect(xx, yy, grd.cellWd-1, grd.cellHt-1);
    }
}

function DrawGridUpdate(grd, parents) {
    // When zoom = 1x, set canvas size based on space available and cell size
    // based on rows and columns requested by the user. Zoom acts as a factor
    // to multiply the size of each cell. When the size of the grid become larger
    // than the canvas, then the canvas is set to the size of the grid and the
    // offset in that direction goes to zero.

    // First find sizes based on zoom
    grd.boxX = grd.zoom * grd.spaceX;
    grd.boxY = grd.zoom * grd.spaceY;
    //get rows and cols based on user input form
    grd.cols = dijit.byId("sizeCols").get('value');
    grd.rows = dijit.byId("sizeRows").get('value');
    //max size of box based on width or height based on ratio of cols:rows and width:height
    if (grd.spaceX/grd.spaceY > grd.cols/grd.rows) {
        //set based  on height as that is the limiting factor.
        grd.sizeY = grd.boxY;
        grd.sizeX = grd.sizeY*grd.cols/grd.rows;
        grd.spaceCellWd = grd.spaceY/grd.rows;
        grd.spaceCells = grd.rows;  //rows exactly fit the space when zoom = 1x
    }
    else {
        //set based on width as that is the limiting direction
        grd.sizeX = grd.boxX;
        grd.sizeY = grd.sizeX * grd.rows/grd.cols;
        grd.spaceCellWd = grd.spaceX/grd.cols;
        grd.spaceCells = grd.cols;  //cols exactly fit the space when zoom = 1x
    }

    //Determine offset and size of canvas based on grid size relative to space size in that direction
    if (grd.sizeX < grd.spaceX) {
        grd.CanvasGrid.width = grd.spaceX;
        grd.xOffset =(grd.spaceX-grd.sizeX)/2;
    }
    else {
        grd.CanvasGrid.width = grd.sizeX;
        grd.xOffset = 0;
    }
    if (grd.sizeY < grd.spaceY) {
        grd.CanvasGrid.height = grd.spaceY;
        grd.yOffset =(grd.spaceY-grd.sizeY)/2;
    }
    else {
        grd.CanvasGrid.height = grd.sizeY;
        grd.yOffset = 0;
    }
    //console.log('Xsize', grd.sizeX, '; Ysize', grd.sizeY, '; zoom=', grd.zoom);

    //get cell size based on grid size and number of columns and rows
    grd.marginX = 1;  //width of black line between the cells
    grd.marginY = 1;  //width of black line between the cells
    grd.cellWd = ((grd.sizeX-grd.marginX)/grd.cols);
    grd.cellHt = ((grd.sizeY-grd.marginY)/grd.rows);

    //Find a reasonable maximum zoom for this grid and screen space
    zMaxCells = Math.trunc(grd.spaceCells/25);  // at least 10 cells
    zMaxWide = Math.trunc(10/grd.spaceCellWd);  // at least 10 pixels
    zMax = ((zMaxCells > zMaxWide) ? zMaxCells: zMaxWide); //Max of two methods
    zMax = ((zMax > 2) ? zMax: 2); //max zoom power of at least 2x

    grd.ZoomSlide.set("maximum", zMax);
    grd.ZoomSlide.set("discreteValues", 2*(zMax-1)+1);
    //console.log("Cells, pixels, zMax, zoom", zMaxCells, zMaxWide, zMax, grd.zoom);

    DrawGridBackground(grd);
    //Check to see if run has started
    //if (newrun) { DrawParent(grd, parents);}
    if (true) { DrawParent(grd, parents);}
    else if ("Ancestor Organism" == dijit.byId("colorMode").value) {
        DrawChildren(grd);
    }
    //else ChildGradient();}
    //Draw Selected as one of the last items to draw
    if (grd.flagSelected) { DrawSelected(grd) }
}

function DrawGridBackground(grd) {
    // Use the identity matrix while clearing the canvas    http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
    grd.cntx.setTransform(1, 0, 0, 1, 0, 0);
    grd.cntx.clearRect(0, 0, grd.CanvasGrid.width, grd.CanvasGrid.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
    //draw grey rectangle as back ground
    grd.cntx.fillStyle = dictColor["ltGrey"];
    grd.cntx.fillRect(0,0, grd.CanvasGrid.width, grd.CanvasGrid.height);

    //grd.cntx.translate(grd.xOffset, grd.yOffset);
    grd.cntx.fillStyle=dictColor['Black'];
    grd.cntx.fillRect(grd.xOffset,grd.yOffset,grd.sizeX,grd.sizeY);

    backgroundSquares(grd);
}

//--------------- Draw legend --------------------------------------
//Draws the color and name of each Ancestor (parent) organism
//to lay out the legend we need the width of the longest name and we
//allow for the width of the color box to see how many columns fit across
//the width of grd.CanvasScale. We will need to increase the size of the
//legend box by the height of a line for each additional line.
function drawLegend(grd, parents) {
    var legendPad = 10;   //padding on left so it is not right at edge of canvas
    var colorWide = 13;   //width and heigth of color square
    var RowHt = 20;       //height of each row of text
    var textOffset = 15;  //vertical offset to get to the bottom of the text
    var leftPad = 10;     //padding to allow space between each column of text in the legend
    var legendCols = 1;   //max number of columns based on width of canvas and longest name
    var txtWide = 0;      //width of text for an ancestor (parent) name
    var maxWide = 0;      //maximum width needed for any of the ancestor names in this set
    //console.log('in drawLedgend')
    grd.CanvasScale.width = $("#gridHolder").innerWidth()-6;
    grd.sCtx.font = "14px Arial";
    //find out how much space is needed
    for (ii=0; ii< parents.name.length; ii++) {
        txtWide = grd.sCtx.measureText(parents.name[ii]).width;
        if (txtWide > maxWide) { maxWide = txtWide }
    }
    legendCols = Math.trunc((grd.CanvasScale.width-leftPad)/(maxWide + colorWide + legendPad));
    if (Math.trunc(parents.name.length/legendCols) == parents.name.length/legendCols) {
        legendRows = Math.trunc(parents.name.length/legendCols);
    }
    else { legendRows = Math.trunc(parents.name.length/legendCols)+1; }
    //set canvas height based on space needed
    grd.CanvasScale.height = RowHt * legendRows;
    grd.sCtx.fillStyle = dictColor["ltGrey"];
    grd.sCtx.fillRect(0,0, grd.CanvasGrid.width, grd.CanvasGrid.height);
    var colWide = (grd.CanvasScale.width-leftPad)/legendCols
    var col = 0;
    var row = 0;
    for (ii = 0; ii< parents.name.length; ii++) {
        col = ii%legendCols;
        row = Math.trunc(ii/legendCols);
        //xx = leftPad + col*(maxWide+colorWide+legendPad);
        xx = leftPad + col*(colWide);
        yy = 2+row*RowHt;
        grd.sCtx.fillStyle = parents.color[ii];
        grd.sCtx.fillRect(xx,yy, colorWide, colorWide);
        yy = textOffset+row*RowHt;
        grd.sCtx.font = "14px Arial";
        grd.sCtx.fillStyle='black';
        grd.sCtx.fillText(parents.name[ii],xx+colorWide+legendPad/2, yy);
    }
}

//needs numbers from Avida
console.log('GradientScale');
function GradientScale(grd) {
    grd.CanvasScale.width = $("#gridHolder").innerWidth()-6;
    grd.CanvasScale.height = 30;
    grd.sCtx.fillStyle = dictColor["ltGrey"];
    grd.sCtx.fillRect(0,0, grd.CanvasScale.width, grd.CanvasScale.height);
    var xStart = 15;
    var xEnd = grd.CanvasScale.width - 2.5*xStart;
    var gradWidth = xEnd-xStart
    var grad = grd.sCtx.createLinearGradient(xStart+2, 0, xEnd-2, 0)
    var legendHt = 15;
    switch(grd.colorMap) {
        case "Viridis":
            for (var ii=0; ii < Viridis_cmap.length; ii++) {
                grad.addColorStop(ii/(Viridis_cmap.length-1), Viridis_cmap[ii]);
            }
            break;
        case 'Gnuplot2':
            for (var ii=0; ii < Gnuplot2_cmap.length; ii++) {
                grad.addColorStop(ii/(Gnuplot2_cmap.length-1), Gnuplot2_cmap[ii]);
            }
            break;
        case 'Cubehelix':
            for (var ii=0; ii < Cubehelix_cmap.length; ii++) {
                grad.addColorStop(ii/(Cubehelix_cmap.length-1), Cubehelix_cmap[ii]);
            }
            break;
    }
    grd.sCtx.fillStyle = grad;
    grd.sCtx.fillRect(xStart, legendHt, gradWidth, grd.CanvasScale.height-legendHt);
    //Draw Values if run started
    //if (!newrun) {
    if (true) {  grd.max = 805040;
        grd.sCtx.font = "14px Arial";
        grd.sCtx.fillStyle = "#000";
        var maxTxtWd = gradWidth/5;
        var place = 2;
        var xx = 0;
        var marks = 4;
        var txt = "";
        if (grd.max > 4000) {place = 0}
        else if (grd.max > 400) {place = 1}
        for (var ii= 0; ii<=marks; ii++) {
            xx = ii*grd.max/marks;
            txt = xx.formatNum(place);  //2 in this case is number of decimal places
            txtW = grd.sCtx.measureText(txt).width;
            xx = xStart + ii*gradWidth/marks-txtW/2;
            grd.sCtx.fillText(txt, xx, legendHt - 2, maxTxtWd);
        }
    }
    //part of colorTest, delete later
    grd.sCtx.beginPath();
    grd.sCtx.strokeStyle='#00FF00';
    grd.sCtx.moveTo(xStart, legendHt);
    grd.sCtx.lineTo(xStart+gradWidth, legendHt);
    grd.sCtx.stroke();
    grd.sCtx.beginPath();
    grd.sCtx.strokeStyle='#44FFFF';
    grd.sCtx.moveTo(xStart, grd.CanvasScale.height-1);
    grd.sCtx.lineTo(xStart+gradWidth, grd.CanvasScale.height-1);
    grd.sCtx.stroke();
    console.log('Take out after color test');
}