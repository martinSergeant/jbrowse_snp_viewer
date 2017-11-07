/**
 * Rectangle-layout manager that lays out rectangles using bitmaps at
 * resolution that, for efficiency, may be somewhat lower than that of
 * the coordinate system for the rectangles being laid out.  `pitchX`
 * and `pitchY` are the ratios of input scale resolution to internal
 * bitmap resolution.
 */

define(
    ['dojo/_base/declare','JBrowse/View/GranularRectLayout'],
    function( declare,GranularRectLayout ) {
return declare( GranularRectLayout,
{
    constructor: function(args) {
        this.height=args.tree.height+args.tree.row_height;
        this.pitchY=1;
        this.tree = args.tree;
    },

    /**
     * calculates height and top based on Y scale
     */
    addRect: function( id, left, right, height, data ) {

        // if we have already laid it out, return its layout
        if( id in this.rectangles ) {
            var storedRec = this.rectangles[id];
            if( storedRec.top === null )
                return null;

            // add it to the bitmap again, since that bitmap range may have been discarded
            this._addRectToBitmap( storedRec, data );
            return storedRec.top * this.pitchY;
        }

        var pLeft   = Math.floor( left   / this.pitchX );
        var pRight  = Math.floor( right  / this.pitchX );
      

        var midX = Math.floor((pLeft+pRight)/2);
        var rectangle = { id: id, l: pLeft, r: pRight, mX: midX, h: Math.ceil((this.tree.row_offset*2)+1) };
        if( data )
            rectangle.data = data;

     
	var top = Math.floor(this.tree.leaf_y_positions[data.data.tree_id]-this.tree.row_offset);
        
        rectangle.top = top;
        this._addRectToBitmap( rectangle, data );
        this.rectangles[id] = rectangle;
        return top;
       
    },
     getTotalHeight: function() {
        return this.tree.height+this.tree.row_height;;
    }
    
});
});
