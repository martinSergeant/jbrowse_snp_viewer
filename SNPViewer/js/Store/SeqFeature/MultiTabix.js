define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/promise/all',
    'dojo/Deferred',
    'JBrowse/Store/SeqFeature/VCFTabix',
    'JBrowse/Model/SimpleFeature'
],
function(
    declare,
    lang,
    array,
    all,
    Deferred,
    VCFTabix,
    SimpleFeature
) {
    return declare(VCFTabix, {
      
    constructor: function( args ) {
        this.browser = args.browser;
     
    },
    _getFeatures: function( query, featureCallback, finishedCallback, errorCallback ) {
        var thisB = this;
        var samples =this.header.samples;
        thisB.getVCFHeader().then( function() {
            thisB.indexedData.getLines(
                query.ref || thisB.refSeq.name,
                query.start,
                query.end,
                function( line ) {
                        var alts = line.fields[4].split(",");
			for (var a =9;a<line.fields.length;a++){
                            var gt= parseInt(line.fields[a]);
                            if (gt!==0){
                                var sample=samples[a-9];
                                var nf = new SimpleFeature({
                                
                              
                        	data: {
                                 	start:line.start,
                                	end:line.end,
                        		name:sample,
                        		seq_id:line.fields[0] ,
                                        base:alts[gt-1],
                        		description: "diii",
                                        uniqueID: sample+"_"+line.fields[2]
                                        
				}
                              
                   	 });
                           featureCallback( nf );
                                
                            }
                
                    
			}
                    //return f;
                },
                finishedCallback,
                errorCallback
            );
        }, errorCallback );
    }


     
    });
});
