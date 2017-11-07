define([
    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/on',
    'dijit/focus',
    'dijit/form/NumberSpinner',
    'dijit/form/Select',
    'dijit/form/Button',
    'JBrowse/View/Dialog/WithActionBar'
],
function(
    declare,
    dom,
    on,
    focus,
    NumberSpinner,
    Select,
    Button,
    ActionBarDialog
) {
    return declare(ActionBarDialog, {
        title: 'SNP Actions',

        constructor: function(args) {
            this.tree= args.tree;
            this.color_by=args.color_by;
            this.setCallback     = args.setCallback || function() {};
            this.info=args.info;
        },

        _fillActionBar: function(actionBar) {
            new Button({
                label: 'OK',
                onClick: dojo.hitch(this, function() {
                     var tree_height = this.treeHeightSpinner.getValue();
                     this.setCallback && this.setCallback(tree_height,this.colorBySelect.getValue());
                    this.hide();
                })
            }).placeAt(actionBar);

            new Button({
                label: 'Cancel',
                onClick: dojo.hitch(this, function() {
                    this.cancelCallback && this.cancelCallback();
                    this.hide();
                })
            }).placeAt(actionBar);
        },

        show: function(/* callback */) {
            //dojo.addClass(this.domNode, 'windowSizeDialog');

            this.treeHeightSpinner = new NumberSpinner({
                value: this.tree.height,
                smallDelta: 10
            });
            var options = [
                    { label: 'Base', value: 'base', selected: true }
                ];
            for (var id in this.info){
                options.push({label:this.info[id]['description'],value:id});
            }
            this.colorBySelect = new Select({
                name: 'gc_mode_select',
                options:options ,
                value: this.color_by
            });

         

            this.set('content', [
                dom.create('p', { innerHTML: 'Set Height of Track and Color Scheme' }),
                dom.create('label', { for: 'window_size', innerHTML: 'Height', style: {display: 'inline-block', width: '100px'} }),
                this.treeHeightSpinner.domNode,
                dom.create('br'),
                dom.create('label', { for: 'window_delta', innerHTML: 'Color By', style: {display: 'inline-block', width: '100px' } }),
                this.colorBySelect.domNode
                /*dom.create('br'),
                dom.create('label', { for: 'gc_mode_select', innerHTML: 'GC Calculation Mode', style: {display: 'inline-block', width: '100px' } }),
                this.gcModeSelect.domNode,
                dom.create('br')*/
           
            ]);

            this.inherited(arguments);
        },

        hide: function() {
            this.inherited(arguments);
            window.setTimeout(dojo.hitch(this, 'destroyRecursive'), 500);
        }
    });
});
 