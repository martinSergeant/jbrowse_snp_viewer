define([
		'dojo/_base/declare',
		'JBrowse/View/FeatureGlyph/Box',
                 'dojo/_base/lang'
       ],
       function(
		declare,
		Box,
                lang
       ) {


return declare(Box,{
        constructor: function( args ) {
               this.base_to_color={
                   "A":"green",
                   "T":"red",
                   "G":"black",
                   "C":"blue"
                       
               };
        },
     
    

    _getFeatureHeight: function( viewArgs, feature ) {
        return this.track.tree.row_height;
    },
    
     renderBox: function( context, viewInfo, feature, top, overallHeight, parentFeature, style ) {
        var left  = viewInfo.block.bpToX( feature.get('start') );
        var width = viewInfo.block.bpToX( feature.get('end') ) - left;
        //left = Math.round( left );
        //width = Math.round( width );

        style = style || lang.hitch( this, 'getStyle' );

        var height = this._getFeatureHeight( viewInfo, feature );
        if( ! height )
            return;
        if( height != overallHeight )
            top += Math.round( (overallHeight - height)/2 );

        // background
        
        var bgcolor = this.base_to_color[feature.data.base];
        if( bgcolor ) {
            context.fillStyle = bgcolor;
            context.fillRect( left, top, Math.max(2,width), height );
        }
        else {
            context.clearRect( left, top, Math.max(1,width), height );
        }

        // foreground border
        var borderColor, lineWidth;
        if( (borderColor = style( feature, 'borderColor' )) && ( lineWidth = style( feature, 'borderWidth')) ) {
            if( width > 3 ) {
                context.lineWidth = lineWidth;
                context.strokeStyle = borderColor;

                // need to stroke a smaller rectangle to remain within
                // the bounds of the feature's overall height and
                // width, because of the way stroking is done in
                // canvas.  thus the +0.5 and -1 business.
                context.strokeRect( left+lineWidth/2, top+lineWidth/2, width-lineWidth, height-lineWidth );
            }
            else {
                context.globalAlpha = lineWidth*2/width;
                context.fillStyle = borderColor;
                context.fillRect( left, top, Math.max(1,width), height );
                context.globalAlpha = 1;
            }
        }
    },
    
});
});
