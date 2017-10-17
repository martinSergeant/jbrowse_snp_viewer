/**
 * Just an HTMLFeatures track that uses the VariantDetailsMixin to
 * provide a variant-specific feature detail dialog.
 */

define([
    'dojo/_base/declare',
    'dojo/request/xhr',
    'dojo/_base/array',
    'JBrowse/View/Track/CanvasFeatures',
    'dojo/Deferred',
    'dojo/dom-construct',
    'JBrowse/util',
    'SNPViewer/View/SNPLayout',
    'SNPViewer/View/SNPGlyph',
    'SNPViewer/View/Tree'
    ],
    function(
        declare,
        xhr,
	array,
        CanvasFeatures,
        Deferred,
	domConstruct,
	Util,
	SNPLayout,
	SNPGlyph,
        Tree
      ){
    
    return declare( CanvasFeatures, {
            constructor: function(args) {
                var self = this;
                this.showLabels=false;
                this.nwk_file = this.config.nwk_file;
                var url = this.config.baseUrl+ this.nwk_file;
                this.config.style.strandArrow=false;
                this.config.maxFeatureScreenDensity=10;
                xhr.get(url,{sync:true})
               .then( function( data ) {
                   self.tree = new Tree(data);
                   self.tree.calculateTree(400,200,"poop");      
               });
               
            },
           
        
         

  setViewInfo: function( genomeView, heightUpdate, numBlocks, trackDiv, widthPct, widthPx, scale ) {
        this.inherited( arguments );
     
        this.treeCanvas = domConstruct.create('canvas', { style: {cursor: "default", position: "absolute", zIndex: -1 }}, trackDiv);
      
        this.treeCanvas.width = 200;
        this.treeCanvas.height=this.tree.height;
        var ctx = this.treeCanvas.getContext("2d");
        this.tree.drawTree(ctx);
     
       

       
    },
    updateStaticElements: function( coords ) {
        this.inherited( arguments );
        this.treeCanvas.style.left = coords.x+"px";
        
      
       

    },
 _getLayout: function( scale ) {
        if( ! this.layout || this._layoutpitchX != 4/scale ) {
            // if no layoutPitchY configured, calculate it from the
            // height and marginBottom (parseInt in case one or both are functions), or default to 3 if the
            // calculation didn't result in anything sensible.
            var pitchY = this.getConf('layoutPitchY') || 4;
            this.layout = new SNPLayout({ pitchX: 4/scale,tree:this.tree, maxHeight: this.getConf('maxHeight') });
            this._layoutpitchX = 4/scale;
        }

        return this.layout;
   },
 getGlyph: function( viewArgs, feature, callback, errorCallback ) {
        var glyphClassName = 'SNPViewer/View/SNPGlyph'; //this.getConfForFeature( 'glyph', feature );
        var glyph, interestedParties;
        if(( glyph = this.glyphsLoaded[glyphClassName] )) {
            callback( glyph );
        }
        else if(( interestedParties = this.glyphsBeingLoaded[glyphClassName] )) {
            interestedParties.push( callback );
        }
        else {
            var thisB = this;
            this.glyphsBeingLoaded[glyphClassName] = [callback];
            require( [glyphClassName], function( GlyphClass ) {

                         glyph = thisB.glyphsLoaded[glyphClassName] =
                             new GlyphClass({ track: thisB, config: thisB.config, browser: thisB.browser });

                         array.forEach( thisB.glyphsBeingLoaded[glyphClassName], function( cb ) {
                                            cb( glyph );
                                        });

                         delete thisB.glyphsBeingLoaded[glyphClassName];

                     });
        }
    }




});
});